import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { LocalAuthService } from '../shared/services/local-auth.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LocalStorageService } from 'ngx-webstorage';

@UntilDestroy()
@Component({
  selector: 'app-auth-callback',
  template: `<span>Logging you in...</span>`,
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private readonly localAuthService: LocalAuthService,
    private readonly localStorageService: LocalStorageService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const jwt = params['access_token'];
      if (jwt) {
        this.localAuthService
          .connect(jwt)
          .pipe(untilDestroyed(this))
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
