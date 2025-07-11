import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { RecipeCollectionComponent } from './recipe-collection/recipe-collection.component';
import { MyRecipesComponent } from './my-recipes/my-recipes.component';
import { NewRecipeComponent } from './new-recipe/new-recipe.component';
import { ViewRecipeComponent } from './view-recipe/view-recipe.component';
import { socialAuthGuard } from './shared/guards/auth/social-auth.guard';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';
import { RecipeEditGuard } from './shared/guards/auth/recipe-edit.guard';
import { HomepagePresentationComponent } from './home-page/homepage-presentation/homepage-presentation.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    children: [
      {
        path: '',
        component: HomepagePresentationComponent,
        pathMatch: 'full',
      },
      {
        path: 'collection',
        component: RecipeCollectionComponent,
      },
    ],
  },
  { path: 'recipe/:id', component: ViewRecipeComponent },
  {
    path: 'recipe/:id/edit',
    component: NewRecipeComponent,
    canActivate: [socialAuthGuard, RecipeEditGuard],
  },
  {
    path: 'new-recipe',
    component: NewRecipeComponent,
    canActivate: [socialAuthGuard],
  },
  {
    path: 'my-recipes',
    component: MyRecipesComponent,
    canActivate: [socialAuthGuard],
  },
  { path: 'auth/google/callback', component: AuthCallbackComponent },
];
