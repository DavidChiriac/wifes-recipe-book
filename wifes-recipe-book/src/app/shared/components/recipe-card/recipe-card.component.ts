import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IRecipe } from '../../interfaces/recipe.interface';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recipe-card',
  imports: [CommonModule],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.scss',
})
export class RecipeCardComponent {
  @Input() card!: IRecipe;
  @Output() navigate = new EventEmitter();

  isFavourite = false;

  constructor(private readonly router: Router) {}

  viewRecipe(): void {
    this.navigate.emit();
    this.router.navigate(['/recipe/' + this.card.documentId]);
  }

  markAsFavourite(event: Event): void {
    this.isFavourite = !this.isFavourite;
    event.stopPropagation();
  }
}
