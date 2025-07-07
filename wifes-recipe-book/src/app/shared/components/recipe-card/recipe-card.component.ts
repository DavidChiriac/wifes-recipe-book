import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IRecipe } from '../../interfaces/recipe.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recipe-card',
  imports: [],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.scss',
})
export class RecipeCardComponent {
  @Input() card!: IRecipe;
  @Output() navigate = new EventEmitter();
  constructor(private readonly router: Router) {}

  viewRecipe(): void {
    this.navigate.emit();
    this.router.navigate(['/recipe/' + this.card.documentId]);
  }
}
