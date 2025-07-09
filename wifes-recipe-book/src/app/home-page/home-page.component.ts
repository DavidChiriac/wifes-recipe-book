import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { RecipesService } from '../shared/services/recipes.service';
import { RecipeCardComponent } from '../shared/components/recipe-card/recipe-card.component';
import { DeviceDetectorService } from 'ngx-device-detector';

@UntilDestroy()
@Component({
  selector: 'app-home-page',
  imports: [CommonModule, ButtonModule, RouterModule, RecipeCardComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent implements OnInit {
  isMobile!: boolean;

  recommendedRecipes: IRecipe[] = [];

  constructor(
    private readonly deviceService: DeviceDetectorService,
    private readonly recipesService: RecipesService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isMobile = deviceService.isMobile();
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.recipesService
        .getRecommendedRecipes()
        .pipe(untilDestroyed(this))
        .subscribe((recipes) => {
          this.recommendedRecipes = [...recipes];
        });
    }
  }
}
