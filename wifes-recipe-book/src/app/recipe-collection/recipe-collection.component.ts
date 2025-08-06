import { Component, computed, DestroyRef, effect, inject, input, PLATFORM_ID, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RecipeCardComponent } from '../shared/components/recipe-card/recipe-card.component';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { RecipesService } from '../shared/services/recipes.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { DeviceDetectorService } from 'ngx-device-detector';
import { RouterModule } from '@angular/router';
import { catchError, debounceTime, map, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { DrawerModule } from 'primeng/drawer';
import { SessionStorageService } from 'ngx-webstorage';
import { MultiSelectModule } from 'primeng/multiselect';

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
    DrawerModule,
    MultiSelectModule,
    ReactiveFormsModule
  ],
  templateUrl: './recipe-collection.component.html',
  styleUrl: './recipe-collection.component.scss',
})
export class RecipeCollectionComponent {
  private readonly recipesService = inject(RecipesService);
  private readonly deviceService = inject(DeviceDetectorService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sessionStorage = inject(SessionStorageService);

  category = input<string>('');

  cachedFilters = this.sessionStorage.retrieve('filters');
  cachedSearchTerm = this.sessionStorage.retrieve('searchTerm') || '';

  filtersForm = new FormGroup({
    category: new FormControl<string[]>([]),
    minMinutes: new FormControl(),
    maxMinutes: new FormControl(),
  });
  formIsEmpty = computed(() => this.requestParams().category.length === 0 && !this.requestParams().minMinutes && !this.requestParams().maxMinutes);

  isMobile = computed(
    () => isPlatformBrowser(this.platformId) && this.deviceService.isMobile()
  );

  searchTerm = signal('');

  requestParams = signal<{
    pageNumber: number;
    pageSize: number;
    first: number;
    sortField: string | undefined;
    sortDirection: 'asc' | 'desc' | undefined;
    category: string[];
    minMinutes?: number;
    maxMinutes?: number;
  }>({
    pageNumber: 0,
    pageSize: 10,
    first: 0,
    sortField: undefined,
    sortDirection: undefined,
    category: [],
    minMinutes: undefined,
    maxMinutes: undefined
  });

  sortField = signal<string | undefined>(undefined);
  sortDirection = signal<'asc' | 'desc' | undefined>(undefined);

  totalRecords = signal(0);

  errorModalVisible = false;
  errorMessage = '';

  recipes$!: Observable<IRecipe[]>;

  filtersVisible = signal(false);

  categoryOptions = this.sessionStorage.retrieve('categories') || [];

  constructor() {
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
      this.recipes$ = this.recipesService.getRecipes(this.requestParams(), this.searchTerm()).pipe(
        takeUntilDestroyed(this.destroyRef),
        debounceTime(1000),
        map(response => {
          this.totalRecords.set(response.total);
          return response.data;
        }),
        catchError(error => {
          this.errorMessage = error.message;
          this.errorModalVisible = true;
          return [];
        })
      );

      this.sessionStorage.store('searchTerm', this.searchTerm());
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

  onLazyLoad(event?: PaginatorState): void {
    if (event) {
      this.requestParams.set({
        pageNumber: event.page || 0,
        pageSize: event.rows || 20,
        first: event.first || 0,
        sortField: this.sortField(),
        sortDirection: this.sortDirection(),
        category: this.filtersForm.value.category || []
      });
    }
  }

  cancel(): void {
    this.errorModalVisible = false;
    this.errorMessage = '';
  }

  updateSearchTerm(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  applyFilters(): void {
    const filters = this.filtersForm.value;

    if (filters.category && filters.category.length > 0) {
      this.requestParams.update(params => ({ ...params, category: filters.category || [] }));
    }
    if (filters.minMinutes) {
      this.requestParams.update(params => ({ ...params, minMinutes: filters.minMinutes }));
    }
    if (filters.maxMinutes) {
      this.requestParams.update(params => ({ ...params, maxMinutes: filters.maxMinutes }));
    }

    this.sessionStorage.store('filters', this.filtersForm.value);

    this.filtersVisible.set(false);
  }

  clearFilters(): void {
    this.filtersForm.reset();
    this.requestParams.set({
      pageNumber: 0,
      pageSize: 10,
      first: 0,
      sortField: undefined,
      sortDirection: undefined,
      category: [],
      minMinutes: undefined,
      maxMinutes: undefined
    });
    this.sessionStorage.clear('filters');
    this.filtersVisible.set(false);
  }
}
