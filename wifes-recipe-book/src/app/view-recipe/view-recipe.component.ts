import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { TextareaModule } from 'primeng/textarea';
import { ImageModule } from 'primeng/image';
import { RecipesService } from '../shared/services/recipes.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DeviceDetectorService } from 'ngx-device-detector';
import { CheckboxModule } from 'primeng/checkbox';
import { HomepagePresentationComponent } from '../home-page/homepage-presentation/homepage-presentation.component';
import { LocalStorageService } from 'ngx-webstorage';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-view-recipe',
  imports: [
    TextareaModule,
    ImageModule,
    CommonModule,
    DialogModule,
    ButtonModule,
    CheckboxModule,
    HomepagePresentationComponent,
  ],
  templateUrl: './view-recipe.component.html',
  styleUrl: './view-recipe.component.scss',
})
export class ViewRecipeComponent {
  private readonly deviceService = inject(DeviceDetectorService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly recipesService = inject(RecipesService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly id = input.required<string>();

  recipe: IRecipe | undefined;

  isMobile = computed(
    () => isPlatformBrowser(this.platformId) && this.deviceService.isMobile()
  );
  userIsLoggedIn = computed(() =>
    Boolean(this.localStorageService.retrieve('user'))
  );

  errorModalVisible = signal(false);
  errorMessage = signal('');

  isFavourite!: boolean;

  constructor() {
    effect(() => {
      if (this.id()) {
        this.getRecipe(this.id());
      }
    });
  }

  getRecipe(documentId: string): void {
    this.recipesService
      .getSingleRecipe(documentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (recipe) => {
          this.recipe = { ...recipe };

          this.isFavourite = recipe.isFavourite ?? false;

          const container = document.getElementById('recipe-container');
          container?.scrollTo(0, 0);
        },
        error: (error) => {
          this.errorMessage.set(error.message);
          this.errorModalVisible.set(true);
        },
      });
  }

  cancel(): void {
    this.errorModalVisible.set(false);
    this.errorMessage.set('');
  }

  markAsFavourite(): void {
    this.isFavourite = !this.isFavourite;

    this.recipesService
      .toggleFavourite(this.recipe?.id ?? '', this.isFavourite)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    let cachedRecommendedRecipes =
      this.localStorageService.retrieve('recommendedRecipes');

    let isCached = false;
    cachedRecommendedRecipes = cachedRecommendedRecipes.map(
      (recipe: IRecipe) => {
        if (recipe.documentId === this.recipe?.documentId) {
          isCached = true;
          return {
            ...recipe,
            isFavourite: this.isFavourite,
          };
        }
        return recipe;
      }
    );

    if (isCached) {
      this.localStorageService.store(
        'recommendedRecipes',
        cachedRecommendedRecipes
      );
    }
  }
}
