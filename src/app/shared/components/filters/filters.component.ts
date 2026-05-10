import { CommonModule } from '@angular/common';
import { Component, input, model, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-filters',
  imports: [
    DrawerModule,
    ButtonModule,
    ReactiveFormsModule,
    MultiSelectModule,
    InputTextModule,
    CommonModule,
  ],
  templateUrl: './filters.component.html',
})
export class FiltersComponent {
  isMobile = input<boolean>(false);
  filtersForm = input(
    new FormGroup({
      category: new FormControl<string[]>([]),
      minMinutes: new FormControl(),
      maxMinutes: new FormControl(),
    })
  );
  categoryOptions =
    input.required<{ name: string; id: string; icon: string }[]>();
  applyFiltersOutput = output<{
    category: string[];
    minMinutes: number;
    maxMinutes: number;
  }>();
  filtersVisible = model<boolean>(false);

  applyFilters(): void {
    this.applyFiltersOutput.emit({
      category: this.filtersForm().value.category || [],
      minMinutes: this.filtersForm().value.minMinutes || null,
      maxMinutes: this.filtersForm().value.maxMinutes || null,
    });
  }
}
