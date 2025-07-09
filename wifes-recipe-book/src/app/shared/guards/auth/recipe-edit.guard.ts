import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';

export const RecipeEditGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const localStorage = inject(LocalStorageService);
  const router = inject(Router);

  const user = localStorage.retrieve('user');
  const recipeId = route.params['id'];

  if (user?.documentId === recipeId) {
    return true;
  } else {
    router.navigate(['']);
    return false;
  }
};
