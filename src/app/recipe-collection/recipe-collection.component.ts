import { Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RecipeCardComponent } from '../shared/components/recipe-card/recipe-card.component';
import { PaginatorModule } from 'primeng/paginator';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { catchError, debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FiltersComponent } from '../shared/components/filters/filters.component';
import { RecipesClass } from '../shared/classes/filter.class';
import { SearchBarComponent } from '../shared/components/search-bar/search-bar.component';
import { UsersService } from '../shared/services/users.service';

@Component({
  selector: 'app-recipe-collection',
  imports: [
    ButtonModule,
    RecipeCardComponent,
    PaginatorModule,
    CommonModule,
    DialogModule,
    FiltersComponent,
    SearchBarComponent
  ],
  templateUrl: './recipe-collection.component.html',
  styleUrl: './recipe-collection.component.scss',
})
export class RecipeCollectionComponent extends RecipesClass {
  private readonly destroyRef = inject(DestroyRef);
  private readonly usersService = inject(UsersService);

  category = input<string>('');
  authorId = input<string>('');
  authorName = input<string>('');

  authorOptions = signal<{ uid: string; displayName: string }[]>([]);

  cachedFilters = this.sessionStorage.retrieve('collection-filters');
  cachedSearchTerm = this.sessionStorage.retrieve('collection-searchTerm') || '';

  constructor() {
    super();

    this.usersService.getUsers().pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => [])
    ).subscribe(users => {
      this.authorOptions.set(
        users
          .filter(u => u.recipeCount > 0)
          .map(u => ({ uid: u.uid, displayName: u.displayName ?? u.email ?? u.uid }))
      );
    });

    if(this.cachedSearchTerm) {
      this.searchTerm.set(this.cachedSearchTerm);
    }

    if(this.cachedFilters) {
      this.filtersForm.patchValue(this.cachedFilters);
      this.requestParams.update(params => ({
        ...params,
        category: this.cachedFilters?.category || [],
        minMinutes: this.cachedFilters?.minMinutes || undefined,
        maxMinutes: this.cachedFilters?.maxMinutes || undefined
      }));
    }

    effect(() => {
      if (this.searchTerm()) {
        this.sessionStorage.store('collection-searchTerm', this.searchTerm());
      }
    });

    effect(() => {
      if (this.category()) {
        this.filtersForm.patchValue({
          category: this.category() ? [this.category()] : []
        });

        this.requestParams.update(params => ({
          ...params,
          category: this.category() ? [this.category()] : []
        }));

        globalThis.history.replaceState({}, '', globalThis.location.href.split('?')[0]);
      }
    });

    effect(() => {
      if (this.authorId()) {
        this.requestParams.update(params => ({
          ...params,
          authorId: this.authorId(),
          authorName: this.authorName() || this.authorId(),
        }));

        globalThis.history.replaceState({}, '', globalThis.location.href.split('?')[0]);
      }
    });
  }

  getRecipes(): void {
    this.loading.set(true);
      this.recipesService.getRecipes({...this.requestParams(), sortField: this.sortField(), authorId: this.requestParams().authorId}, this.searchTerm()).pipe(
        debounceTime(1000),
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          this.errorMessage.set(error.message);
          this.errorModalVisible.set(true);
          return [];
        })
      ).subscribe(fetchedRecipes => {
        this.totalRecords.set(fetchedRecipes.total);
        this.recipes.set(fetchedRecipes.data.map(recipe => ({
          ...recipe,
          isFavourite: recipe.isFavourite ?? false
        })));
        this.loading.set(false);
      });
  }

  protected override cacheFilters(): void {
    this.sessionStorage.store('collection-filters', this.filtersForm.value);
    this.sessionStorage.store('collection-searchTerm', this.searchTerm());
  }

  protected override clearCache(): void {
    this.sessionStorage.clear('collection-filters');
    this.sessionStorage.clear('collection-searchTerm');
  }
}
