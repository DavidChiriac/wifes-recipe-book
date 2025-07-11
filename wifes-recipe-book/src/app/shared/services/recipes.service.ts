import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
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
      populate: [
        'coverImage',
        'images',
        'ingredients',
        'ingredients.ingredients',
        'preparation',
        'preparationTime',
        'author'
      ],
    },
    {
      encodeValuesOnly: true,
    }
  );

  constructor(
    private readonly http: HttpClient,
    private readonly localStorageService: LocalStorageService
  ) {}

  getRecipes(
    params: {
      pageNumber: number | undefined;
      pageSize: number | undefined;
      sortField: string | undefined;
      sortDirection: string | undefined;
    },
    searchTerm: string = ''
  ): Observable<{ data: IRecipe[]; meta: { total: number } }> {
    let queryParams = '';
    if (params.sortDirection && params.sortField) {
      queryParams += `&sort=${params.sortField}:${params.sortDirection}`;
    }
    if (searchTerm) {
      queryParams += `&filters[$or][0][title][$containsi]=${searchTerm}&filters[$or][1][preparation][$containsi]=${searchTerm}&filters[$or][2][ingredients][ingredients][name][$containsi]=${searchTerm}`;
    }
    return this.http
      .get<{ data: IRecipe[]; meta: { total: number } }>(
        environment.apiUrl +
          `/api/recipes?${this.recipesQuery}&pagination[page]=${params.pageNumber}&pagination[pageSize]=${params.pageSize}${queryParams}`
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

  getSingleRecipe(documentId: string): Observable<IRecipe> {
    return this.http
      .get<{ data: IRecipe[] }>(
        environment.apiUrl + `/api/recipes/${documentId}?${this.recipesQuery}`
      )
      .pipe(map((response) => this.mapRecipe(response.data)));
  }

  getMyRecipes(
    params: {
      pageNumber: number | undefined;
      pageSize: number | undefined;
      sortField: string | undefined;
      sortDirection: string | undefined;
    },
    searchTerm: string
  ): Observable<{ data: IRecipe[]; meta: { total: number } }> {
    let queryParams = '';
    if (params.sortDirection && params.sortField) {
      queryParams += `&sort=${params.sortField}:${params.sortDirection}`;
    }
    searchTerm = searchTerm.trim();
    if (searchTerm) {
      queryParams += `&filters[$and][1][$or][0][title][$containsi]=${searchTerm}&filters[$and][1][$or][1][preparation][$containsi]=${searchTerm}&filters[$and][1][$or][2][ingredients][ingredients][name][$containsi]=${searchTerm}`;
    }
    return this.http
      .get<{ data: IRecipe[]; meta: { total: number } }>(
        environment.apiUrl +
          `/api/recipes?${this.recipesQuery}&filters[$and][0][author][email][$eq]=${this.localStorageService.retrieve('user').email}&pagination[page]=${params.pageNumber}&pagination[pageSize]=${
            params.pageSize
          }${queryParams}`
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
        populate: ['coverImage'],
      },
      {
        encodeValuesOnly: true,
      }
    );
    return this.http
      .get<{ data: IRecipe[] }>(
        environment.apiUrl +
          `/api/recipes?filters[recommended][$eq]=true&${query}`
      )
      .pipe(
        map((response) =>
          response.data?.map((recipe) => this.mapRecipe(recipe))
        )
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

  deleteImage(id: string): Observable<void> {
    return this.http.delete<void>(
      environment.apiUrl + '/api/upload/files/' + id
    );
  }

  mapRecipe(recipe: any): IRecipe {
    return {
      ...recipe,
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
      author: recipe?.author
    };
  }

  createRecipeMapper(
    recipe: IRecipe,
    existingImages: { id: string; name: string; url: string }[]
  ): any {
    const body = {
      ...recipe,
      ingredients: [
        ...recipe?.ingredients.map((section) => {
          return {
            sectionName: section.sectionName,
            ingredients: section.ingredients.map((ingredient) => {
              return { name: ingredient.name, quantity: ingredient.quantity, calories: ingredient.calories };
            }),
          };
        }),
      ],
      images: [...(recipe.images ?? []), ...existingImages].map(
        (image) => image.id
      ),
      coverImage: recipe.coverImage?.id,
      preparation: recipe.preparation?.map(step => {return{step: step.step};}),
      totalCalories: this.calculateTotalCalories(recipe)
    };

    delete body['documentId'];

    return {
      ...body,
    };
  }

  calculateTotalCalories(recipe: IRecipe): number {
    if (!Array.isArray(recipe.ingredients)) return 0;

    return recipe.ingredients.reduce((total, section) => {
      if (!Array.isArray(section.ingredients)) return total;

      const sectionCalories = section.ingredients.reduce((sum, ingredient) => {
        return sum + (typeof ingredient.calories === 'number' ? ingredient.calories : 0);
      }, 0);

      return total + sectionCalories;
    }, 0);
  }
};
