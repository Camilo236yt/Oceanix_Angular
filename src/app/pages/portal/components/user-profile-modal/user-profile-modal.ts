import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface UserProfile {
  fullName: string;
  email: string;
  profilePicture?: string | null;
}

@Component({
  selector: 'app-user-profile-modal',
  imports: [CommonModule],
  templateUrl: './user-profile-modal.html',
  styleUrl: './user-profile-modal.scss'
})
export class UserProfileModal {
  @Input() isOpen: boolean = false;
  @Input() userProfile: UserProfile | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
  @Output() openHistory = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }

  onLogout() {
    this.logout.emit();
  }

  onOpenHistory() {
    this.openHistory.emit();
    this.closeModal(); // Cerrar el modal de perfil al abrir historial
  }

  handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}
