import { Component, OnInit } from '@angular/core';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { ActivatedRoute } from '@angular/router';
import { TextareaModule } from 'primeng/textarea';
import { ImageModule } from 'primeng/image';
import { RecipesService } from '../shared/services/recipes.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DeviceDetectorService } from 'ngx-device-detector';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { HomepagePresentationComponent } from '../home-page/homepage-presentation/homepage-presentation.component';

@UntilDestroy()
@Component({
  selector: 'app-view-recipe',
  imports: [
    TextareaModule,
    ImageModule,
    CommonModule,
    DialogModule,
    ButtonModule,
    BreadcrumbModule,
    CheckboxModule,
    HomepagePresentationComponent
  ],
  templateUrl: './view-recipe.component.html',
  styleUrl: './view-recipe.component.scss',
})
export class ViewRecipeComponent implements OnInit {
  recipe: IRecipe | undefined;

  isMobile!: boolean;

  errorModalVisible = false;
  errorMessage = '';

  items: MenuItem[] | undefined;

  home: MenuItem | undefined;

  totalRecipeTime!: number;
  isFavourite = false;
  constructor(
    private readonly route: ActivatedRoute,
    private readonly recipesService: RecipesService,
    private readonly deviceService: DeviceDetectorService
  ) {
    this.isMobile = deviceService.isMobile();
  }

  ngOnInit(): void {
    this.route.params.pipe(untilDestroyed(this)).subscribe(params => {
      this.getRecipe(this.route.snapshot.params['id']);
    });

    this.home = { icon: 'pi pi-home', routerLink: '/' };
  }

  getRecipe(documentId: string): void {
    this.recipesService
      .getSingleRecipe(documentId)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (recipe) => {
          this.recipe = { ...recipe };
          this.totalRecipeTime = (parseInt(recipe.preparationTime?.hours ?? '')) * 60;
          this.totalRecipeTime += parseInt(recipe.preparationTime?.minutes ?? '');

          this.items = [
            // { label: recipe.category },
            { label: recipe.title }
          ];

          const container = document.getElementById('recipe-container');
          container?.scrollTo(0, 0);
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.errorModalVisible = true;
        },
      });
  }

  cancel(): void {
    this.errorModalVisible = false;
    this.errorMessage = '';
  }

  markAsFavourite(): void {
    this.isFavourite = !this.isFavourite;
  }
}
