import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { WebstorageSsrService } from '../../services/webstorage-ssr.service';

export const socialAuthGuard: CanActivateFn = () => {
  const localStorage = inject(WebstorageSsrService);
  const router = inject(Router);

  const user = localStorage.getFromLocalStorage('user', false);

  if (user) {
    return true;
  } else {
    router.navigate(['']);
    return false;
  }
};
