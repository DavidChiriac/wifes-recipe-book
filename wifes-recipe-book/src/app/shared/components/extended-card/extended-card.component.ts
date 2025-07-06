import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IRecipe } from '../../interfaces/recipe.interface';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DeviceService } from '../../services/device.service';

@Component({
  selector: 'app-extended-card',
  imports: [ButtonModule, CommonModule],
  templateUrl: './extended-card.component.html',
  styleUrl: './extended-card.component.scss',
})
export class ExtendedCardComponent {
  @Input() recipe!: IRecipe;

  @Output() deleted = new EventEmitter<string>();

  isMobile!: boolean;

  deleteModalVisible = false;

  constructor(
    private readonly router: Router,
    private readonly deviceService: DeviceService,
  ) {
    this.isMobile = deviceService.isMobile();
  }

  view(): void {
    this.router.navigate(['recipe/' + this.recipe.documentId]);
  }

  edit(): void {
    this.router.navigate(['recipe/' + this.recipe.documentId + '/edit']);
  }

  delete(): void {
    this.deleted.emit(this.recipe.documentId ?? '');
  }
}
