import { Component, OnInit, Pipe } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ExtendedCardComponent } from '../shared/components/extended-card/extended-card.component';
import { RecipesService } from '../shared/services/recipes.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-my-recipes',
  imports: [
    ButtonModule,
    FormsModule,
    ExtendedCardComponent,
    InputTextModule,
    PaginatorModule,
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

  constructor(private readonly recipesService: RecipesService) {}

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
}
