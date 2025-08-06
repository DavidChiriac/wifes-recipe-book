import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { RecipesService } from '../shared/services/recipes.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { RecipeCardComponent } from '../shared/components/recipe-card/recipe-card.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map } from 'rxjs';

@Component({
  selector: 'app-favourite-recipes',
  imports: [CommonModule, RecipeCardComponent, DialogModule, ButtonModule],
  templateUrl: './favourite-recipes.component.html',
  styleUrl: './favourite-recipes.component.scss',
})
export class FavouriteRecipesComponent {
  private readonly recipesService = inject(RecipesService);
  private readonly deviceService = inject(DeviceDetectorService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  isMobile = computed(
    () => isPlatformBrowser(this.platformId) && this.deviceService.isMobile()
  );

  errorModalVisible = signal(false);
  errorMessage = signal('');

  savedRecipes = signal<IRecipe[]>([]);

  constructor() {
    this.recipesService
      .getFavouriteRecipes()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          this.errorModalVisible.set(true);
          this.errorMessage.set(error.message);
          return [];
        })
      )
      .subscribe((recipes) => {
        this.savedRecipes.set(
          recipes.map((recipe) => {
            return {
              ...recipe,
              isFavourite: true,
            } as IRecipe;
          })
        );
      });
  }

  cancel(): void {
    this.errorModalVisible.set(false);
    this.errorMessage.set('');
  }
}
