import { Component, OnInit } from '@angular/core';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { ActivatedRoute } from '@angular/router';
import { TextareaModule } from 'primeng/textarea';
import { ImageModule } from 'primeng/image';
import { RecipesService } from '../shared/services/recipes.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MarkdownPipe } from '../shared/pipes/safe-html.pipe';
import { AsyncPipe } from '@angular/common';

@UntilDestroy()
@Component({
  selector: 'app-view-recipe',
  imports: [TextareaModule, ImageModule, MarkdownPipe, AsyncPipe],
  templateUrl: './view-recipe.component.html',
  styleUrl: './view-recipe.component.scss',
})
export class ViewRecipeComponent implements OnInit {
  recipe!: IRecipe;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly recipesService: RecipesService
  ) {}

  ngOnInit(): void {
    this.getRecipe(this.route.snapshot.params['id']);
  }

  getRecipe(slug: string): void {
    this.recipesService
      .getSingleRecipe(slug)
      .pipe(untilDestroyed(this))
      .subscribe((recipe) => (this.recipe = { ...recipe }));
  }
}
