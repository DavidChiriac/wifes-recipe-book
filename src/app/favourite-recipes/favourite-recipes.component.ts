import {
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { DeviceService } from '../shared/services/device.service';
import { RecipesService } from '../shared/services/recipes.service';
import { CommonModule } from '@angular/common';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { RecipeCardComponent } from '../shared/components/recipe-card/recipe-card.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError } from 'rxjs';
import { preloadImages } from '../shared/utils/preload-images';

@Component({
  selector: 'app-favourite-recipes',
  imports: [CommonModule, RecipeCardComponent, DialogModule, ButtonModule],
  templateUrl: './favourite-recipes.component.html',
  styleUrl: './favourite-recipes.component.scss',
})
export class FavouriteRecipesComponent {
  private readonly recipesService = inject(RecipesService);
  private readonly destroyRef = inject(DestroyRef);

  isMobile = inject(DeviceService).isMobile;

  errorModalVisible = signal(false);
  errorMessage = signal('');

  savedRecipes = signal<IRecipe[]>([]);

  loading = signal(false);

  constructor() {
    this.loading.set(true);
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
        preloadImages(recipes.map(r => r.coverImage?.url)).then(() => {
          this.loading.set(false);
        });
      });
  }

  cancel(): void {
    this.errorModalVisible.set(false);
    this.errorMessage.set('');
  }
}
