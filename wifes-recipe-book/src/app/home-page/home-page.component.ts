import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, effect, ElementRef, Inject, PLATFORM_ID, signal, Signal, ViewChild } from '@angular/core';
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
  @ViewChild('searchWord') searchWord!: ElementRef;
  isMobile!: boolean;

  recommendedRecipes: IRecipe[] = [];

  searchTerm = signal<string>('');

  constructor(
    private readonly deviceService: DeviceDetectorService,
    private readonly router: Router,
    private readonly localStorageService: LocalStorageService,
    private readonly route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isMobile = deviceService.isMobile();
  }

  goToFavourites(): void {
    if(this.localStorageService.retrieve('user')){
      this.router.navigate(['saved-recipes']);
    } else {
      if (isPlatformBrowser(this.platformId)) {
        window.location.href = environment.apiUrl + '/api/connect/google';
      }
    }
  }

  showFilters(): void {}

  search(): void {
    this.searchTerm.set(this.searchWord.nativeElement.value);
    if(this.searchTerm()){
      this.router.navigate(['/collection'], {relativeTo: this.route});
    } else {
      this.router.navigate(['']);
    }
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.search();
  }
}
