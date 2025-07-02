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

  getSingleRecipe(documentId: string): Observable<IRecipe> {
    return this.http
      .get<{ data: IRecipe[] }>(
        environment.apiUrl + `/api/recipes/${documentId}?${this.recipesQuery}`
      )
      .pipe(map((response) => this.mapRecipe(response.data)));
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
    existingImages: { id: string; name: string; url: string }[] = []
  ): Observable<IRecipe> {
    return this.http
      .post<{ data: IRecipe }>(environment.apiUrl + '/api/recipes', {
        data: {
          ...this.createRecipeMapper(recipe, existingImages),
          author: this.localStorageService.retrieve('user').documentId,
        },
        meta: {},
      })
      .pipe(map((recipe) => recipe.data));
  }

  editRecipe(
    recipe: IRecipe,
    existingImages: { id: string; name: string; url: string }[] = []
  ): Observable<IRecipe> {
    return this.http
      .put<{ data: IRecipe }>(
        environment.apiUrl + '/api/recipes/' + recipe.documentId,
        {
          data: {
            ...this.createRecipeMapper(recipe, existingImages),
          },
          meta: {},
        }
      )
      .pipe(map((recipe) => recipe.data));
  }

  deleteRecipe(documentId: string): Observable<void> {
    return this.http.delete<void>(
      environment.apiUrl + `/api/recipes/${documentId}`
    );
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
      documentId: recipe?.documentId,
      coverImage: recipe?.coverImage
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
    };
  }

  createRecipeMapper(
    recipe: IRecipe,
    existingImages: { id: string; name: string; url: string }[]
  ): any {
    const body = {
      ...recipe,
      ingredients: [
        ...recipe?.ingredients.map((ingredient) => {
          return { name: ingredient.name, quantity: ingredient.quantity };
        }),
      ],
      images: [...(recipe.images ?? []), ...existingImages].map(
        (image) => image.id
      ),
      coverImage: recipe.coverImage,
    };

    delete body['documentId'];

    return {
      ...body,
    };
  }
}
