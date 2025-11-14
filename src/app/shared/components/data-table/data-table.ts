import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableColumn, TableAction } from '../../models/table.model';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-data-table',
  imports: [CommonModule, IconComponent],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss'
})
export class DataTable implements OnChanges {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() actions: TableAction[] = [];
  @Output() onActionClick = new EventEmitter<{ action: TableAction; row: any }>();
  @Output() onViewMorePermissions = new EventEmitter<{ permissions: string[]; roleName: string }>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      console.log('DataTable recibió datos:', this.data);
      console.log('Cantidad de registros:', this.data?.length);
    }
  }

  handleAction(action: TableAction, row: any) {
    this.onActionClick.emit({ action, row });
  }

  getBadgeClasses(column: TableColumn, value: string): string {
    if (column.badgeConfig && column.badgeConfig[value]) {
      const config = column.badgeConfig[value];
      return `inline-flex items-center px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${config.color} ${config.bgColor}`;
    }
    return 'inline-flex items-center px-2 py-1 rounded text-xs font-medium whitespace-nowrap text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700';
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

  handleViewMorePermissions(row: any) {
    this.onViewMorePermissions.emit({
      permissions: row.permisos || [],
      roleName: row.rol || 'Rol'
    });
  }
}
