import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { RecipesService } from '../../shared/services/recipes.service';
import { IRecipe } from '../../shared/interfaces/recipe.interface';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RecipeCardComponent } from '../../shared/components/recipe-card/recipe-card.component';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';

@UntilDestroy()
@Component({
  selector: 'app-homepage-presentation',
  imports: [RecipeCardComponent, ButtonModule, RouterModule, CommonModule],
  templateUrl: './homepage-presentation.component.html',
  styleUrl: './homepage-presentation.component.scss'
})
export class HomepagePresentationComponent implements OnInit {
  recommendedRecipes: IRecipe[] = [];

  isMobile!: boolean;

  constructor(
    private readonly deviceService: DeviceDetectorService,
    private readonly recipesService: RecipesService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if(isPlatformBrowser(platformId)){
      this.isMobile = deviceService.isMobile();
    }
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
