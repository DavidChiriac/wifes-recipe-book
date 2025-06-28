import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { RecipeCollectionComponent } from './recipe-collection/recipe-collection.component';
import { MyRecipesComponent } from './my-recipes/my-recipes.component';
import { NewRecipeComponent } from './new-recipe/new-recipe.component';
import { ViewRecipeComponent } from './view-recipe/view-recipe.component';
import { socialAuthGuard } from './shared/guards/auth/social-auth.guard';

export const routes: Routes = [
  { path: '', component: HomePageComponent, pathMatch: 'full' },
  { path: 'recipe/:id', component: ViewRecipeComponent },
  {
    path: 'recipe/:id/edit',
    component: NewRecipeComponent,
    canActivate: [socialAuthGuard],
  },
  {
    path: 'new-recipe',
    component: NewRecipeComponent,
    canActivate: [socialAuthGuard],
  },
  { path: 'recipe-collection', component: RecipeCollectionComponent },
  {
    path: 'my-recipes',
    component: MyRecipesComponent,
    canActivate: [socialAuthGuard],
  },
];
