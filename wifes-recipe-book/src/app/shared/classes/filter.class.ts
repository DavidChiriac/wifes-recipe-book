import { computed, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PaginatorState } from 'primeng/paginator';
import { isPlatformBrowser } from '@angular/common';
import { DeviceDetectorService } from 'ngx-device-detector';
import { catchError, of, take } from 'rxjs';
import { SessionStorageService } from 'ngx-webstorage';
import { IRecipe } from '../interfaces/recipe.interface';
import { RecipesService } from '../services/recipes.service';

export abstract class RecipesClass {
  private readonly deviceService = inject(DeviceDetectorService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly sessionStorage = inject(SessionStorageService);
  readonly recipesService = inject(RecipesService);

  cachedCategories = this.sessionStorage.retrieve('categories') || [];

  filtersForm = new FormGroup({
    category: new FormControl<string[]>([]),
    minMinutes: new FormControl(),
    maxMinutes: new FormControl(),
  });

  formIsEmpty = computed(() => this.requestParams().category.length === 0 && !this.requestParams().minMinutes && !this.requestParams().maxMinutes && !this.sortField() && this.searchTerm().length === 0);

  isMobile = computed(
    () => isPlatformBrowser(this.platformId) && this.deviceService.isMobile()
  );

  searchTerm = signal('');

  requestParams = signal<{
    pageNumber: number;
    pageSize: number;
    first: number;
    category: string[];
    minMinutes?: number;
    maxMinutes?: number;
  }>({
    pageNumber: 1,
    pageSize: 10,
    first: 0,
    category: [],
    minMinutes: undefined,
    maxMinutes: undefined
  });

  sortField = signal<string | undefined>(undefined);

  totalRecords = signal(0);

  errorModalVisible = signal(false);
  errorMessage = signal('');

  recipes = signal<IRecipe[]>([]);

  filtersVisible = signal(false);

  categoryOptions: {name: string; id: string; icon: string}[] = [];

  constructor() {
    if (this.cachedCategories.length > 0) {
      this.categoryOptions = this.cachedCategories;
    } else {
      this.recipesService.getCategories().pipe(
        take(1),
        catchError(() => of([]))
      ).subscribe(categories => {
        this.categoryOptions = categories;
        this.sessionStorage.store('categories', categories);
      });
    }

    effect(() => {
      if(this.requestParams() || this.sortField()) {
        this.getRecipes();
      }
    });
  }

  protected abstract getRecipes(): void;

  onLazyLoad(event?: PaginatorState): void {
    if (event) {
      this.requestParams.update(params => ({
        ...params,
        pageNumber: (event.page || 0) + 1,
        pageSize: event.rows || 20,
        first: event.first || 0,
      }));
    }
  }

  cancel(): void {
    this.errorModalVisible.set(false);
    this.errorMessage.set('');
  }

  updateSearchTerm(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  applyFilters(form: {category: string[], minMinutes: number, maxMinutes: number}): void {
    this.filtersVisible.set(false);
    const filters = form;
    this.filtersForm = new FormGroup({
      category: new FormControl<string[]>(filters.category || []),
      minMinutes: new FormControl(filters.minMinutes || null),
      maxMinutes: new FormControl(filters.maxMinutes || null),
    });

    if (filters.category && filters.category.length > 0) {
      this.requestParams.update(params => ({ ...params, category: filters.category || [] }));
    }
    if (filters.minMinutes) {
      this.requestParams.update(params => ({ ...params, minMinutes: filters.minMinutes }));
    }
    if (filters.maxMinutes) {
      this.requestParams.update(params => ({ ...params, maxMinutes: filters.maxMinutes }));
    }

    this.cacheFilters();

    this.filtersVisible.set(false);
  }

  clearFilters(): void {
    this.filtersForm.reset();
    this.requestParams.set({
      pageNumber: 0,
      pageSize: 10,
      first: 0,
      category: [],
      minMinutes: undefined,
      maxMinutes: undefined
    });
    this.sortField.set(undefined);
    this.searchTerm.set('');
    this.filtersVisible.set(false);

    this.clearCache();
  }

  protected abstract cacheFilters(): void;
  protected abstract clearCache(): void;
}
