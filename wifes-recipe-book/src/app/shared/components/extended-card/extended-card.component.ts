import { Component, Input } from '@angular/core';
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

  constructor(
    private readonly router: Router,
    private readonly recipesService: RecipesService
  ) {}

  view(): void {
    this.router.navigate(['recipe/' + this.recipe.slug]);
  }

  edit(): void {
    this.router.navigate(['recipe/' + this.recipe.slug + '/edit']);
  }

  delete(): void {
    this.recipesService
      .deleteRecipe(this.recipe)
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  toggleStatus(): void {
    this.recipesService
      .editRecipe({ ...this.recipe, enabled: !this.recipe.enabled })
      .pipe(untilDestroyed(this))
      .subscribe((response) => (this.recipe = { ...response }));
  }
}
