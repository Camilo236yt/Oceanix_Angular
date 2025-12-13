import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface UserProfileData {
  id: string;
  name: string;
  lastName: string;
  email: string;
  profilePicture?: string | null;
  roles: Array<{ id: string; name: string }>;
  enterprise: { id: string; name: string };
  createdAt: string;
}

@Component({
  selector: 'app-user-profile-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile-modal.html',
  styleUrl: './user-profile-modal.scss'
})
export class UserProfileModal implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() userData: UserProfileData | null = null;
  @Output() close = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      // Bloquear scroll del body cuando se abre el modal
      document.body.style.overflow = 'hidden';
    } else if (changes['isOpen'] && !this.isOpen) {
      // Restaurar scroll del body cuando se cierra el modal
      document.body.style.overflow = '';
    }
  }

  closeModal(): void {
    document.body.style.overflow = '';
    this.close.emit();
  }

  handleBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  getInitials(name: string, lastName: string): string {
    const firstInitial = name?.charAt(0)?.toUpperCase() || '';
    const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  }
}
