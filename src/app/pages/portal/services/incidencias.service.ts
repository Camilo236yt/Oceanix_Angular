import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Incidencia, CrearIncidenciaRequest } from '../models/incidencia.model';
import { environment } from '../../../environments/environment';

interface IncidenciasApiResponse {
  success: boolean;
  data: Incidencia[];
}

export interface Message {
  id: string;
  content: string;
  senderType: 'EMPLOYEE' | 'CLIENT';
  messageType: string;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    lastName: string;
  };
}

interface MessagesResponse {
  messages: Message[];
  totalCount: number;
  hasMore: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class IncidenciasService {

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las incidencias del cliente autenticado
   */
  getIncidencias(): Observable<Incidencia[]> {
    return this.http.get<IncidenciasApiResponse>(
      `${environment.apiUrl}/incidencias/client/me`,
      { withCredentials: true }
    ).pipe(
      map(response => {
        console.log('API Response incidencias cliente:', response);
        return response.data || [];
      })
    );
  }

  /**
   * Obtener una incidencia por ID
   */
  getIncidenciaById(id: number): Observable<Incidencia> {
    return this.http.get<Incidencia>(
      `${environment.apiUrl}/incidencias/${id}`,
      { withCredentials: true }
    );
  }

  /**
   * Obtener detalle completo de una incidencia del cliente (incluye imágenes)
   */
  getMyIncidenciaById(id: string): Observable<Incidencia> {
    return this.http.get<{ success: boolean; data: Incidencia; statusCode: number }>(
      `${environment.apiUrl}/incidencias/client/me/${id}`,
      { withCredentials: true }
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Crear una nueva incidencia
   */
  crearIncidencia(request: CrearIncidenciaRequest): Observable<Incidencia> {
    return this.http.post<Incidencia>(
      `${environment.apiUrl}/incidencias/client`,
      request,
      { withCredentials: true }
    );
  }

  /**
   * Crear una nueva incidencia con imágenes
   */
  crearIncidenciaConImagenes(request: CrearIncidenciaRequest, imagenes: File[]): Observable<Incidencia> {
    const formData = new FormData();

    // Agregar campos del request
    formData.append('name', request.name);
    formData.append('description', request.description);
    formData.append('ProducReferenceId', request.ProducReferenceId);
    formData.append('tipo', request.tipo);

    // Agregar imágenes
    imagenes.forEach((imagen) => {
      formData.append('images', imagen);
    });

    return this.http.post<Incidencia>(
      `${environment.apiUrl}/incidencias/client`,
      formData,
      { withCredentials: true }
    );
  }

  /**
   * Eliminar (cancelar) una incidencia por ID
   */
  eliminarIncidencia(id: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/incidencias/client/me/${id}`,
      { withCredentials: true }
    );
  }

  /**
   * Obtener mensajes de una incidencia del cliente
   */
  getMessages(incidenciaId: string): Observable<Message[]> {
    return this.http.get<{ data: MessagesResponse; statusCode: number }>(
      `${environment.apiUrl}/incidencias/client/me/${incidenciaId}/messages`,
      { withCredentials: true }
    ).pipe(
      map(response => response.data?.messages || [])
    );
  }

  /**
   * Enviar mensaje como cliente
   */
  sendMessage(incidenciaId: string, content: string): Observable<Message> {
    return this.http.post<any>(
      `${environment.apiUrl}/incidencias/client/me/${incidenciaId}/messages`,
      { content },
      { withCredentials: true }
    ).pipe(
      map(response => response.data || response)
    );
  }

  /**
   * Subir imágenes adicionales como cliente (re-subir evidencia solicitada)
   */
  uploadImages(incidenciaId: string, images: File[]): Observable<any> {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });

    return this.http.post<any>(
      `${environment.apiUrl}/incidencias/client/me/${incidenciaId}/reupload-images`,
      formData,
      { withCredentials: true }
    ).pipe(
      map(response => response.data || response)
    );
  }
}
