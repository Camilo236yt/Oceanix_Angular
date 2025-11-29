import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableColumn, TableAction } from '../../models/table.model';
import { IconComponent } from '../icon/icon.component';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-data-table',
  imports: [CommonModule, IconComponent, PaginationComponent],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss'
})
export class DataTable implements OnChanges {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() actions: TableAction[] = [];

  // Server-side pagination inputs
  @Input() showPagination: boolean = false;
  @Input() currentPage: number = 1;
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 10;
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];

  @Output() onActionClick = new EventEmitter<{ action: TableAction; row: any }>();
  @Output() onViewMorePermissions = new EventEmitter<{ permissions: string[]; roleName: string }>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  ngOnChanges(changes: SimpleChanges): void {
    // Data changes are now handled by parent component for server-side pagination
  }

  handleAction(action: TableAction, row: any): void {
    this.onActionClick.emit({ action, row });
  }

  handlePageChange(page: number): void {
    this.pageChange.emit(page);
  }

  handlePageSizeChange(size: number): void {
    this.pageSizeChange.emit(size);
  }

  getBadgeClasses(column: TableColumn, value: string, row?: any): string {
    if (column.badgeConfig && column.badgeConfig[value]) {
      const config = column.badgeConfig[value];
      return `inline-flex items-center px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${config.color} ${config.bgColor}`;
    }
    // Default color based on userType: blue for CLIENT, purple for EMPLOYEE
    if (row?.userType === 'CLIENT') {
      return 'inline-flex items-center px-2 py-1 rounded text-xs font-medium whitespace-nowrap text-blue-600 dark:text-blue-400 bg-transparent dark:bg-transparent';
    }
    return 'inline-flex items-center px-2 py-1 rounded text-xs font-medium whitespace-nowrap text-purple-600 dark:text-purple-400 bg-transparent dark:bg-transparent';
  }

  getNestedValue(obj: any, key: string): any {
    return key.split('.').reduce((o, k) => (o || {})[k], obj);
  }

  getVisiblePermissions(permissions: string[], limit: number = 2): string[] {
    return permissions?.slice(0, limit) || [];
  }

  hasMorePermissions(permissions: string[], limit: number = 2): boolean {
    return permissions?.length > limit;
  }

  handleViewMorePermissions(row: any): void {
    this.onViewMorePermissions.emit({
      permissions: row.permisos || [],
      roleName: row.rol || 'Rol'
    });
  }

  getVisibleActions(row: any): TableAction[] {
    return this.actions.filter(action => {
      // Si la acción tiene una condición, evaluarla
      if (action.condition) {
        return action.condition(row);
      }
      // Si no tiene condición, mostrar la acción
      return true;
    });
  }
}
