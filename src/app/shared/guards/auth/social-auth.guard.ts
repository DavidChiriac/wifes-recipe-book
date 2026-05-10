import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserStateService } from '../../services/user-state.service';

export const socialAuthGuard: CanActivateFn = () => {
  const userState = inject(UserStateService);
  const router = inject(Router);

  if (userState.isLoggedIn()) {
    return true;
  } else {
    router.navigate(['']);
    return false;
  }
};
