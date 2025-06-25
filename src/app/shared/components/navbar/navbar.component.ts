import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DeviceService } from '../../services/device.service';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, ButtonModule, RouterModule, MenubarModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  isMobile!: boolean;

  signedIn = false;

  items: MenuItem[] | undefined;

  constructor(private readonly deviceService: DeviceService) {
    this.isMobile = deviceService.isMobile();
  }

  ngOnInit(): void {
    this.items = [
      {
        label: 'My Recipes',
        routerLink: 'my-recipes',
      },
      {
        label: 'Sign Out',
        command: () => {
          this.signOut();
        },
      },
    ];
  }

  signIn(): void {
    this.signedIn = true;
  }

  signOut(): void {
    this.signedIn = false;
  }
}
