import { Component, Input } from '@angular/core';
import { IRecipe } from '../../interfaces/recipe.interface';

@Component({
  selector: 'app-recipe-card',
  imports: [],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.scss',
})
export class RecipeCardComponent {
  @Input() card!: IRecipe;
}
