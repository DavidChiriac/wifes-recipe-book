import {
  Component,
  computed,
  inject,
  input,
  output,
  PLATFORM_ID,
} from '@angular/core';
import { IRecipe } from '../../interfaces/recipe.interface';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-extended-card',
  imports: [ButtonModule, CommonModule, RouterModule],
  templateUrl: './extended-card.component.html',
  styleUrl: './extended-card.component.scss',
})
export class ExtendedCardComponent {
  readonly recipe = input.required<IRecipe>();
  readonly deleted = output<string>();

  private readonly router = inject(Router);
  private readonly deviceService = inject(DeviceDetectorService);
  private readonly platformId = inject(PLATFORM_ID);

  isMobile = computed(
    () => isPlatformBrowser(this.platformId) && this.deviceService.isMobile()
  );

  deleteModalVisible = false;

  view(): void {
    this.router.navigate(['recipe/' + this.recipe().documentId]);
  }

  edit(): void {
    this.router.navigate(['recipe/' + this.recipe().documentId + '/edit']);
  }

  delete(): void {
    this.deleted.emit(this.recipe().documentId ?? '');
  }
}
