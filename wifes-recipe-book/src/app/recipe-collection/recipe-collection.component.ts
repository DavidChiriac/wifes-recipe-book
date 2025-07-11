import { Component, effect, inject, Inject, OnInit, PLATFORM_ID, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { RecipeCardComponent } from '../shared/components/recipe-card/recipe-card.component';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { RecipesService } from '../shared/services/recipes.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { DeviceDetectorService } from 'ngx-device-detector';
import { RouterModule } from '@angular/router';
import {ROUTER_OUTLET_DATA} from "@angular/router";

@UntilDestroy()
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
    RouterModule
  ],
  templateUrl: './recipe-collection.component.html',
  styleUrl: './recipe-collection.component.scss',
})
export class RecipeCollectionComponent implements OnInit {
  searchTerm = inject(ROUTER_OUTLET_DATA) as Signal<string>;

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

  isMobile!: boolean;

  errorModalVisible = false;
  errorMessage = '';

  navigatingWithinModule = false;

  constructor(
    private readonly recipesService: RecipesService,
    private readonly deviceService: DeviceDetectorService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isMobile = deviceService.isMobile();

    effect(() => {
      this.onLazyLoad(undefined, this.searchTerm());
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.onLazyLoad();
    }
  }

  onLazyLoad(event?: PaginatorState, searchTerm?: string): void {
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
      .getRecipes(this.requestParams, searchTerm)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (recipes) => {
          this.recipes = [...recipes.data];
          this.totalRecords = recipes.meta.total;
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.errorModalVisible = true;
        },
      });
  }

  navigate(): void {
    this.navigatingWithinModule = true;
  }

  cancel(): void {
    this.errorModalVisible = false;
    this.errorMessage = '';
  }
}
