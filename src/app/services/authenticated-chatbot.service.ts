import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface FunctionCall {
    name: string;
    arguments: any;
    result?: any;
}

export interface StructuredData {
    type: 'table' | 'list' | 'card' | 'stat';
    data: any;
}

export interface AuthenticatedChatResponse {
    message: string;
    conversationId: string;
    messageCount: number;
    hasExecutedFunction?: boolean;
    functionCall?: FunctionCall;
    structuredData?: StructuredData;
}

export interface Conversation {
    id: string;
    userId: string;
    enterpriseId: string;
    messages: ChatMessage[];
    messageCount: number;
    title: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthenticatedChatbotService {
    private apiUrl = `${environment.apiUrl}/chatbot/authenticated`;

    constructor(private http: HttpClient) { }

    /**
     * Envía un mensaje al chatbot autenticado
     */
    chat(messages: ChatMessage[], conversationId?: string): Observable<AuthenticatedChatResponse> {
        return this.http.post<{ success: boolean; data: AuthenticatedChatResponse; statusCode: number }>(`${this.apiUrl}/chat`, {
            messages,
            conversationId
        }).pipe(
            map(response => response.data)
        );
    }

    /**
     * Obtiene las conversaciones del usuario
     */
    getConversations(limit: number = 10): Observable<Conversation[]> {
        return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`, {
            params: { limit: limit.toString() }
        });
    }

    /**
     * Obtiene una conversación específica
     */
    getConversation(conversationId: string): Observable<Conversation> {
        return this.http.get<Conversation>(`${this.apiUrl}/conversations/${conversationId}`);
    }

    /**
     * Elimina una conversación
     */
    deleteConversation(conversationId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/conversations/${conversationId}`);
    }
}
