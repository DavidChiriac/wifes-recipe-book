import { Component, OnInit } from '@angular/core';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { ActivatedRoute } from '@angular/router';
import { TextareaModule } from 'primeng/textarea';
import { ImageModule } from 'primeng/image';
import { RecipesService } from '../shared/services/recipes.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MarkdownPipe } from '../shared/pipes/safe-html.pipe';
import { AsyncPipe, CommonModule } from '@angular/common';
import { DeviceService } from '../shared/services/device.service';

@UntilDestroy()
@Component({
  selector: 'app-view-recipe',
  imports: [TextareaModule, ImageModule, MarkdownPipe, AsyncPipe, CommonModule],
  templateUrl: './view-recipe.component.html',
  styleUrl: './view-recipe.component.scss',
})
export class ViewRecipeComponent implements OnInit {
  recipe: IRecipe | undefined;

  isMobile!: boolean;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly recipesService: RecipesService,
    private readonly deviceService: DeviceService
  ) {
    this.isMobile = deviceService.isMobile();
  }

  ngOnInit(): void {
    this.getRecipe(this.route.snapshot.params['id']);
  }

  getRecipe(documentId: string): void {
    this.recipesService
      .getSingleRecipe(documentId)
      .pipe(untilDestroyed(this))
      .subscribe((recipe) => {
        console.log(recipe);
        this.recipe = { ...recipe };
      });
  }
}
