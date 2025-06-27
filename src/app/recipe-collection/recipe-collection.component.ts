import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { RecipeCardComponent } from '../shared/components/recipe-card/recipe-card.component';

@Component({
  selector: 'app-recipe-collection',
  imports: [InputTextModule, ButtonModule, FormsModule, RecipeCardComponent],
  templateUrl: './recipe-collection.component.html',
  styleUrl: './recipe-collection.component.scss',
})
export class RecipeCollectionComponent {
  searchTerm = '';

  recipes: IRecipe[] = [
    {
      id: 0,
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

  clear(): void {
    this.searchTerm = '';
  }

  search(): void {
    console.log(this.searchTerm);
  }
}
