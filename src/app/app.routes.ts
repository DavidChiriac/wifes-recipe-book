import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { RecipeCollectionComponent } from './recipe-collection/recipe-collection.component';
import { MyRecipesComponent } from './my-recipes/my-recipes.component';
import { RecipeComponent } from './recipe/recipe.component';
import { NewRecipeComponent } from './new-recipe/new-recipe.component';
import { ViewRecipeComponent } from './recipe/view-recipe/view-recipe.component';
import { EditRecipeComponent } from './recipe/edit-recipe/edit-recipe.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent, pathMatch: 'full' },
  {
    path: 'recipe/:id',
    component: RecipeComponent,
    children: [
      { path: '', component: ViewRecipeComponent, pathMatch: 'full' },
      { path: 'edit', component: EditRecipeComponent },
    ],
  },
  { path: 'new-recipe', component: NewRecipeComponent },
  { path: 'recipe-collection', component: RecipeCollectionComponent },
  { path: 'my-recipes', component: MyRecipesComponent },
];
