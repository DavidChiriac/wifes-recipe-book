import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DeviceService } from '../shared/services/device.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RecipesService } from '../shared/services/recipes.service';
import { catchError, of, switchMap } from 'rxjs';

import { Router, RouterModule } from '@angular/router';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { RecipeCardComponent } from '../shared/components/recipe-card/recipe-card.component';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, ButtonModule, RecipeCardComponent, RouterModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly recipesService = inject(RecipesService);
  private readonly router = inject(Router);

  isMobile = inject(DeviceService).isMobile;

  loading = signal(true);

  categories = signal<{name: string; icon: string; id: string}[]>([]);
  
  randomRecipes = signal<IRecipe[]>([]);

  recipesArranged = computed(() => {
    let recipes: {recipes: IRecipe[], category: string}[] = [];
    this.categories().forEach(category => {
      recipes = [
        ...recipes,
        {
          recipes: [...(this.randomRecipes() ?? []).filter(recipe => recipe.categories?.some(cat => cat.id === category.id))],
          category: category.name
        }
      ]
    });

    return recipes;
  });

  private normalizeRecipes(recipesByCategory: Record<string, IRecipe[] | undefined>): IRecipe[] {
    const seenRecipeIds = new Set<string>();

    return Object.values(recipesByCategory)
      .flatMap(categoryRecipes => categoryRecipes ?? [])
      .filter(recipe => {
        if (!recipe.id || seenRecipeIds.has(recipe.id)) {
          return false;
        }

        seenRecipeIds.add(recipe.id);
        return true;
      })
      .map(recipe => ({ ...recipe } as IRecipe));
  }

  constructor() {
    this.recipesService.getCategories().pipe(
      catchError(() => of([])),
      takeUntilDestroyed(this.destroyRef),
      switchMap(categories => {
        this.categories.set(categories);
        return this.recipesService.getRandomRecipesByCategory(categories.map(cat => cat.id)).pipe(
          catchError(() => of({}))
        );
      })
    ).subscribe(recipes => {
      this.randomRecipes.set(this.normalizeRecipes(recipes as Record<string, IRecipe[] | undefined>));
      this.loading.set(false);
    });
  }

  navigateWithCategory(category: string): void {
    this.router.navigate(['/collection'], { queryParams: { category } });
  }
}
