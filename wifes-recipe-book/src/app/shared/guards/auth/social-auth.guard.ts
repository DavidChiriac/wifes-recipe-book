import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { LocalAuthService } from '../../services/local-auth.service';
import { LocalStorageService } from 'ngx-webstorage';

export const socialAuthGuard: CanActivateFn = () => {
  const authService = inject(LocalAuthService);
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
