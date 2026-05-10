import {
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { IRecipe } from '../../interfaces/recipe.interface';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DeviceService } from '../../services/device.service';

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
  isMobile = inject(DeviceService).isMobile;

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
