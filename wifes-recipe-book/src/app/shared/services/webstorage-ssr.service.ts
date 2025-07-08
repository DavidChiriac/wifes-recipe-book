import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';

@Injectable({
  providedIn: 'root',
})
export class WebstorageSsrService {
  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private localSt: LocalStorageService
  ) {}

  getFromLocalStorage(key: string, defaultValue: any): any {
    if (isPlatformBrowser(this.platformId)) {
      const item = this.localSt.retrieve(key);
      return item ?? defaultValue;
    }
    
    return defaultValue;
  }

  setToLocalStorage(key: string, value: any): void {
    if (isPlatformBrowser(this.platformId)) {
      this.localSt.store(key, value);
    }
  }

  deleteFromLocalStorage(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      this.localSt.clear(key);
    }
  }
}
