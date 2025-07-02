import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { IRecipe } from '../interfaces/recipe.interface';
import { environment } from '../../../environments/environment';
import qs from 'qs';
import { LocalStorageService } from 'ngx-webstorage';

@Injectable({
  providedIn: 'root',
})
export class RecipesService {
  recipesQuery = qs.stringify(
    {
      populate: ['coverImage', 'images', 'ingredients', 'preparationTime'],
    },
    {
      encodeValuesOnly: true,
    }
  );
  constructor(
    private readonly http: HttpClient,
    private readonly localStorageService: LocalStorageService
  ) {}

  getRecipes(params: {
    pageNumber: number | undefined;
    pageSize: number | undefined;
    sortField: string | undefined;
    sortDirection: string | undefined;
  }): Observable<{ data: IRecipe[]; meta: { total: number } }> {
    let sorting = '';
    if (params.sortDirection && params.sortField) {
      sorting += `&sort=${params.sortField}:${params.sortDirection}`;
    }
    return this.http
      .get<{ data: IRecipe[]; meta: { total: number } }>(
        environment.apiUrl +
          `/api/recipes?${this.recipesQuery}&pagination[page]=${params.pageNumber}&pagination[pageSize]=${params.pageSize}${sorting}`
      )
      .pipe(
        map((response) => {
          return {
            data: response.data.map((recipe) => this.mapRecipe(recipe)),
            meta: response.meta,
          };
        })
      );
  }

  getRecommendedRecipes(): Observable<IRecipe[]> {
    const query = qs.stringify(
      {
        populate: ['recipes', 'recipes.coverImage', 'recipes.images'],
      },
      {
        encodeValuesOnly: true,
      }
    );
    return this.http
      .get<{ data: { recipes: IRecipe[] } }>(
        environment.apiUrl + `/api/daily-selection?${query}`
      )
      .pipe(
        map((response) =>
          response.data.recipes?.map((recipe) => this.mapRecipe(recipe))
        )
      );
  }

  getSingleRecipe(slug: string): Observable<IRecipe> {
    return this.http
      .get<{ data: IRecipe[] }>(
        environment.apiUrl +
          `/api/recipes?filters[slug][$eq]=${slug}&${this.recipesQuery}`
      )
      .pipe(map((response) => this.mapRecipe(response.data[0])));
  }

  getMyRecipes(params: {
    pageNumber: number | undefined;
    pageSize: number | undefined;
    sortField: string | undefined;
    sortDirection: string | undefined;
  }): Observable<{ data: IRecipe[]; meta: { total: number } }> {
    let sorting = '';
    if (params.sortDirection && params.sortField) {
      sorting += `&sort=${params.sortField}:${params.sortDirection}`;
    }
    return this.http
      .get<{ data: IRecipe[]; meta: { total: number } }>(
        environment.apiUrl +
          `/api/recipes?${this.recipesQuery}&filters[author][email][$eq]=${
            this.localStorageService.retrieve('user').email
          }&pagination[page]=${params.pageNumber}&pagination[pageSize]=${
            params.pageSize
          }${sorting}`
      )
      .pipe(
        map((response) => {
          return {
            data: response.data.map((recipe) => this.mapRecipe(recipe)),
            meta: response.meta,
          };
        })
      );
  }

  createRecipe(
    recipe: IRecipe,
    existingImagesIds: { id: string; name: string; url: string }[] = []
  ): Observable<IRecipe> {
    return this.http
      .post<{ data: IRecipe }>(environment.apiUrl + '/api/recipes', {
        ...this.createRecipeMapper(recipe, existingImagesIds),
      })
      .pipe(map((recipe) => recipe.data));
  }

  editRecipe(
    recipe: IRecipe,
    existingImagesIds: { id: string; name: string; url: string }[] = []
  ): Observable<IRecipe> {
    return this.http
      .put<{ data: IRecipe }>(
        environment.apiUrl + '/api/recipes/' + recipe.id,
        {
          data: {
            ...this.createRecipeMapper(recipe, existingImagesIds),
          },
          meta: {},
        }
      )
      .pipe(map((recipe) => recipe.data));
  }

  deleteRecipe(recipe: IRecipe): Observable<void> {
    return of();
  }

  uploadImages(files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file, file.name);
    });
    return this.http.post(environment.apiUrl + '/api/upload', formData);
  }

  mapRecipe(recipe: any): IRecipe {
    return {
      id: recipe.documentId,
      coverImage: recipe.coverImage
        ? {
            url:
              (environment.prod ? '' : environment.apiUrl) +
              recipe?.coverImage?.url,
            id: recipe.coverImage?.id,
            name: recipe.coverImage?.name,
          }
        : undefined,
      title: recipe?.title,
      preparation: recipe?.preparation,
      ingredients: recipe?.ingredients,
      images: recipe?.images?.map(
        (image: { url: string; id: string; name: string }) => {
          return {
            url: (environment.prod ? '' : environment.apiUrl) + image.url,
            id: image.id,
            name: image.name,
          };
        }
      ),
      preparationTime: {
        hours: recipe?.preparationTime?.hours.toString(),
        minutes: recipe?.preparationTime?.minutes.toString(),
      },
      slug: recipe?.slug,
    };
  }

  createRecipeMapper(
    recipe: IRecipe,
    existingImagesIds: { id: string; name: string; url: string }[]
  ): any {
    console.log(recipe);
    const body = {
      ...recipe,
      ingredients: [
        ...recipe?.ingredients.map((ingredient) => {
          return { name: ingredient.name, quantity: ingredient.quantity };
        }),
      ],
      images: [
        ...(recipe.images ?? []),
        ...existingImagesIds.map((image) => image.id),
      ],
      coverImage: recipe.coverImage,
    };

    delete body['id'];
    delete body['slug'];
    delete body['documentId'];

    return {
      ...body,
    };
  }
}
