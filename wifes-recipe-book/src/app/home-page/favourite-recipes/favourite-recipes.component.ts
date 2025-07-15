import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { RecipesService } from '../../shared/services/recipes.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { IRecipe } from '../../shared/interfaces/recipe.interface';
import { RecipeCardComponent } from '../../shared/components/recipe-card/recipe-card.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@UntilDestroy()
@Component({
  selector: 'app-favourite-recipes',
  imports: [CommonModule, RecipeCardComponent, DialogModule, ButtonModule],
  templateUrl: './favourite-recipes.component.html',
  styleUrl: './favourite-recipes.component.scss'
})
export class FavouriteRecipesComponent implements OnInit {
  savedRecipes: IRecipe[] = [];

  isMobile!: boolean;

  errorModalVisible = false;
  errorMessage = '';

  constructor(
    private readonly deviceService: DeviceDetectorService,
    private readonly recipesService: RecipesService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(platformId)) {
      this.isMobile = deviceService.isMobile();
    }
  }

  ngOnInit(): void {
    this.recipesService
      .getFavouriteRecipes()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (recipes) => {
          this.savedRecipes = [...recipes];
        },
        error: (error) => {
          this.errorModalVisible = true;
          this.errorMessage = error.message;
        }
      });
  }

  cancel(): void {
    this.errorModalVisible = false;
    this.errorMessage = '';
  }
}
