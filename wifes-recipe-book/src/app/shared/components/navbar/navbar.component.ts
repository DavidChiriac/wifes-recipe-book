import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { LocalStorageService } from 'ngx-webstorage';
import { TooltipModule } from 'primeng/tooltip';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LocalAuthService } from '../../services/local-auth.service';
import { environment } from '../../../../environments/environment';
import { DeviceDetectorService } from 'ngx-device-detector';

@UntilDestroy()
@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    ButtonModule,
    RouterModule,
    MenubarModule,
    TooltipModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  isMobile!: boolean;

  signedIn!: boolean;

  items: MenuItem[] | undefined;

  constructor(
    private readonly deviceService: DeviceDetectorService,
    private readonly localStorageService: LocalStorageService,
    private readonly localAuthService: LocalAuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = deviceService.isMobile();
    }

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
    if (isPlatformBrowser(this.platformId)) {
      const user = this.localStorageService.retrieve('user');

      if (user) {
        this.signedIn = true;
        this.localAuthService.userConnected.emit(true);
      }

      this.localAuthService.userConnected
        .pipe(untilDestroyed(this))
        .subscribe((connected) => (this.signedIn = connected));
    }
  }

  sign(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = environment.apiUrl + '/api/connect/google';
    }
  }

  signOut(): void {
    this.localStorageService.clear('token');
    this.localStorageService.clear('user');
    this.localAuthService.userConnected.emit(false);
    this.signedIn = false;
    location.reload();
  }
}
