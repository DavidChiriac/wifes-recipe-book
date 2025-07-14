import {
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
  PLATFORM_ID,
} from '@angular/core';
import { IRecipe } from '../../interfaces/recipe.interface';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-recipe-card',
  imports: [CommonModule],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.scss',
})
export class RecipeCardComponent {
  @Input() card!: IRecipe;
  @Output() navigate = new EventEmitter();

  isFavourite = false;

  isMobile!: boolean;

  constructor(
    private readonly router: Router,
    private readonly deviceService: DeviceDetectorService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(platformId)) {
      this.isMobile = deviceService.isMobile();
    }
  }

  viewRecipe(): void {
    this.navigate.emit();
    this.router.navigate(['/recipe/' + this.card.documentId]);
  }

  markAsFavourite(event: Event): void {
    this.isFavourite = !this.isFavourite;
    event.stopPropagation();
  }
}
