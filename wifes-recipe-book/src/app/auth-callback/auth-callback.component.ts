import { ActivatedRoute, Router } from '@angular/router';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { LocalAuthService } from '../shared/services/local-auth.service';
import { LocalStorageService } from 'ngx-webstorage';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-auth-callback',
  template: `<span>Logging you in...</span>`,
})
export class AuthCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly localAuthService = inject(LocalAuthService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const jwt = params['access_token'];
      if (jwt) {
        this.localAuthService
          .connect(jwt)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (user) => {
              this.localStorageService.store('token', user.jwt);
              this.localStorageService.store('user', user.user);
              this.localAuthService.userConnected.emit(Boolean(user));
            },
            complete: () => {
              this.localStorageService.clear('recommendedRecipes');
              this.localStorageService.clear('recommendedRecipesTimestamp');
              this.router.navigate(['/']);
            },
          });
      }
    });
  }
}
