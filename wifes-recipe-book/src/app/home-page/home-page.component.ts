import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DeviceDetectorService } from 'ngx-device-detector';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RecipesService } from '../shared/services/recipes.service';
import { catchError, map, of } from 'rxjs';
import { HomepagePresentationComponent } from "./homepage-presentation/homepage-presentation.component";
import { SessionStorageService } from 'ngx-webstorage';
import { Router, RouterModule } from '@angular/router';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { RecipeCardComponent } from '../shared/components/recipe-card/recipe-card.component';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, ButtonModule, InputTextModule, FormsModule, HomepagePresentationComponent, RecipeCardComponent, RouterModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
  private readonly deviceService = inject(DeviceDetectorService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly recipesService = inject(RecipesService);
  private readonly sessionStorage = inject(SessionStorageService);
  private readonly router = inject(Router);

  isMobile = computed(() => isPlatformBrowser(this.platformId) && this.deviceService.isMobile());

  searchTerm = signal<string>('');

  categories = signal<{name: string; icon: string; id: string}[]>([]);
  
  randomRecipes = signal<IRecipe[]>([]);

  recipesArranged = computed(() => {
    let recipes: {recipes: IRecipe[], category: string}[] = [];
    this.categories().forEach(category => {
      recipes = [
        ...recipes,
        {
          recipes: [...this.randomRecipes()?.filter(recipe => recipe.categories?.some(cat => cat.id === category.id))],
          category: category.name
        }
      ]
    });

    return recipes;
  });

  constructor() {
    const categories = this.sessionStorage.retrieve('categories');
    if (categories) {
      this.categories.set(categories);
    } else {
      this.recipesService.getCategories().pipe(
        catchError(() => of([])),
        takeUntilDestroyed(this.destroyRef),
        map(categories => {
          this.sessionStorage.store('categories', categories);
          this.categories.set(categories);
          return categories;
        })
      );
    }

    this.recipesService.getRandomRecipesByCategory(this.categories().map(cat => cat.id)).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => of([]))
    ).subscribe(recipes => {
      let normalizedRecipes: IRecipe[] = [];

      Object.values(recipes).forEach(categoryRecipes => {
        categoryRecipes.forEach(recipe => {
          if(normalizedRecipes.some(r => r.id === recipe.id)) {
            return;
          }
          normalizedRecipes.push({
            ...recipe,
          } as IRecipe);
        });
      });

      this.randomRecipes.set(normalizedRecipes);
    });
  }

  navigateWithCategory(category: string): void {
    this.router.navigate(['/collection'], { queryParams: { category } });
  }
}
