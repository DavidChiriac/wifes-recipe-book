import { Component, DestroyRef, effect, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RecipeCardComponent } from '../shared/components/recipe-card/recipe-card.component';
import { PaginatorModule } from 'primeng/paginator';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { RouterModule } from '@angular/router';
import { catchError, debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelectModule } from 'primeng/select';
import { FiltersComponent } from '../shared/components/filters/filters.component';
import { RecipesClass } from '../shared/classes/filter.class';
import { SearchBarComponent } from '../shared/components/search-bar/search-bar.component';

@Component({
  selector: 'app-recipe-collection',
  imports: [
    InputTextModule,
    ButtonModule,
    FormsModule,
    RecipeCardComponent,
    PaginatorModule,
    CommonModule,
    DialogModule,
    RouterModule,
    SelectModule,
    FiltersComponent,
    SearchBarComponent
  ],
  templateUrl: './recipe-collection.component.html',
  styleUrl: './recipe-collection.component.scss',
})
export class RecipeCollectionComponent extends RecipesClass {
  private readonly destroyRef = inject(DestroyRef);

  category = input<string>('');

  cachedFilters = this.sessionStorage.retrieve('collection-filters');
  cachedSearchTerm = this.sessionStorage.retrieve('collection-searchTerm') || '';

  constructor() {
    super();

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

        window.history.replaceState({}, '', window.location.href.split('?')[0]);
      }
    });
  }

  getRecipes(): void {
    this.loading.set(true);
      this.recipesService.getRecipes({...this.requestParams(), sortField: this.sortField()}, this.searchTerm()).pipe(
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
