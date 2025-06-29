import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { RecipeCardComponent } from '../shared/components/recipe-card/recipe-card.component';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { RecipesService } from '../shared/services/recipes.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-recipe-collection',
  imports: [
    InputTextModule,
    ButtonModule,
    FormsModule,
    RecipeCardComponent,
    PaginatorModule,
  ],
  templateUrl: './recipe-collection.component.html',
  styleUrl: './recipe-collection.component.scss',
})
export class RecipeCollectionComponent implements OnInit {
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

  constructor(private readonly recipesService: RecipesService) {}

  ngOnInit(): void {
    this.onLazyLoad();
  }

  clear(): void {
    this.searchTerm = '';
  }

  search(): void {
    console.log(this.searchTerm);
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

    console.log(this.requestParams);

    this.recipesService
      .getRecipes(this.requestParams)
      .pipe(untilDestroyed(this))
      .subscribe((recipes) => {
        this.recipes = [...recipes.data];
        this.totalRecords = recipes.meta.total;
      });
  }
}
