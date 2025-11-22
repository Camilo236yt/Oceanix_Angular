import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { RoleData } from '../../../interface/roles-api.interface';

@Component({
  selector: 'app-view-role-modal',
  imports: [CommonModule, IconComponent],
  templateUrl: './view-role-modal.html',
  styleUrl: './view-role-modal.scss'
})
export class ViewRoleModalComponent {
  @Input() isOpen = false;
  @Input() roleData: RoleData | null = null;
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  getEstadoText(): string {
    return this.roleData?.isActive ? 'Activo' : 'Inactivo';
  }

  getCanReceiveIncidentsText(): string {
    // Check if the property exists in roleData
    const canReceive = (this.roleData as any)?.canReceiveIncidents;
    return canReceive ? 'Sí' : 'No';
  }
}
