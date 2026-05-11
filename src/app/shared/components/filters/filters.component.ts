import { CommonModule } from '@angular/common';
import { Component, input, model, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-filters',
  imports: [
    DrawerModule,
    ButtonModule,
    ReactiveFormsModule,
    MultiSelectModule,
    InputTextModule,
    SelectModule,
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
      authorId: new FormControl<string | null>(null),
      authorName: new FormControl<string | null>(null),
    })
  );
  categoryOptions =
    input.required<{ name: string; id: string; icon: string }[]>();
  authorOptions = input<{ uid: string; displayName: string }[]>([]);
  applyFiltersOutput = output<{
    category: string[];
    minMinutes: number;
    maxMinutes: number;
    authorId?: string | null;
    authorName?: string | null;
  }>();
  filtersVisible = model<boolean>(false);

  applyFilters(): void {
    const selected = this.authorOptions().find(a => a.uid === this.filtersForm().value.authorId);
    this.applyFiltersOutput.emit({
      category: this.filtersForm().value.category || [],
      minMinutes: this.filtersForm().value.minMinutes || null,
      maxMinutes: this.filtersForm().value.maxMinutes || null,
      authorId: this.filtersForm().value.authorId || null,
      authorName: selected?.displayName || null,
    });
  }
}
