import { AfterViewInit, Component, computed, ElementRef, HostListener, inject, PLATFORM_ID, signal } from '@angular/core';
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

  private readonly elRef = inject(ElementRef);
  isMobile = inject(DeviceService).isMobile;

  menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.menuOpen() && !this.elRef.nativeElement.contains(event.target)) {
      this.menuOpen.set(false);
    }
  }

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
    ];
    if (admin) {
      base.push({ label: 'Categories', routerLink: 'manage-categories' }, { label: 'Users', routerLink: 'manage-users' });
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
