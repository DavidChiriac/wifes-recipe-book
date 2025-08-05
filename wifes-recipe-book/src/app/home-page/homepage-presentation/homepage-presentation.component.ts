import {
  Component,
  computed,
  DestroyRef,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { RecipesService } from '../../shared/services/recipes.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RecipeCardComponent } from '../../shared/components/recipe-card/recipe-card.component';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-homepage-presentation',
  imports: [RecipeCardComponent, ButtonModule, RouterModule, CommonModule],
  templateUrl: './homepage-presentation.component.html',
  styleUrl: './homepage-presentation.component.scss',
})
export class HomepagePresentationComponent {
  private readonly recipesService = inject(RecipesService);
  private readonly deviceService = inject(DeviceDetectorService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  recommendedRecipes$ = this.recipesService
    .getRecommendedRecipes()
    .pipe(takeUntilDestroyed(this.destroyRef));

  isMobile = computed(
    () => isPlatformBrowser(this.platformId) && this.deviceService.isMobile()
  );
}
