import { AfterViewInit, Component, computed, inject, PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { LocalAuthService } from '../../services/local-auth.service';
import { UserStateService } from '../../services/user-state.service';
import { DeviceService } from '../../services/device.service';
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
export class NavbarComponent implements AfterViewInit {
  private readonly localAuthService = inject(LocalAuthService);
  private readonly userState = inject(UserStateService);
  private readonly platformId = inject(PLATFORM_ID);

  isMobile = inject(DeviceService).isMobile;

  signedIn = computed(() => this.userState.isLoggedIn());
  isAdmin = computed(() => this.userState.isAdmin());

  items: MenuItem[] | undefined = [];

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Build menu immediately with current state
      this.updateMenuItems(this.userState.isAdmin());

      this.localAuthService.userConnected
        .pipe(takeUntilDestroyed(this.localAuthService.destroyRef))
        .subscribe(() => {
          this.updateMenuItems(this.userState.isAdmin());
        });
    }
  }

  private updateMenuItems(admin: boolean): void {
    const base: MenuItem[] = [
      { label: 'My Recipes', routerLink: 'my-recipes' },
      { label: 'Favourite Recipes', routerLink: 'favourite-recipes' },
    ];
    if (admin) {
      base.push({ label: 'Categories', routerLink: 'manage-categories' });
    }
    base.push({ label: 'Sign Out', command: () => this.signOut() });
    this.items = base;
  }

  sign(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.localAuthService.signInWithGoogle().subscribe({
        error: (err) => console.error('Sign-in failed', err),
      });
    }
  }

  signOut(): void {
    this.localAuthService.signOut().subscribe({
      complete: () => {
        location.reload();
      },
    });
  }
}
