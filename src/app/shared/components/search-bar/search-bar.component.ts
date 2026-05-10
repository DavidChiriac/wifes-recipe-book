import { CommonModule } from '@angular/common';
import { Component, input, model, output } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { sortingOptions } from '../../constants/sorting-options';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-search-bar',
  imports: [
    CommonModule,
    SelectModule,
    InputTextModule,
    FormsModule,
    ButtonModule,
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent {
  isMobile = input<boolean>(false);
  searchTerm = model<string>('');
  sortField = model<string | undefined>();
  sortingOptions = sortingOptions;
  filtersVisible = model<boolean>(false);
  formIsEmpty = input<boolean>(true);
  clearFilters = output<void>();

  updateSearchTerm(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }
}
