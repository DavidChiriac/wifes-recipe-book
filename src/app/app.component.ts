import { Component, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { isPlatformBrowser } from '@angular/common';
import { DeviceService } from './shared/services/device.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly platformId = inject(PLATFORM_ID);

  isMobile = inject(DeviceService).isMobile;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      if ('caches' in globalThis) {
        this.clearCaches();
      }
    }
  }

  private clearCaches(): void {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
}