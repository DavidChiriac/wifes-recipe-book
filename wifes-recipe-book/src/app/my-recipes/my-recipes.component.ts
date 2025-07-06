import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ExtendedCardComponent } from '../shared/components/extended-card/extended-card.component';
import { RecipesService } from '../shared/services/recipes.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CommonModule } from '@angular/common';
import { DeviceService } from '../shared/services/device.service';
import { SessionStorageService } from 'ngx-webstorage';

@UntilDestroy()
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

  isMobile!: boolean;

  deleteDialogVisible = false;
  recipeToBeDeleted: IRecipe | undefined;

  errorModalVisible = false;
  errorMessage = '';

  constructor(
    private readonly recipesService: RecipesService,
    private readonly deviceService: DeviceService,
    private readonly sessionStorageService: SessionStorageService
  ) {
    this.isMobile = deviceService.isMobile();
  }

  ngOnInit(): void {
    this.searchTerm = this.sessionStorageService.retrieve('myRecipesSearchTerm') ?? '';
    this.onLazyLoad();
  }

  clear(): void {
    this.searchTerm = '';
    this.onLazyLoad();
  }

  onLazyLoad(event?: PaginatorState): void {
    this.sessionStorageService.store('myRecipesSearchTerm', this.searchTerm)
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
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (recipes) => {
        this.recipes = [...recipes.data];
        this.totalRecords = recipes.meta.total;
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.errorModalVisible = true;
        }
    });
  }

  deleteRecipe(id: string): void {
    this.deleteDialogVisible = true;
    this.recipeToBeDeleted = this.recipes.find(
      (recipe) => recipe.documentId === id
    );
  }

  cancel(): void {
    this.recipeToBeDeleted = undefined;
    this.deleteDialogVisible = false;

    this.errorModalVisible = false;
    this.errorMessage = '';
  }

  delete(): void {
    this.deleteDialogVisible = false;
    this.recipesService
      .deleteRecipe(this.recipeToBeDeleted?.documentId ?? '')
      .pipe(untilDestroyed(this))
      .subscribe({
        next: () => {
          this.onLazyLoad();
        },
        error: (error) => {
          this.errorModalVisible = true;
          this.errorMessage = error.message;
        },
      });
  }
}
