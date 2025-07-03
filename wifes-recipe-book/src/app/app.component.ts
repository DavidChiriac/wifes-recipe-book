import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { DeviceService } from './shared/services/device.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Wife\'s Recipe Book';

  isMobile!: boolean;

  constructor(private readonly deviceService: DeviceService) {
    this.isMobile = deviceService.isMobile();
  }
}
