import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { RecipesService } from '../../services/recipes.service';
import { UserStateService } from '../../services/user-state.service';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const RecipeEditGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const userState = inject(UserStateService);
  const recipesService = inject(RecipesService);
  const router = inject(Router);

  const user = userState.user();
  const recipeId = route.params['id'];

  return recipesService.getSingleRecipe(recipeId).pipe(
    map(recipe => {
      const isOwner = user?.documentId === recipe.author?.documentId;
      const isAdmin = !!user?.isAdmin;
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
