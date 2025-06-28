import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DeviceService } from '../../services/device.service';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import {
  GoogleSigninButtonModule,
  SocialAuthService,
} from '@abacritt/angularx-social-login';
import { SocialUser } from '@abacritt/angularx-social-login';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LocalAuthService } from '../../services/local-auth.service';
import { LocalStorageService } from 'ngx-webstorage';
import { TooltipModule } from 'primeng/tooltip';

@UntilDestroy()
@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    ButtonModule,
    RouterModule,
    MenubarModule,
    GoogleSigninButtonModule,
    TooltipModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  isMobile!: boolean;

  signedIn!: boolean;
  user!: SocialUser;

  items: MenuItem[] | undefined;

  constructor(
    private readonly deviceService: DeviceService,
    private readonly authService: SocialAuthService,
    private readonly localAuthService: LocalAuthService,
    private readonly localStorageService: LocalStorageService
  ) {
    this.isMobile = deviceService.isMobile();

    this.items = [
      {
        label: 'My Recipes',
        routerLink: 'my-recipes',
      },
      {
        label: 'Sign Out',
        command: () => {
          this.signOut();
        },
      },
    ];
  }

  ngOnInit(): void {
    this.signIn();
  }

  signIn(): void {
    const cachedUser = this.localStorageService.retrieve('user');

    if (!cachedUser) {
      this.authService.authState.pipe(untilDestroyed(this)).subscribe({
        next: (user) => {
          console.log(user);
          this.localStorageService.store('user', user);
          this.localAuthService.user$.next(user);
          this.user = user;
          this.signedIn = Boolean(user);
        },
      });
    } else {
      this.localAuthService.user$.next(cachedUser);
      this.user = cachedUser;
      this.signedIn = Boolean(cachedUser);
    }
  }

  signOut(): void {
    this.localStorageService.clear('user');
    this.signIn();
  }
}
