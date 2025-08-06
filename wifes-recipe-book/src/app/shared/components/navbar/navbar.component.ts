import { Component, computed, inject, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { LocalStorageService } from 'ngx-webstorage';
import { TooltipModule } from 'primeng/tooltip';
import { LocalAuthService } from '../../services/local-auth.service';
import { environment } from '../../../../environments/environment';
import { DeviceDetectorService } from 'ngx-device-detector';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  private readonly localStorageService = inject(LocalStorageService);
  private readonly localAuthService = inject(LocalAuthService);
  private readonly deviceService = inject(DeviceDetectorService);
  private readonly platformId = inject(PLATFORM_ID);

  isMobile = computed(() => isPlatformBrowser(this.platformId) && this.deviceService.isMobile());

  signedIn = signal<boolean>(false);

  items: MenuItem[] | undefined = [
      {
        label: 'My Recipes',
        routerLink: 'my-recipes',
      },
      {
        label: 'Favourite Recipes',
        routerLink: 'favourite-recipes',
      },
      {
        label: 'Sign Out',
        command: () => {
          this.signOut();
        },
      },
    ];

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const user = this.localStorageService.retrieve('user');

      if (user) {
        this.signedIn.set(true);
        this.localAuthService.userConnected.emit(true);
      }

      this.localAuthService.userConnected
        .pipe(takeUntilDestroyed(this.localAuthService.destroyRef))
        .subscribe((connected: boolean) => (this.signedIn.set(connected)));
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
    this.signedIn.set(false);
    location.reload();
  }
}
