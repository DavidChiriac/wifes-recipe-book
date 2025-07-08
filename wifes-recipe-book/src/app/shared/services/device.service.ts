import { Injectable } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  constructor(private deviceService: DeviceDetectorService) {}

  public isMobile(): boolean {
    return this.deviceService.isMobile();
  }

  public isTablet(): boolean {
    return this.deviceService.isTablet();
  }

  public isIOS(): boolean {
    return this.deviceService.os.includes('iOS');
  }

  public isSafari(): boolean | null {
    return (
      /apple/i.exec(navigator.vendor) &&
      !/crios/i.exec(navigator.userAgent) &&
      !/fxios/i.exec(navigator.userAgent) &&
      !/Opera|OPT\//.exec(navigator.userAgent)
    );
  }

  public isMac(): boolean {
    return window.navigator?.platform.includes('Mac') || false;
  }

  public setDeviceInfo(info: any): void {
    this.deviceService.setDeviceInfo(info)
  }
}
