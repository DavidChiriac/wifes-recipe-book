import {
  Component,
  computed,
  inject,
  input,
  model,
} from '@angular/core';
import { IRecipe } from '../../interfaces/recipe.interface';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DeviceService } from '../../services/device.service';
import { RecipesService } from '../../services/recipes.service';
import { UserStateService } from '../../services/user-state.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-recipe-card',
  imports: [CommonModule],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.scss',
})
export class RecipeCardComponent {
  card = input.required<IRecipe>();
  isFavourite = model(false);

  private readonly router = inject(Router);
  private readonly recipesService = inject(RecipesService);
  private readonly userState = inject(UserStateService);

  isMobile = inject(DeviceService).isMobile;

  userIsLoggedIn = computed(() => this.userState.isLoggedIn());

  viewRecipe(): void {
    this.router.navigate(['/recipe/' + this.card().documentId]);
  }

  markAsFavourite(event: Event): void {
    event.stopPropagation();
    this.isFavourite.update((favourite) => !favourite);
    this.recipesService.toggleFavourite(this.card().id ?? '', this.isFavourite()).pipe(take(1)).subscribe();
  }
}
