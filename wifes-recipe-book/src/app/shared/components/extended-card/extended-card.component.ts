import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IRecipe } from '../../interfaces/recipe.interface';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { RecipesService } from '../../services/recipes.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-extended-card',
  imports: [ButtonModule],
  templateUrl: './extended-card.component.html',
  styleUrl: './extended-card.component.scss',
})
export class ExtendedCardComponent {
  @Input() recipe!: IRecipe;

  @Output() deleted = new EventEmitter<boolean>();

  constructor(
    private readonly router: Router,
    private readonly recipesService: RecipesService
  ) {}

  view(): void {
    this.router.navigate(['recipe/' + this.recipe.documentId]);
  }

  edit(): void {
    this.router.navigate(['recipe/' + this.recipe.documentId + '/edit']);
  }

  delete(): void {
    this.recipesService
      .deleteRecipe(this.recipe.documentId ?? '')
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.deleted.emit(true);
      });
  }
}
