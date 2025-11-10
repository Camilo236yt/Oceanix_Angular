export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

export interface SearchFilterData {
  searchTerm: string;
  filters: { [key: string]: string };
}
