import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';

export const socialAuthGuard: CanActivateFn = () => {
  const localStorage = inject(LocalStorageService);
  const router = inject(Router);

  const user = localStorage.retrieve('user');

  if (user) {
    return true;
  } else {
    router.navigate(['']);
    return false;
  }
};
