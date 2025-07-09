import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { RecipesService } from '../../services/recipes.service';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const RecipeEditGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const localStorage = inject(LocalStorageService);
  const recipesService = inject(RecipesService);
  const router = inject(Router);

  const user = localStorage.retrieve('user');
  const recipeId = route.params['id'];

  return recipesService.getSingleRecipe(recipeId).pipe(
    map(recipe => {
      const isOwner = user?.documentId === recipe.author?.documentId;
      const isAdmin = user?.roles?.includes('Admin'); // Adjust based on your user object
      if (isOwner || isAdmin) {
        return true;
      } else {
        router.navigate(['']);
        return false;
      }
    }),
    catchError(() => {
      router.navigate(['']);
      return of(false);
    })
  );
};
