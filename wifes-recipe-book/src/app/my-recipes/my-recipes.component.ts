import { Component, OnInit, Pipe } from '@angular/core';
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
    DialogModule
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

  constructor(private readonly recipesService: RecipesService, private readonly deviceService: DeviceService) {
    this.isMobile = deviceService.isMobile();
  }

  ngOnInit(): void {
    this.onLazyLoad();
  }

  clear(): void {
    this.searchTerm = '';
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
      .getMyRecipes(this.requestParams)
      .pipe(untilDestroyed(this))
      .subscribe((recipes) => {
        this.recipes = [...recipes.data];
        this.totalRecords = recipes.meta.total;
      });
  }

  deleteRecipe(id: string): void{
    this.deleteDialogVisible = true;
    this.recipeToBeDeleted = this.recipes.find(recipe => recipe.documentId === id);
  }

  cancel(): void {
    this.recipeToBeDeleted = undefined;
    this.deleteDialogVisible = false;
  }

  delete(): void {
    this.deleteDialogVisible = false;
    this.recipesService
      .deleteRecipe(this.recipeToBeDeleted?.documentId ?? '')
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.onLazyLoad();
      });
  }
}
