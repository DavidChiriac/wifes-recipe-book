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
  private readonly CACHE_KEY = 'recommendedRecipes';
  private readonly TIMESTAMP_KEY = 'recommendedRecipesTimestamp';
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  recipesQuery = qs.stringify(
    {
      populate: [
        'coverImage',
        'images',
        'ingredients',
        'ingredients.ingredients',
        'preparation',
        'author',
        'categories',
        'categories.icon',
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
      category: string[];
      minMinutes?: number;
      maxMinutes?: number;
    },
    searchTerm: string = ''
  ): Observable<{ data: IRecipe[]; total: number }> {
    let queryParams = '';

    if (params.sortDirection && params.sortField) {
      queryParams += `&sort=${params.sortField}:${params.sortDirection}`;
    }

    if (searchTerm) {
      queryParams += `&filters[$and][0][$or][0][title][$containsi]=${searchTerm}&filters[$and][0][$or][1][preparation][$containsi]=${searchTerm}&filters[$and][0][$or][2][ingredients][ingredients][name][$containsi]=${searchTerm}`;
    }

    params.category.forEach((category, index) => {
      queryParams += `&filters[$and][1][$or][${index}][categories][name][$eq]=${category}`;
    });

    if(params.minMinutes){
      queryParams += `&filters[$and][2][minutes][$gte]=${params.minMinutes}`;
    }

    if(params.maxMinutes){
      queryParams += `&filters[$and][2][minutes][$lte]=${params.maxMinutes}`;
    }
    
    return this.http
      .get<{ data: IRecipe[]; meta: { pagination: { total: number } } }>(
        environment.apiUrl +
          `/api/recipes?${this.recipesQuery}&pagination[page]=${params.pageNumber}&pagination[pageSize]=${params.pageSize}${queryParams}`
      )
      .pipe(
        map((response) => {
          return {
            data: response.data.map((recipe) => this.mapRecipe(recipe)),
            total: response.meta.pagination.total,
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
  ): Observable<{ data: IRecipe[]; total: number }> {
    let queryParams = '';
    if (params.sortDirection && params.sortField) {
      queryParams += `&sort=${params.sortField}:${params.sortDirection}`;
    }
    searchTerm = searchTerm.trim();
    if (searchTerm) {
      queryParams += `&filters[$and][1][$or][0][title][$containsi]=${searchTerm}&filters[$and][1][$or][1][preparation][$containsi]=${searchTerm}&filters[$and][1][$or][2][ingredients][ingredients][name][$containsi]=${searchTerm}`;
    }
    return this.http
      .get<{ data: IRecipe[]; meta: { pagination: { total: number } } }>(
        environment.apiUrl +
          `/api/recipes?${this.recipesQuery}&filters[$and][0][author][email][$eq]=${this.localStorageService.retrieve('user').email}&pagination[page]=${params.pageNumber}&pagination[pageSize]=${
            params.pageSize
          }${queryParams}`
      )
      .pipe(
        map((response) => {
          return {
            data: response.data.map((recipe) => this.mapRecipe(recipe)),
            total: response.meta.pagination.total,
          };
        })
      );
  }

  getRecommendedRecipes(): Observable<IRecipe[]> {
    const cachedData = this.localStorageService.retrieve(this.CACHE_KEY);
    const cachedTimestamp = this.localStorageService.retrieve(this.TIMESTAMP_KEY);

    const isCacheValid = cachedData && cachedTimestamp && (Date.now() - +cachedTimestamp < this.CACHE_TTL);

    if (isCacheValid) {
      return of(cachedData);
    } else {
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
          map((response) => {
              const data = response?.data?.map(recipe => this.mapRecipe(recipe));
              this.localStorageService.store(this.CACHE_KEY, data);
              this.localStorageService.store(this.TIMESTAMP_KEY, Date.now().toString());
              return data;
            }
          )
        );
    }
  }

  getFavouriteRecipes(): Observable<IRecipe[]> {
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
            `/api/recipes?filters[users][$in]=${this.localStorageService.retrieve('user').id}&${query}`
        )
        .pipe(
          map((response) => {
              const data = response?.data?.map(recipe => this.mapRecipe(recipe));
              return data;
            }
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
      categories: recipe?.categories?.map((category: any) => ({
        name: category.name,
        icon: environment.prod ? category.icon.url : (environment.apiUrl + category.icon.url),
        id: category.id,
      })),
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
      minutes: recipe?.minutes,
      author: recipe?.author
    };
  }

  createRecipeMapper(
    recipe: IRecipe,
    existingImages: { id: string; name: string; url: string }[]
  ): any {
    const body = {
      ...recipe,
      categories: recipe.categories.map((category) => ({
        id: category.id,
      })),
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
      if (!Array.isArray(section.ingredients)) return total ?? 0;

      const sectionCalories = section.ingredients.reduce((sum, ingredient) => {
        return sum + (typeof ingredient.calories === 'number' ? (Number.isNaN(ingredient.calories) ? 0 : ingredient.calories) : 0);
      }, 0);

      return total + sectionCalories;
    }, 0);
  }

  toggleFavourite(id: string, isFavourite: boolean): Observable<void>{
    return this.http.put<void>(environment.apiUrl + '/api/recipes/favourite/' + id , { data: {isFavourite: isFavourite}});
  }

  getCategories(): Observable<{name: string, icon: string, id: string}[]> { 
    return this.http.get<{data: { name: string, icon: {url: string}, id: string}[]}>(environment.apiUrl + '/api/categories?populate=*').pipe(
      map(response => {
        return response.data.map(category => ({
          name: category.name,
          icon: environment.prod ? category.icon?.url : (environment.apiUrl + category.icon?.url),
          id: category.id
        }));
      })
    );
  }
}
