import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { TextareaModule } from 'primeng/textarea';
import { ImageModule } from 'primeng/image';
import { RecipesService } from '../shared/services/recipes.service';
import { CommonModule, Location } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DeviceService } from '../shared/services/device.service';
import { CheckboxModule } from 'primeng/checkbox';
import { UserStateService } from '../shared/services/user-state.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { take } from 'rxjs';
import { preloadImages } from '../shared/utils/preload-images';

@Component({
  selector: 'app-view-recipe',
  imports: [
    TextareaModule,
    ImageModule,
    CommonModule,
    DialogModule,
    ButtonModule,
    CheckboxModule,
    RouterModule
  ],
  templateUrl: './view-recipe.component.html',
  styleUrl: './view-recipe.component.scss',
})
export class ViewRecipeComponent {
  private readonly userState = inject(UserStateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly recipesService = inject(RecipesService);
  private readonly location = inject(Location);

  readonly id = input.required<string>();

  recipe = signal<IRecipe | undefined>(undefined);

  isMobile = inject(DeviceService).isMobile;
  userIsLoggedIn = computed(() => this.userState.isLoggedIn());

  errorModalVisible = signal(false);
  errorMessage = signal('');

  isFavourite!: boolean;

  userIsOwner = computed(() => {
    const user = this.userState.user();
    return user && this.recipe()?.author?.documentId === user.documentId;
  });

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
          preloadImages([recipe.coverImage?.url]).then(() => {
            this.recipe.set({ ...recipe });

            this.isFavourite = recipe.isFavourite ?? false;

            const container = document.getElementById('recipe-container');
            container?.scrollTo(0, 0);
          });
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
      .toggleFavourite(this.recipe()?.id ?? '', this.isFavourite)
      .pipe(take(1))
      .subscribe();
  }

  goBack(): void {
    this.location.back();
  }
}
