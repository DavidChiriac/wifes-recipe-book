import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { IRecipe } from '../interfaces/recipe.interface';
import { environment } from '../../../environments/environment';
import qs from 'qs';

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
  constructor(private readonly http: HttpClient) {}

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

  createRecipe(recipe: IRecipe): Observable<IRecipe> {
    return of();
  }

  editRecipe(recipe: IRecipe): Observable<IRecipe> {
    return of();
  }

  deleteRecipe(recipe: IRecipe): Observable<void> {
    return of();
  }

  mapRecipe(recipe: any): IRecipe {
    return {
      coverImageUrl:
        (environment.prod ? '' : environment.apiUrl) + recipe.coverImage.url,
      title: recipe.title,
      preparation: recipe.preparation,
      ingredients: recipe.ingredients,
      imagesUrls: recipe.images?.map(
        (image: { url: string }) =>
          (environment.prod ? '' : environment.apiUrl) + image.url
      ),
      preparationTime: {
        hours: recipe.preparationTime?.hours.toString(),
        minutes: recipe.preparationTime?.minutes.toString(),
      },
      slug: recipe.slug,
    };
  }
}
