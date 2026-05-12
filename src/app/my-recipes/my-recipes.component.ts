import {
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { DialogModule } from 'primeng/dialog';
import { PaginatorModule } from 'primeng/paginator';
import { ExtendedCardComponent } from '../shared/components/extended-card/extended-card.component';
import { CommonModule } from '@angular/common';
import {
  catchError,
  concatMap,
  debounceTime,
  from,
  map,
  of,
  toArray,
} from 'rxjs';
import { preloadImages } from '../shared/utils/preload-images';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FiltersComponent } from '../shared/components/filters/filters.component';
import { RecipesClass } from '../shared/classes/filter.class';
import { SearchBarComponent } from '../shared/components/search-bar/search-bar.component';

@Component({
  selector: 'app-my-recipes',
  imports: [
    ButtonModule,
    FormsModule,
    ExtendedCardComponent,
    PaginatorModule,
    CommonModule,
    DialogModule,
    FiltersComponent,
    SearchBarComponent
  ],
  templateUrl: './my-recipes.component.html',
  styleUrl: './my-recipes.component.scss',
})
export class MyRecipesComponent extends RecipesClass {
  private readonly destroyRef = inject(DestroyRef);

  cachedFilters = this.sessionStorage.retrieve('my-recipes-filters');
  cachedSearchTerm =
    this.sessionStorage.retrieve('my-recipes-searchTerm') || '';

  deleteDialogVisible = signal(false);
  recipeToBeDeleted = signal<IRecipe | undefined>(undefined);

  deleting = signal(false);

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
        this.sessionStorage.store('my-recipes-searchTerm', this.searchTerm());
      }
    });
  }

  protected override getRecipes(): void {
    this.loading.set(true);
    this.recipesService
      .getMyRecipes(
        { ...this.requestParams(), sortField: this.sortField() },
        this.searchTerm()
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        debounceTime(1000),
        map((response) => {
          this.totalRecords.set(response.total);
          return response.data;
        }),
        catchError((error) => {
          this.errorMessage.set(error.message);
          this.errorModalVisible.set(true);
          return [];
        })
      )
      .subscribe({
        next: (recipes) => {
          preloadImages(recipes.map(r => r.coverImage?.url)).then(() => {
            this.recipes.set(recipes);
            this.loading.set(false);
          });
        },
      });
  }

  deleteRecipe(id: string): void {
    this.deleteDialogVisible.set(true);
    this.recipeToBeDeleted.set(
      this.recipes().find((recipe) => recipe.documentId === id)
    );
  }

  delete(): void {
    this.deleteDialogVisible.set(false);
    this.deleting.set(true);

    const imageIds = [
      this.recipeToBeDeleted()?.coverImage?.id,
      ...(this.recipeToBeDeleted()?.images?.map((recipe) => recipe.id) ?? []),
    ].filter(Boolean);

    from(imageIds)
      .pipe(
        concatMap((imageId) =>
          this.recipesService
            .deleteImage(imageId ?? '')
            .pipe(catchError(() => of(null)))
        ),
        toArray(),
        concatMap(() =>
          this.recipesService.deleteRecipe(
            this.recipeToBeDeleted()?.documentId ?? ''
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.refresh();
          this.deleting.set(false);
        },
        error: (error) => {
          this.errorModalVisible.set(true);
          this.deleting.set(false);
          this.errorMessage.set(error.message);
        },
      });
  }

  protected override cacheFilters(): void {
    this.sessionStorage.store('my-recipes-filters', this.filtersForm.value);
    this.sessionStorage.store('my-recipes-searchTerm', this.searchTerm());
  }

  protected override clearCache(): void {
    this.sessionStorage.clear('my-recipes-filters');
    this.sessionStorage.clear('my-recipes-searchTerm');
  }
}
