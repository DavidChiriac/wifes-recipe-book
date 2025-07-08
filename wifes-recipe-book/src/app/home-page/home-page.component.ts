import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DeviceService } from '../shared/services/device.service';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, ButtonModule, RouterModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
  isMobile!: boolean;

  constructor(
    private readonly deviceService: DeviceService,
  ) {
    this.isMobile = deviceService.isMobile();
  }
}
