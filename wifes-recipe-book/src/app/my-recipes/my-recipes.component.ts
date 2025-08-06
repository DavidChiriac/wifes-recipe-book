import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ExtendedCardComponent } from '../shared/components/extended-card/extended-card.component';
import { RecipesService } from '../shared/services/recipes.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  catchError,
  concatMap,
  debounceTime,
  from,
  map,
  of,
  toArray,
} from 'rxjs';
import { DeviceDetectorService } from 'ngx-device-detector';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { sortingOptions } from '../shared/constants/sorting-options';
import { SelectModule } from 'primeng/select';
import { FiltersComponent } from '../shared/components/filters/filters.component';
import { SessionStorageService } from 'ngx-webstorage';
import { RecipesClass } from '../shared/classes/filter.class';
import { SearchBarComponent } from '../shared/components/search-bar/search-bar.component';

@Component({
  selector: 'app-my-recipes',
  imports: [
    ButtonModule,
    FormsModule,
    ExtendedCardComponent,
    InputTextModule,
    PaginatorModule,
    CommonModule,
    DialogModule,
    SelectModule,
    FiltersComponent,
    SearchBarComponent
  ],
  templateUrl: './my-recipes.component.html',
  styleUrl: './my-recipes.component.scss',
})
export class MyRecipesComponent extends RecipesClass {
  private readonly destroyRef = inject(DestroyRef);

  override cachedFilters = this.sessionStorage.retrieve('my-recipes-filters');
  override cachedSearchTerm =
    this.sessionStorage.retrieve('my-recipes-searchTerm') || '';

  deleteDialogVisible = signal(false);
  recipeToBeDeleted = signal<IRecipe | undefined>(undefined);

  deleting = signal(false);

  protected override getRecipes(): void {
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
          this.recipes.set(recipes);
        },
      });
  }

  clear(): void {
    this.searchTerm.set('');
    this.onLazyLoad();
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
          this.onLazyLoad();
          this.deleting.set(false);
        },
        error: (error) => {
          this.errorModalVisible.set(true);
          this.deleting.set(false);
          this.errorMessage.set(error.message);
        },
      });
  }
}
