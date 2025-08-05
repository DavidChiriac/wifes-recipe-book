import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, Inject, PLATFORM_ID, signal, Signal, viewChild, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { DeviceDetectorService } from 'ngx-device-detector';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { LocalStorageService } from 'ngx-webstorage';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, ButtonModule, RouterModule, InputTextModule, FormsModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
  private readonly deviceService = inject(DeviceDetectorService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);

  isMobile = computed(() => isPlatformBrowser(this.platformId) && this.deviceService.isMobile());

  searchTerm = signal<string>('');
  
  constructor() {
    effect(() => {
      if(this.searchTerm().length > 0 || window.location.pathname === '/collection') {
        this.router.navigate(['/collection'], {relativeTo: this.route});
      } else {
        this.router.navigate(['']);
      }
    });
  }

  goToFavourites(): void {
    if(this.localStorageService.retrieve('user')){
      this.router.navigate(['favourite-recipes']);
    } else {
      if (isPlatformBrowser(this.platformId)) {
        window.location.href = environment.apiUrl + '/api/connect/google';
      }
    }
  }

  showFilters(): void {}

  clearSearch(): void {
    this.searchTerm.set('');
  }
}
