import { Component, Input } from '@angular/core';
import { IRecipe } from '../../interfaces/recipe.interface';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-recipe-card',
  imports: [],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.scss',
})
export class RecipeCardComponent {
  @Input() card!: IRecipe;

  constructor(private readonly router: Router) {}

  viewRecipe(): void {
    this.router.navigate(['/recipe/' + this.card.documentId]);
  }
}
