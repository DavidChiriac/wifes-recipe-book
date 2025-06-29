import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DeviceService } from '../shared/services/device.service';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { RecipesService } from '../shared/services/recipes.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { RecipeCardComponent } from '../shared/components/recipe-card/recipe-card.component';

@UntilDestroy()
@Component({
  selector: 'app-home-page',
  imports: [CommonModule, ButtonModule, RouterModule, RecipeCardComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent implements OnInit {
  isMobile!: boolean;

  recommendedRecipes: IRecipe[] = [];

  constructor(
    private readonly deviceService: DeviceService,
    private readonly recipesService: RecipesService
  ) {
    this.isMobile = deviceService.isMobile();
  }

  ngOnInit(): void {
    this.recipesService
      .getRecommendedRecipes()
      .pipe(untilDestroyed(this))
      .subscribe((recipes) => {
        console.log(recipes);
        this.recommendedRecipes = [...recipes];
      });
  }
}
