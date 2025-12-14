import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    AuthenticatedChatbotService,
    ChatMessage,
    StructuredData
} from '../../../services/authenticated-chatbot.service';
import { MarkdownPipe } from '../../pipes/markdown.pipe';

export interface DisplayMessage extends ChatMessage {
    structuredData?: StructuredData;
    isLoading?: boolean;
}

@Component({
    selector: 'app-crm-chatbot',
    standalone: true,
    imports: [CommonModule, FormsModule, MarkdownPipe],
    templateUrl: './crm-chatbot.component.html',
    styleUrl: './crm-chatbot.component.scss'
})
export class CrmChatbotComponent implements OnInit, AfterViewChecked {
    @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

    isOpen = false;
    messages: DisplayMessage[] = [];
    userInput = '';
    isLoading = false;
    conversationId?: string;
    private shouldScrollToBottom = false;

    constructor(
        private chatbotService: AuthenticatedChatbotService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        // Mensaje de bienvenida si no hay mensajes
        if (this.messages.length === 0) {
            this.messages.push({
                role: 'assistant',
                content: '¡Hola! 👋 Soy tu asistente de IA para Oceanix CRM. Puedo ayudarte a consultar incidencias, usuarios, estadísticas y más. ¿En qué puedo ayudarte?'
            });
        }
    }

    ngAfterViewChecked(): void {
        if (this.shouldScrollToBottom) {
            this.scrollToBottom();
            this.shouldScrollToBottom = false;
        }
    }

    toggleChat(): void {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.shouldScrollToBottom = true;
        }
    }

    async sendMessage(): Promise<void> {
        if (!this.userInput.trim() || this.isLoading) return;

        const userMessage = this.userInput.trim();
        this.userInput = '';

        // Agregar mensaje del usuario
        this.messages.push({
            role: 'user',
            content: userMessage
        });

        this.shouldScrollToBottom = true;
        this.isLoading = true;

        // Agregar mensaje de carga
        const loadingMessageIndex = this.messages.length;
        this.messages.push({
            role: 'assistant',
            content: '',
            isLoading: true
        });

        try {
            // Preparar mensajes para enviar (solo user y assistant, sin isLoading)
            const messagesToSend: ChatMessage[] = this.messages
                .filter(msg => !msg.isLoading)
                .map(msg => ({
                    role: msg.role,
                    content: msg.content
                }));

            // Enviar a la API del chatbot
            const response = await this.chatbotService.chat(messagesToSend, this.conversationId).toPromise();

            if (response) {
                // Guardar conversation ID
                this.conversationId = response.conversationId;

                // Reemplazar mensaje de carga con la respuesta real
                this.messages[loadingMessageIndex] = {
                    role: 'assistant',
                    content: response.message,
                    structuredData: response.structuredData,
                    isLoading: false
                };

                console.log('Function executed:', response.hasExecutedFunction);
                console.log('Structured data:', response.structuredData);
            }

            this.shouldScrollToBottom = true;
            this.isLoading = false;
            this.cdr.detectChanges();

        } catch (error) {
            console.error('Error al comunicarse con el chatbot:', error);

            // Reemplazar mensaje de carga con error
            this.messages[loadingMessageIndex] = {
                role: 'assistant',
                content: 'Lo siento, hubo un problema al procesar tu pregunta. Por favor, intenta de nuevo en unos momentos. 🙏',
                isLoading: false
            };

            this.shouldScrollToBottom = true;
            this.isLoading = false;
            this.cdr.detectChanges();
        }
    }

    clearChat(): void {
        this.messages = [{
            role: 'assistant',
            content: '¡Hola! 👋 Soy tu asistente de IA para Oceanix CRM. Puedo ayudarte a consultar incidencias, usuarios, estadísticas y más. ¿En qué puedo ayudarte?'
        }];
        this.conversationId = undefined;
        this.shouldScrollToBottom = true;
    }

    private scrollToBottom(): void {
        try {
            if (this.messagesContainer) {
                this.messagesContainer.nativeElement.scrollTop =
                    this.messagesContainer.nativeElement.scrollHeight;
            }
        } catch (err) {
            console.error('Error al hacer scroll:', err);
        }
    }

    /**
     * Renderiza una tabla desde structured data
     */
    renderTable(data: any): string {
        if (!data || !data.headers || !data.rows) {
            return '';
        }

        let html = '<div class="chat-table-container"><table class="chat-table">';

        // Headers
        html += '<thead><tr>';
        data.headers.forEach((header: string) => {
            html += `<th>${header}</th>`;
        });
        html += '</tr></thead>';

        // Rows
        html += '<tbody>';
        data.rows.forEach((row: any[]) => {
            html += '<tr>';
            row.forEach((cell: any) => {
                html += `<td>${cell}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody>';

        html += '</table></div>';

        // Pagination info
        if (data.pagination) {
            html += `<div class="table-pagination">
        Página ${data.pagination.currentPage} de ${data.pagination.totalPages} 
        (${data.pagination.total} registros totales)
      </div>`;
        }

        return html;
    }

    /**
     * Renderiza una card desde structured data
     */
    renderCard(data: any): string {
        if (!data || !data.fields) {
            return '';
        }

        let html = '<div class="chat-card">';

        if (data.title) {
            html += `<div class="chat-card-title">${data.title}</div>`;
        }

        html += '<div class="chat-card-fields">';
        data.fields.forEach((field: any) => {
            html += `
        <div class="chat-card-field">
          <span class="field-label">${field.label}:</span>
          <span class="field-value">${field.value}</span>
        </div>
      `;
        });
        html += '</div></div>';

        return html;
    }

    /**
     * Renderiza stats desde structured data
     */
    renderStats(data: any): string {
        if (!data || !data.stats) {
            return '';
        }

        let html = '<div class="chat-stats">';
        data.stats.forEach((stat: any) => {
            html += `
        <div class="stat-item">
          <div class="stat-value">${stat.value}</div>
          <div class="stat-label">${stat.label}</div>
        </div>
      `;
        });
        html += '</div>';

        return html;
    }

    /**
     * Renderiza una lista desde structured data
     */
    renderList(data: any): string {
        if (!data || !data.items) {
            return '';
        }

        let html = '<div class="chat-list"><ul>';
        data.items.forEach((item: any) => {
            html += `<li><strong>${item.name}</strong>`;
            if (item.description) {
                html += ` - ${item.description}`;
            }
            if (item.permissionCount !== undefined) {
                html += ` (${item.permissionCount} permisos)`;
            }
            html += '</li>';
        });
        html += '</ul></div>';

        return html;
    }
}
