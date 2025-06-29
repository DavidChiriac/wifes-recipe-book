import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IRecipe } from '../interfaces/recipe.interface';

@Injectable({
  providedIn: 'root',
})
export class RecipesService {
  constructor(private readonly http: HttpClient) {}

  getRecipes(): Observable<IRecipe[]> {
    return of([]);
  }

  getRecommendedRecipes(): Observable<IRecipe[]> {
    return of([]);
  }

  getSingleRecipe(slug: string): Observable<IRecipe> {
    return of();
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
}
