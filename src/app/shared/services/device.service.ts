import { DestroyRef, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);

  isMobile = signal<boolean | undefined>(undefined);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.breakpointObserver
      .observe('(max-width: 767px)')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => this.isMobile.set(state.matches));
  }
}
