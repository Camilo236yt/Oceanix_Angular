import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  message: string;
  questionCount: number;
  remainingQuestions: number;
  limitReached: boolean;
}

export interface SessionInfo {
  questionCount: number;
  remainingQuestions: number;
  limitReached: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = `${environment.apiUrl}/chatbot`;

  constructor(private http: HttpClient) {}

  /**
   * Envía un mensaje al chatbot
   */
  chat(messages: ChatMessage[], sessionId: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/chat`, {
      messages,
      sessionId
    });
  }

  /**
   * Obtiene información de la sesión actual
   */
  getSessionInfo(sessionId: string): Observable<SessionInfo> {
    return this.http.get<SessionInfo>(`${this.apiUrl}/session/${sessionId}`);
  }

  /**
   * Resetea el contador de preguntas de una sesión
   */
  resetSession(sessionId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/session/${sessionId}`);
  }

  /**
   * Genera un ID de sesión único basado en el navegador
   */
  generateSessionId(): string {
    const stored = localStorage.getItem('oceanix_chatbot_session_id');
    if (stored) {
      return stored;
    }

    const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('oceanix_chatbot_session_id', newId);
    return newId;
  }
}
