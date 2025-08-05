import { Component, computed, DestroyRef, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ExtendedCardComponent } from '../shared/components/extended-card/extended-card.component';
import { RecipesService } from '../shared/services/recipes.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { catchError, concatMap, from, of, toArray } from 'rxjs';
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
export class MyRecipesComponent implements OnInit {
  private readonly recipesService = inject(RecipesService);
  private readonly deviceService = inject(DeviceDetectorService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  
  isMobile = computed(
    () => isPlatformBrowser(this.platformId) && this.deviceService.isMobile()
  );

  searchTerm = '';

  recipes: IRecipe[] = [];

  requestParams: {
    pageNumber: number | undefined;
    pageSize: number | undefined;
    first: number | undefined;
    sortField: string | undefined;
    sortDirection: 'asc' | 'desc' | undefined;
  } = {
    pageNumber: 0,
    pageSize: 20,
    first: 0,
    sortField: undefined,
    sortDirection: undefined,
  };

  sortField: string | undefined;
  sortDirection: 'asc' | 'desc' | undefined;
  totalRecords = 0;

  deleteDialogVisible = signal(false);
  recipeToBeDeleted = signal<IRecipe | undefined>(undefined);

  errorModalVisible = signal(false);
  errorMessage = signal('');

  deleting = signal(false);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.onLazyLoad();
    }
  }

  clear(): void {
    this.searchTerm = '';
    this.onLazyLoad();
  }

  onLazyLoad(event?: PaginatorState): void {
    if (event) {
      this.requestParams = {
        pageNumber: event.page,
        pageSize: event.rows,
        first: event.first,
        sortField: this.sortField,
        sortDirection: this.sortDirection,
      };
    }

    this.recipesService
      .getMyRecipes(this.requestParams, this.searchTerm)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (recipes) => {
          this.recipes = [...recipes.data];
          this.totalRecords = recipes.meta.total;
        },
        error: (error) => {
          this.errorMessage.set(error.message);
          this.errorModalVisible.set(true);
        },
      });
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
}
