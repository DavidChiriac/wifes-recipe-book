import { Component, OnInit } from '@angular/core';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { ActivatedRoute } from '@angular/router';
import { TextareaModule } from 'primeng/textarea';
import { ImageModule } from 'primeng/image';
import { RecipesService } from '../shared/services/recipes.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MarkdownPipe } from '../shared/pipes/safe-html.pipe';
import { AsyncPipe, CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DeviceDetectorService } from 'ngx-device-detector';

@UntilDestroy()
@Component({
  selector: 'app-view-recipe',
  imports: [TextareaModule, ImageModule, MarkdownPipe, AsyncPipe, CommonModule, DialogModule, ButtonModule],
  templateUrl: './view-recipe.component.html',
  styleUrl: './view-recipe.component.scss',
})
export class ViewRecipeComponent implements OnInit {
  recipe: IRecipe | undefined;

  isMobile!: boolean;

  errorModalVisible = false;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly recipesService: RecipesService,
    private readonly deviceService: DeviceDetectorService
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
      .subscribe({
        next: (recipe) => {
          this.recipe = { ...recipe };
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.errorModalVisible = true;
        }
      });
  }

  cancel(): void {
    this.errorModalVisible = false;
    this.errorMessage = '';
  }
}
