import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { IncidentData } from '../../../features/crm/models/incident.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../features/environments/environment';

interface Message {
  id: string;
  content: string;
  senderType: 'EMPLOYEE' | 'CLIENT';
  messageType: string;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    lastName: string;
    email?: string;
  };
  attachments?: string[];
}

interface MessagesResponse {
  messages: Message[];
  totalCount: number;
  hasMore: boolean;
  oldestMessageId?: string;
  newestMessageId?: string;
}

@Component({
  selector: 'app-attend-incident-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './attend-incident-modal.html',
  styleUrls: ['./attend-incident-modal.scss']
})
export class AttendIncidentModalComponent implements OnChanges, OnInit {
  @Input() isOpen = false;
  @Input() incidentData: IncidentData | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onStatusChange = new EventEmitter<{ id: string; status: string }>();

  messages: Message[] = [];
  newMessage = '';
  isLoadingMessages = false;
  isSendingMessage = false;
  selectedStatus = '';

  private apiUrl = `${environment.apiUrl}/incidencias`;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    if (this.incidentData) {
      this.selectedStatus = this.incidentData.status;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']) {
      if (this.isOpen) {
        document.body.style.overflow = 'hidden';
        if (this.incidentData) {
          this.selectedStatus = this.incidentData.status;
          this.loadMessages();
        }
      } else {
        document.body.style.overflow = '';
        this.messages = [];
        this.newMessage = '';
      }
    }
  }

  loadMessages() {
    if (!this.incidentData) return;

    this.isLoadingMessages = true;
    this.http.get<{ success: boolean; data: MessagesResponse }>(
      `${this.apiUrl}/${this.incidentData.id}/messages`,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.messages = response.data.messages || [];
        this.isLoadingMessages = false;
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.isLoadingMessages = false;
      }
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.incidentData || this.isSendingMessage) return;

    this.isSendingMessage = true;
    this.http.post<any>(
      `${this.apiUrl}/${this.incidentData.id}/messages`,
      { content: this.newMessage },
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.messages.push(response.data || response);
        this.newMessage = '';
        this.isSendingMessage = false;
        // Scroll to bottom
        setTimeout(() => {
          const chatContainer = document.getElementById('chat-messages');
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }, 100);
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.isSendingMessage = false;
      }
    });
  }

  updateStatus() {
    if (!this.incidentData || this.selectedStatus === this.incidentData.status) return;
    this.onStatusChange.emit({ id: this.incidentData.id, status: this.selectedStatus });
  }

  closeModal() {
    this.onClose.emit();
  }

  handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  formatDateTime(isoDate: string): string {
    const date = new Date(isoDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  formatMessageTime(isoDate: string): string {
    const date = new Date(isoDate);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  get tipoLabel(): string {
    const tipoMap: { [key: string]: string } = {
      'por_perdida': 'Pérdida',
      'por_dano': 'Daño',
      'por_error_humano': 'Error Humano',
      'por_mantenimiento': 'Mantenimiento',
      'por_falla_tecnica': 'Falla Técnica',
      'otro': 'Otro'
    };
    return tipoMap[this.incidentData?.tipo || ''] || this.incidentData?.tipo || 'N/A';
  }

  get statusLabel(): string {
    const statusMap: { [key: string]: string } = {
      'RESOLVED': 'Resuelto',
      'PENDING': 'Pendiente',
      'IN_PROGRESS': 'En Progreso'
    };
    return statusMap[this.incidentData?.status || ''] || this.incidentData?.status || 'N/A';
  }

  get createdByName(): string {
    if (!this.incidentData) return 'Sistema';
    const createdBy = (this.incidentData as any).createdBy;
    if (createdBy && createdBy.name) {
      return `${createdBy.name} ${createdBy.lastName || ''}`.trim();
    }
    return 'Sistema';
  }

  get assignedEmployeeName(): string {
    if (!this.incidentData) return 'Sin asignar';
    const assignedEmployee = (this.incidentData as any).assignedEmployee;
    if (assignedEmployee && assignedEmployee.name) {
      return `${assignedEmployee.name} ${assignedEmployee.lastName || ''}`.trim();
    }
    return 'Sin asignar';
  }
}
