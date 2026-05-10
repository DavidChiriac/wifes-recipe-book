import {
  Component,
  computed,
  inject,
  input,
  model,
  PLATFORM_ID,
} from '@angular/core';
import { IRecipe } from '../../interfaces/recipe.interface';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DeviceDetectorService } from 'ngx-device-detector';
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
  private readonly deviceService = inject(DeviceDetectorService);
  private readonly recipesService = inject(RecipesService);
  private readonly userState = inject(UserStateService);
  private readonly platformId = inject(PLATFORM_ID);

  isMobile= computed(
    () => isPlatformBrowser(this.platformId) && this.deviceService.isMobile()
  );

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
