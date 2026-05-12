import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DeviceService } from '../shared/services/device.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RecipesService } from '../shared/services/recipes.service';
import { catchError, of, switchMap } from 'rxjs';
import { preloadImages } from '../shared/utils/preload-images';

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
      const normalized = this.normalizeRecipes(recipes as Record<string, IRecipe[] | undefined>);
      preloadImages(normalized.map(r => r.coverImage?.url)).then(() => {
        this.randomRecipes.set(normalized);
        this.loading.set(false);
        // Wait one tick for @if(!loading()) to render the categories DOM
        setTimeout(() => this.updateScrollArrows(), 0);
      });
    });
  }

  navigateWithCategory(category: string): void {
    this.router.navigate(['/collection'], { queryParams: { category } });
  }

  @ViewChild('categoriesScroll') categoriesScrollRef!: ElementRef<HTMLDivElement>;

  canScrollLeft = signal(false);
  canScrollRight = signal(false);

  scrollCategories(direction: number): void {
    this.categoriesScrollRef.nativeElement.scrollBy({ left: direction * 200, behavior: 'smooth' });
  }

  onCategoriesScroll(): void {
    this.updateScrollArrows();
  }

  private updateScrollArrows(): void {
    const el = this.categoriesScrollRef?.nativeElement;
    if (!el) return;
    this.canScrollLeft.set(el.scrollLeft > 2);
    this.canScrollRight.set(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }
}
