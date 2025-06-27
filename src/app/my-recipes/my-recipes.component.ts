import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ExtendedCardComponent } from '../shared/components/extended-card/extended-card.component';

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
export class MyRecipesComponent {
  searchTerm = '';

  recipes: IRecipe[] = [
    {
      id: 1,
      coverImage: {
        url: '',
      },
      coverImageUrl: 'assets/images/homepage.jpg',
      title: 'Recipe 1',
      slug: 'recipe-1',
      preparation: '',
      ingredients: [],
      images: [],
      imagesUrls: [],
      preparationTime: {
        hour: '',
        minutes: '',
      },
    },
    {
      id: 1,
      coverImage: {
        url: '',
      },
      coverImageUrl: 'assets/images/homepage.jpg',
      title: 'Recipe 1',
      slug: 'recipe-1',
      preparation: '',
      ingredients: [],
      images: [],
      imagesUrls: [],
      preparationTime: {
        hour: '',
        minutes: '',
      },
    },
    {
      id: 1,
      coverImage: {
        url: '',
      },
      coverImageUrl: 'assets/images/homepage.jpg',
      title: 'Recipe 1',
      slug: 'recipe-1',
      preparation: '',
      ingredients: [],
      images: [],
      imagesUrls: [],
      preparationTime: {
        hour: '',
        minutes: '',
      },
    },
    {
      id: 1,
      coverImage: {
        url: '',
      },
      coverImageUrl: 'assets/images/homepage.jpg',
      title: 'Recipe 1',
      slug: 'recipe-1',
      preparation: '',
      ingredients: [],
      images: [],
      imagesUrls: [],
      preparationTime: {
        hour: '',
        minutes: '',
      },
    },
    {
      id: 1,
      coverImage: {
        url: '',
      },
      coverImageUrl: 'assets/images/homepage.jpg',
      title: 'Recipe 1',
      slug: 'recipe-1',
      preparation: '',
      ingredients: [],
      images: [],
      imagesUrls: [],
      preparationTime: {
        hour: '',
        minutes: '',
      },
    },
    {
      id: 1,
      coverImage: {
        url: '',
      },
      coverImageUrl: 'assets/images/homepage.jpg',
      title: 'Recipe 1',
      slug: 'recipe-1',
      preparation: '',
      ingredients: [],
      images: [],
      imagesUrls: [],
      preparationTime: {
        hour: '',
        minutes: '',
      },
    },
    {
      id: 1,
      coverImage: {
        url: '',
      },
      coverImageUrl: 'assets/images/homepage.jpg',
      title: 'Recipe 1',
      slug: 'recipe-1',
      preparation: '',
      ingredients: [],
      images: [],
      imagesUrls: [],
      preparationTime: {
        hour: '',
        minutes: '',
      },
    },
    {
      id: 1,
      coverImage: {
        url: '',
      },
      coverImageUrl: 'assets/images/homepage.jpg',
      title: 'Recipe 1',
      slug: 'recipe-1',
      preparation: '',
      ingredients: [],
      images: [],
      imagesUrls: [],
      preparationTime: {
        hour: '',
        minutes: '',
      },
    },
    {
      id: 1,
      coverImage: {
        url: '',
      },
      coverImageUrl: 'assets/images/homepage.jpg',
      title: 'Recipe 1',
      slug: 'recipe-1',
      preparation: '',
      ingredients: [],
      images: [],
      imagesUrls: [],
      preparationTime: {
        hour: '',
        minutes: '',
      },
    },
    {
      id: 1,
      coverImage: {
        url: '',
      },
      coverImageUrl: 'assets/images/homepage.jpg',
      title: 'Recipe 1',
      slug: 'recipe-1',
      preparation: '',
      ingredients: [],
      images: [],
      imagesUrls: [],
      preparationTime: {
        hour: '',
        minutes: '',
      },
    },
    {
      id: 1,
      coverImage: {
        url: '',
      },
      coverImageUrl: 'assets/images/homepage.jpg',
      title: 'Recipe 1',
      slug: 'recipe-1',
      preparation: '',
      ingredients: [],
      images: [],
      imagesUrls: [],
      preparationTime: {
        hour: '',
        minutes: '',
      },
    },
  ];

  requestParams: {
    page: number | undefined;
    first: number | undefined;
    rows: number | undefined;
  } = {
    page: 0,
    first: 0,
    rows: 20,
  };

  totalRecords = 0;

  search(): void {}

  clear(): void {
    this.searchTerm = '';
  }

  onLazyLoad(event: PaginatorState): void {
    this.requestParams = {
      page: event.page,
      first: event.first,
      rows: event.rows,
    };

    //TODO request

    this.totalRecords = 100;
  }
}
