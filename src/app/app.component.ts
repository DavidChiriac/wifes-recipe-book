import { Component, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { isPlatformBrowser } from '@angular/common';
import { DeviceService } from './shared/services/device.service';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

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
      if (Capacitor.isNativePlatform()) {
        this.configureStatusBar();
      }
    }
  }

  private async configureStatusBar(): Promise<void> {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0C1220' });
  }

  private clearCaches(): void {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
}