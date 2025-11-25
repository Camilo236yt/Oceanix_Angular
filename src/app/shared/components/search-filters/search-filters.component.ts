import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { FilterConfig, SearchFilterData } from '../../models/filter.model';

@Component({
  selector: 'app-search-filters',
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './search-filters.component.html',
  styleUrl: './search-filters.component.scss',
})
export class SearchFiltersComponent implements OnInit {
  @Input() searchPlaceholder: string = 'Buscar...';
  @Input() filters: FilterConfig[] = [];
  @Input() showSearch: boolean = true;
  @Input() initialFilters: { [key: string]: string } = {};

  @Output() onSearchChange = new EventEmitter<string>();
  @Output() onFilterChange = new EventEmitter<SearchFilterData>();

  searchTerm: string = '';
  selectedFilters: { [key: string]: string } = {};

  ngOnInit(): void {
    // Inicializar los filtros con valores por defecto o vacíos
    this.filters.forEach(filter => {
      this.selectedFilters[filter.key] = this.initialFilters[filter.key] || '';
    });

    // Emitir el cambio inicial si hay valores por defecto
    if (Object.keys(this.initialFilters).length > 0) {
      this.emitFilterChange();
    }
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.onSearchChange.emit(this.searchTerm);
    this.emitFilterChange();
  }

  onFilterSelect(filterKey: string, event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedFilters[filterKey] = target.value;
    this.emitFilterChange();
  }

  private emitFilterChange(): void {
    this.onFilterChange.emit({
      searchTerm: this.searchTerm,
      filters: this.selectedFilters
    });
  }
}
