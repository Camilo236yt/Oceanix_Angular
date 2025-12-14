import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ChatMessage } from '../../../services/chatbot.service';
import { MarkdownPipe } from '../../pipes/markdown.pipe';

@Component({
  selector: 'app-landing-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownPipe],
  templateUrl: './landing-chatbot.component.html',
  styleUrl: './landing-chatbot.component.scss'
})
export class LandingChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  isOpen = false;
  messages: ChatMessage[] = [];
  userInput = '';
  isLoading = false;
  questionCount = 0;
  remainingQuestions = 100;
  sessionId = '';
  suggestedQuestions: string[] = [];
  showSuggestions = true;
  private shouldScrollToBottom = false;

  constructor(
    private chatbotService: ChatbotService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Generar o recuperar session ID
    this.sessionId = this.chatbotService.generateSessionId();

    // Cargar preguntas sugeridas
    this.suggestedQuestions = this.chatbotService.getSuggestedQuestions();

    // Cargar historial desde localStorage
    this.loadChatHistory();

    // Cargar info de sesión desde el servidor
    this.loadSessionInfo();

    // Mensaje de bienvenida si no hay mensajes
    if (this.messages.length === 0) {
      this.messages.push({
        role: 'assistant',
        content: '¡Hola! 👋 Soy el asistente virtual de Oceanix. Estoy aquí para ayudarte con cualquier pregunta sobre nuestro sistema de gestión de incidencias. ¿En qué puedo ayudarte hoy?'
      });
      this.saveChatHistory();
      this.showSuggestions = true;
    } else {
      // Mostrar sugerencias solo si hay exactamente 1 mensaje (bienvenida) y no hay mensajes de usuario
      const hasUserMessages = this.messages.some(msg => msg.role === 'user');
      this.showSuggestions = !hasUserMessages && this.messages.length === 1;
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

    // Ocultar sugerencias después del primer mensaje
    this.showSuggestions = false;

    // Agregar mensaje del usuario
    this.messages.push({
      role: 'user',
      content: userMessage
    });

    this.shouldScrollToBottom = true;
    this.isLoading = true;
    this.saveChatHistory();

    try {
      // Filtrar mensajes válidos (no vacíos) antes de enviar
      const validMessages = this.messages.filter(msg =>
        msg.content && msg.content.trim().length > 0
      );

      // Enviar a la API del chatbot
      this.chatbotService.chat(validMessages, this.sessionId).subscribe({
        next: (response) => {
          // Agregar respuesta del asistente
          this.messages.push({
            role: 'assistant',
            content: response.message
          });

          // Actualizar contadores
          this.questionCount = response.questionCount;
          this.remainingQuestions = response.remainingQuestions;

          this.shouldScrollToBottom = true;
          this.isLoading = false;
          this.saveChatHistory();

          // Forzar detección de cambios
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al comunicarse con el chatbot:', error);

          // Mensaje de error amigable
          this.messages.push({
            role: 'assistant',
            content: 'Lo siento, hubo un problema al procesar tu pregunta. Por favor, intenta de nuevo en unos momentos. 🙏'
          });

          this.shouldScrollToBottom = true;
          this.isLoading = false;
          this.saveChatHistory();

          // Forzar detección de cambios
          this.cdr.detectChanges();
        }
      });
    } catch (error) {
      console.error('Error inesperado:', error);
      this.isLoading = false;
    }
  }

  clearChat(): void {
    this.messages = [{
      role: 'assistant',
      content: '¡Hola! 👋 Soy el asistente virtual de Oceanix. Estoy aquí para ayudarte con cualquier pregunta sobre nuestro sistema de gestión de incidencias. ¿En qué puedo ayudarte hoy?'
    }];
    this.showSuggestions = true;
    this.saveChatHistory();
    this.shouldScrollToBottom = true;
  }

  /**
   * Envía una pregunta sugerida
   */
  sendSuggestedQuestion(question: string): void {
    this.userInput = question;
    this.sendMessage();
  }

  private loadSessionInfo(): void {
    this.chatbotService.getSessionInfo(this.sessionId).subscribe({
      next: (info) => {
        this.questionCount = info.questionCount;
        this.remainingQuestions = info.remainingQuestions;
      },
      error: (error) => {
        console.error('Error al cargar info de sesión:', error);
      }
    });
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

  private saveChatHistory(): void {
    try {
      localStorage.setItem('oceanix_chatbot_history', JSON.stringify(this.messages));
    } catch (error) {
      console.error('Error al guardar historial:', error);
    }
  }

  private loadChatHistory(): void {
    try {
      const savedHistory = localStorage.getItem('oceanix_chatbot_history');
      if (savedHistory) {
        this.messages = JSON.parse(savedHistory);
      }
    } catch (error) {
      console.error('Error al cargar historial:', error);
    }
  }

  get isLimitReached(): boolean {
    return this.remainingQuestions <= 0;
  }

  get showWarning(): boolean {
    return this.remainingQuestions <= 10 && this.remainingQuestions > 0;
  }
}
