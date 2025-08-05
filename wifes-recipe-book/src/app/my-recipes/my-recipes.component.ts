import { Component, computed, DestroyRef, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ExtendedCardComponent } from '../shared/components/extended-card/extended-card.component';
import { RecipesService } from '../shared/services/recipes.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { catchError, concatMap, debounceTime, from, map, Observable, of, toArray } from 'rxjs';
import { DeviceDetectorService } from 'ngx-device-detector';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  ],
  templateUrl: './my-recipes.component.html',
  styleUrl: './my-recipes.component.scss',
})
export class MyRecipesComponent {
  private readonly recipesService = inject(RecipesService);
  private readonly deviceService = inject(DeviceDetectorService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  
  isMobile = computed(
    () => isPlatformBrowser(this.platformId) && this.deviceService.isMobile()
  );

  searchTerm = signal('');

  recipes: IRecipe[] = [];

  requestParams = signal<{
    pageNumber: number;
    pageSize: number;
    first: number;
    sortField: string | undefined;
    sortDirection: 'asc' | 'desc' | undefined;
  }>({
    pageNumber: 0,
    pageSize: 20,
    first: 0,
    sortField: undefined,
    sortDirection: undefined,
  });

  sortField = signal<string | undefined>(undefined);
  sortDirection = signal<'asc' | 'desc' | undefined>(undefined);
  totalRecords = signal(0);

  deleteDialogVisible = signal(false);
  recipeToBeDeleted = signal<IRecipe | undefined>(undefined);

  errorModalVisible = signal(false);
  errorMessage = signal('');

  deleting = signal(false);


  constructor() {
    effect(() => {
      this.recipesService.getMyRecipes(this.requestParams(), this.searchTerm()).pipe(
        takeUntilDestroyed(this.destroyRef),
        debounceTime(1000),
        map(response => {
          this.totalRecords.set(response.total);
          return response.data;
        }),
        catchError(error => {
          this.errorMessage.set(error.message);
          this.errorModalVisible.set(true);
          return [];
        })
      ).subscribe({
        next: (recipes) => {
          this.recipes = recipes;
        },
      });
    });
  }

  clear(): void {
    this.searchTerm.set('');
    this.onLazyLoad();
  }

  onLazyLoad(event?: PaginatorState): void {
    if (event) {
      this.requestParams.set({
        pageNumber: event.page || 0,
        pageSize: event.rows || 20,
        first: event.first || 0,
        sortField: this.sortField(),
        sortDirection: this.sortDirection(),
      });
    }
  }

  deleteRecipe(id: string): void {
    this.deleteDialogVisible.set(true);
    this.recipeToBeDeleted.set(this.recipes.find(
      (recipe) => recipe.documentId === id
    ));
  }

  cancel(): void {
    this.recipeToBeDeleted.set(undefined);
    this.deleteDialogVisible.set(false);

    this.errorModalVisible.set(false);
    this.errorMessage.set('');
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

  updateSearchTerm(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }
}
