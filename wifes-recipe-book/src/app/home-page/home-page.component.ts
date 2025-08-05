import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DeviceDetectorService } from 'ngx-device-detector';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RecipesService } from '../shared/services/recipes.service';
import { catchError, map, of } from 'rxjs';
import { HomepagePresentationComponent } from "./homepage-presentation/homepage-presentation.component";
import { SessionStorageService } from 'ngx-webstorage';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, ButtonModule, InputTextModule, FormsModule, HomepagePresentationComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
  private readonly deviceService = inject(DeviceDetectorService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly recipesService = inject(RecipesService);
  private readonly sessionStorage = inject(SessionStorageService);

  isMobile = computed(() => isPlatformBrowser(this.platformId) && this.deviceService.isMobile());

  searchTerm = signal<string>('');
  
  categories$ = this.recipesService.getCategories().pipe(
    catchError(() => of([])),
    takeUntilDestroyed(this.destroyRef),
    map(categories => {
      this.sessionStorage.store('categories', categories);
      return categories;
    })
  );
}
