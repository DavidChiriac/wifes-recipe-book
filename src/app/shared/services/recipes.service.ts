import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { from, map, Observable, of } from 'rxjs';
import { IRecipe } from '../interfaces/recipe.interface';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getDocs,
  limit as fsLimit,
  orderBy,
  query,
  QueryConstraint,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '../../../environments/environment';
import { CategoriesService } from './categories.service';
import { UserStateService } from './user-state.service';

/**
 * Firestore-backed implementation of the recipes API.
 *
 * The public surface (method names, inputs, return shapes) intentionally
 * mirrors the previous Strapi-based service so existing components keep
 * working without changes. `documentId` is the Firestore document id and
 * is set equal to `id` in returned objects.
 */
@Injectable({
  providedIn: 'root',
})
export class RecipesService {
  private readonly firestore = inject(Firestore);
  private readonly http = inject(HttpClient);
  private readonly categoriesService = inject(CategoriesService);
  private readonly userState = inject(UserStateService);

  // --------------------------------------------------------------------
  // Reads
  // --------------------------------------------------------------------

  /**
   * Get a paginated, filtered, searched & sorted list of recipes.
   *
   * NOTE: Firestore has no native full-text search, so `searchTerm` is
   * applied client-side over the matched page (after Firestore filtering).
   * For large datasets, plug in Algolia/Typesense via a Cloud Function.
   */
  getRecipes(
    params: {
      pageNumber: number | undefined;
      pageSize: number | undefined;
      sortField: string | undefined;
      category: string[];
      minMinutes?: number;
      maxMinutes?: number;
      authorId?: string;
    },
    searchTerm: string = ''
  ): Observable<{ data: IRecipe[]; total: number }> {
    return this.queryRecipes(params, searchTerm, params.authorId);
  }

  getSingleRecipe(documentId: string): Observable<IRecipe> {
    const ref = doc(this.firestore, 'recipes', documentId);
    return from(getDoc(ref)).pipe(
      map((snap) => {
        if (!snap.exists()) {
          throw new Error('Recipe not found');
        }
        const recipe = this.mapRecipe({ id: snap.id, ...(snap.data() as any) });
        const user = this.userState.user();
        if (user?.uid && Array.isArray(user?.favourites)) {
          recipe.isFavourite = user.favourites.includes(snap.id);
        }
        return recipe;
      })
    );
  }

  getMyRecipes(
    params: {
      pageNumber: number | undefined;
      pageSize: number | undefined;
      sortField: string | undefined;
      category: string[];
      minMinutes?: number;
      maxMinutes?: number;
    },
    searchTerm: string
  ): Observable<{ data: IRecipe[]; total: number }> {
    const user = this.userState.user();
    return this.queryRecipes(params, searchTerm, user?.uid);
  }

  getFavouriteRecipes(): Observable<IRecipe[]> {
    const ids: string[] = this.userState.favourites();
    if (!ids.length) return of([]);

    // Firestore `in` is limited to 30 ids per query — chunk if needed.
    const chunks: string[][] = [];
    for (let i = 0; i < ids.length; i += 30) chunks.push(ids.slice(i, i + 30));

    const recipesRef = collection(this.firestore, 'recipes');
    const requests = chunks.map((chunk) =>
      getDocs(query(recipesRef, where('__name__', 'in', chunk)))
    );

    return from(Promise.all(requests)).pipe(
      map((snaps) =>
        snaps.flatMap((s) =>
          s.docs.map((d) => this.mapRecipe({ id: d.id, ...d.data() }))
        )
      )
    );
  }

  getCategories(): Observable<{ name: string; icon: string; id: string }[]> {
    return this.categoriesService.getCategories();
  }

  /**
   * Returns up to 4 random recipes per category id, keyed by category id.
   * Implemented client-side: fetches all recipes per category and samples.
   */
  getRandomRecipesByCategory(
    categoryIds: string[]
  ): Observable<{ [key: string]: IRecipe[] }> {
    if (!categoryIds?.length) return of({});

    const recipesRef = collection(this.firestore, 'recipes');
    const requests = categoryIds.map((id) =>
      getDocs(
        query(recipesRef, where('categoryIds', 'array-contains', id))
      ).then((snap) => ({
        id,
        recipes: snap.docs.map((d) =>
          this.mapRecipe({ id: d.id, ...d.data() })
        ),
      }))
    );

    return from(Promise.all(requests)).pipe(
      map((results) => {
        const out: { [key: string]: IRecipe[] } = {};
        results.forEach(({ id, recipes }) => {
          out[id] = [...recipes].sort(() => Math.random() - 0.5).slice(0, 4);
        });
        return out;
      })
    );
  }

  // --------------------------------------------------------------------
  // Writes
  // --------------------------------------------------------------------

  createRecipe(
    recipe: IRecipe,
    existingImages: { id: string; name: string; url: string }[] = []
  ): Observable<IRecipe> {
    const user = this.userState.user();
    const payload = this.toFirestorePayload(recipe, existingImages, user);
    const recipesRef = collection(this.firestore, 'recipes');
    return from(addDoc(recipesRef, payload)).pipe(
      map((docRef) => ({
        ...recipe,
        id: docRef.id,
        documentId: docRef.id,
      }))
    );
  }

  editRecipe(
    recipe: IRecipe,
    existingImages: { id: string; name: string; url: string }[] = []
  ): Observable<IRecipe> {
    const id = recipe.documentId!;
    const payload = this.toFirestorePayload(recipe, existingImages, undefined, true);
    const docRef = doc(this.firestore, 'recipes', id);
    return from(updateDoc(docRef, payload)).pipe(
      map(() => ({ ...recipe, id, documentId: id }))
    );
  }

  deleteRecipe(documentId: string): Observable<void> {
    const docRef = doc(this.firestore, 'recipes', documentId);
    return from(deleteDoc(docRef));
  }

  // --------------------------------------------------------------------
  // Images (ImgBB)
  // --------------------------------------------------------------------

  /**
   * Uploads files to ImgBB.
   * Returns the same shape as the previous upload endpoint:
   *   [{ id, name, url }]
   * `id` is the ImgBB image id (delete is not available on the free API).
   */
  uploadImages(
    files: File[]
  ): Observable<{ id: string; name: string; url: string }[]> {
    const uploads = files.map((file) => {
      return new Promise<{ id: string; name: string; url: string }>(
        (resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            const formData = new FormData();
            formData.append('image', base64);
            formData.append('name', `${uuidv4()}-${file.name}`);

            this.http
              .post<any>(
                `https://api.imgbb.com/1/upload?key=${environment.imgbbApiKey}`,
                formData
              )
              .subscribe({
                next: (res) =>
                  resolve({
                    id: res.data.id,
                    name: file.name,
                    url: res.data.url,
                  }),
                error: (err) => reject(err),
              });
          };
          reader.onerror = () =>
            reject(reader.error ?? new Error('Failed to read file.'));
          reader.readAsDataURL(file);
        }
      );
    });

    return from(Promise.all(uploads));
  }

  /**
   * ImgBB free tier does not support image deletion via API.
   * This is a no-op kept for backward compatibility with components
   * that call deleteImage before removing a recipe.
   */
  deleteImage(_id: string): Observable<void> {
    return of(undefined);
  }

  // --------------------------------------------------------------------
  // Favourites
  // --------------------------------------------------------------------

  toggleFavourite(recipeId: string, isFavourite: boolean): Observable<void> {
    const user = this.userState.user();
    if (!user?.uid) return of(undefined);

    const userRef = doc(this.firestore, 'users', user.uid);
    const favourites: string[] = [...user.favourites];

    const next = isFavourite
      ? Array.from(new Set([...favourites, recipeId]))
      : favourites.filter((id) => id !== recipeId);

    return from(
      setDoc(userRef, { favourites: next }, { merge: true })
    ).pipe(
      map(() => {
        this.userState.updateFavourites(next);
        return undefined;
      })
    );
  }

  // --------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------

  /**
   * Build a Firestore query honoring filters, then apply sorting,
   * client-side search, and pagination.
   */
  private queryRecipes(
    params: {
      pageNumber: number | undefined;
      pageSize: number | undefined;
      sortField: string | undefined;
      category: string[];
      minMinutes?: number;
      maxMinutes?: number;
    },
    searchTerm: string,
    authorUid?: string
  ): Observable<{ data: IRecipe[]; total: number }> {
    const constraints: QueryConstraint[] = [];

    if (authorUid) {
      constraints.push(where('authorId', '==', authorUid));
    }

    // Firestore array-contains supports a single value; for multi-category
    // OR semantics use array-contains-any (max 30).
    if (params.category?.length === 1) {
      constraints.push(where('categoryNames', 'array-contains', params.category[0]));
    } else if (params.category?.length > 1) {
      constraints.push(
        where('categoryNames', 'array-contains-any', params.category.slice(0, 30))
      );
    }

    if (params.minMinutes != null) {
      constraints.push(where('minutes', '>=', params.minMinutes));
    }
    if (params.maxMinutes != null) {
      constraints.push(where('minutes', '<=', params.maxMinutes));
    }

    if (params.sortField) {
      const [field, direction] = params.sortField.split('_');
      const safeField =
        field === 'createdAt' || field === 'minutes' || field === 'totalCalories'
          ? field
          : null;
      if (safeField) {
        constraints.push(
          orderBy(safeField, direction === 'asc' ? 'asc' : 'desc')
        );
      }
    } else if (params.minMinutes == null && params.maxMinutes == null) {
      constraints.push(orderBy('createdAt', 'desc'));
    }

    // Cap fetched docs to avoid pulling the whole collection.
    constraints.push(fsLimit(500));

    const q = query(collection(this.firestore, 'recipes'), ...constraints);

    return from(getDocs(q)).pipe(
      map((snap) => {
        let recipes = snap.docs.map((d) =>
          this.mapRecipe({ id: d.id, ...d.data() })
        );

        // Mark favourites from user state
        const user = this.userState.user();
        if (user?.uid && Array.isArray(user?.favourites)) {
          const favs = new Set<string>(user.favourites);
          recipes = recipes.map((r) =>
            favs.has(r.id ?? '') ? { ...r, isFavourite: true } : r
          );
        }

        // Client-side search across title, ingredients, preparation
        const term = (searchTerm || '').trim().toLowerCase();
        if (term) {
          recipes = recipes.filter((r) => this.matchesTerm(r, term));
        }

        // Client-side sort for title (Firestore ordering is case-sensitive)
        if (params.sortField) {
          const [field, direction] = params.sortField.split('_');
          if (field === 'title') {
            const dir = direction === 'asc' ? 1 : -1;
            recipes = recipes.sort((a, b) =>
              dir * (a.title ?? '').localeCompare(b.title ?? '', undefined, { sensitivity: 'base' })
            );
          }
        }

        const total = recipes.length;

        // Pagination (client-side over the filtered set)
        const page = Math.max(1, params.pageNumber ?? 1);
        const size = Math.max(1, params.pageSize ?? 10);
        const start = (page - 1) * size;
        const data = recipes.slice(start, start + size);

        return { data, total };
      })
    );
  }

  /**
   * Map a raw Firestore recipe document into the IRecipe shape used by the UI.
   */
  mapRecipe(recipe: any): IRecipe {
    const id = recipe?.id ?? recipe?.documentId;
    return {
      ...recipe,
      id,
      documentId: id,
      title: recipe?.title,
      categories: recipe?.categories ?? [],
      preparation: recipe?.preparation ?? [],
      ingredients: recipe?.ingredients ?? [],
      coverImage: recipe?.coverImage ?? undefined,
      images: recipe?.images ?? [],
      minutes: recipe?.minutes,
      author: recipe?.author,
      totalCalories: recipe?.totalCalories,
      isFavourite: recipe?.isFavourite ?? false,
    };
  }

  /**
   * Build a Firestore-friendly payload from the IRecipe form value.
   * Stores denormalized `categoryIds` and `categoryNames` arrays so we can
   * filter recipes by category with array-contains queries.
   */
  private toFirestorePayload(
    recipe: IRecipe,
    existingImages: { id: string; name: string; url: string }[],
    user?: any,
    isUpdate = false
  ): any {
    const allImages = [
      ...(recipe.images ?? []),
      ...(existingImages ?? []),
    ].filter(Boolean);

    const categories = (recipe.categories ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon ?? '',
    }));

    const payload: any = {
      title: recipe.title,
      categories,
      categoryIds: categories.map((c) => c.id),
      categoryNames: categories.map((c) => c.name),
      preparation: (recipe.preparation ?? []).map((step) => ({
        step: step.step ?? '',
      })),
      ingredients: (recipe.ingredients ?? []).map((section) => ({
        sectionName: section.sectionName ?? '',
        ingredients: (section.ingredients ?? []).map((i) => ({
          name: i.name,
          quantity: i.quantity ?? '',
          calories: typeof i.calories === 'number' && !Number.isNaN(i.calories) ? i.calories : 0,
        })),
      })),
      images: allImages,
      coverImage: recipe.coverImage ?? null,
      minutes: recipe.minutes ?? 0,
      totalCalories: this.calculateTotalCalories(recipe),
      updatedAt: serverTimestamp(),
    };

    if (!isUpdate) {
      payload.createdAt = serverTimestamp();
      if (user?.uid) {
        payload.authorId = user.uid;
        payload.author = {
          documentId: user.uid,
          uid: user.uid,
          email: user.email ?? null,
          displayName: user.displayName ?? user.name ?? null,
        };
      }
    }

    return payload;
  }

  private matchesTerm(recipe: IRecipe, term: string): boolean {
    if (recipe.title?.toLowerCase().includes(term)) return true;
    if (
      recipe.preparation?.some((p) =>
        (p.step ?? '').toLowerCase().includes(term)
      )
    ) {
      return true;
    }
    const ingredientNames = (recipe.ingredients ?? []).flatMap((s) =>
      (s.ingredients ?? []).map((i) => i.name ?? '')
    );
    return ingredientNames.some((name) => name.toLowerCase().includes(term));
  }

  calculateTotalCalories(recipe: IRecipe): number {
    if (!Array.isArray(recipe.ingredients)) return 0;
    return recipe.ingredients.reduce((total, section) => {
      if (!Array.isArray(section.ingredients)) return total ?? 0;
      const sectionCalories = section.ingredients.reduce((sum, ingredient) => {
        const cal = ingredient.calories;
        return sum + (typeof cal === 'number' && !Number.isNaN(cal) ? cal : 0);
      }, 0);
      return total + sectionCalories;
    }, 0);
  }
}
