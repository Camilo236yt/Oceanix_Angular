import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableColumn, TableAction } from '../../models/table.model';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-data-table',
  imports: [CommonModule, IconComponent],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() actions: TableAction[] = [];
  @Output() onActionClick = new EventEmitter<{ action: TableAction; row: any }>();

  handleAction(action: TableAction, row: any) {
    this.onActionClick.emit({ action, row });
  }

  getBadgeClasses(column: TableColumn, value: string): string {
    if (column.badgeConfig && column.badgeConfig[value]) {
      const config = column.badgeConfig[value];
      return `inline-flex items-center px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${config.color} ${config.bgColor}`;
    }
    return 'inline-flex items-center px-2 py-1 rounded text-xs font-medium whitespace-nowrap text-gray-700 bg-gray-100';
  }

  getNestedValue(obj: any, key: string): any {
    return key.split('.').reduce((o, k) => (o || {})[k], obj);
  }
}
