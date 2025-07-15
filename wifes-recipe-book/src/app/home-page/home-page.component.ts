import { CommonModule } from '@angular/common';
import { Component, effect, ElementRef, signal, Signal, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { DeviceDetectorService } from 'ngx-device-detector';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

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
    private readonly route: ActivatedRoute
  ) {
    this.isMobile = deviceService.isMobile();
  }

  goToFavourites(): void {
    this.router.navigate(['saved-recipes']);
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
