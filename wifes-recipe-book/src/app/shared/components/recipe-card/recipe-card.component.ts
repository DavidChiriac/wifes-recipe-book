import {
  Component,
  Inject,
  Input,
  PLATFORM_ID,
} from '@angular/core';
import { IRecipe } from '../../interfaces/recipe.interface';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DeviceDetectorService } from 'ngx-device-detector';
import { RecipesService } from '../../services/recipes.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LocalStorageService } from 'ngx-webstorage';

@UntilDestroy()
@Component({
  selector: 'app-recipe-card',
  imports: [CommonModule],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.scss',
})
export class RecipeCardComponent {
  @Input() card!: IRecipe;
  @Input() isFavourite!: boolean;

  isMobile!: boolean;

  userIsLoggedIn!: boolean;

  constructor(
    private readonly router: Router,
    private readonly deviceService: DeviceDetectorService,
    private readonly recipesService: RecipesService,
    private readonly localStorageService: LocalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(platformId)) {
      this.isMobile = deviceService.isMobile();
    }

    this.userIsLoggedIn = Boolean(localStorageService.retrieve('user'));
  }

  viewRecipe(): void {
    this.router.navigate(['/recipe/' + this.card.documentId]);
  }

  markAsFavourite(event: Event): void {
    event.stopPropagation();
    this.isFavourite = !this.isFavourite;

    this.recipesService.toggleFavourite(this.card.id ?? '', this.isFavourite).pipe(untilDestroyed(this)).subscribe();

    let cachedRecommendedRecipes = this.localStorageService.retrieve('recommendedRecipes');

    let isCached = false;
    cachedRecommendedRecipes = cachedRecommendedRecipes.map((recipe: IRecipe) => {
      if(recipe.documentId === this.card.documentId){
        isCached = true;
        return {
          ...recipe,
          isFavourite: this.isFavourite
        }
      }
      return recipe;
    });

    if(isCached){
      this.localStorageService.store('recommendedRecipes', cachedRecommendedRecipes);
    }
  }
}
