import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Incident, IncidentApiResponse, IncidentData } from '../models/incident.model';

@Injectable({
  providedIn: 'root',
})
export class IncidenciasService {
  private apiUrl = 'https://backend-dev.oceanix.space/api/v1/incidencias';

  constructor(private http: HttpClient) {}

  // GET - Obtener todas las incidencias
  getIncidencias(): Observable<Incident[]> {
    return this.http.get<IncidentApiResponse>(this.apiUrl, {
      withCredentials: true
    }).pipe(
      map(response => {
        console.log('API Response incidencias:', response);
        return this.transformIncidencias(response.data);
      })
    );
  }

  // GET - Obtener una incidencia por ID
  getIncidenciaById(incidenciaId: string): Observable<IncidentData> {
    return this.http.get<{ success: boolean; data: IncidentData }>(`${this.apiUrl}/${incidenciaId}`, {
      withCredentials: true
    }).pipe(
      map(response => response.data)
    );
  }

  // DELETE - Eliminar una incidencia
  deleteIncidencia(incidenciaId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${incidenciaId}`, {
      withCredentials: true
    });
  }

  // PATCH - Actualizar estado de una incidencia
  updateIncidenciaStatus(incidenciaId: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${incidenciaId}`, { status }, {
      withCredentials: true
    });
  }

  // Transformar datos del backend al modelo del DataTable
  private transformIncidencias(incidenciasData: IncidentData[]): Incident[] {
    if (!incidenciasData || !Array.isArray(incidenciasData)) {
      console.error('Error: incidenciasData no es un array válido', incidenciasData);
      return [];
    }

    return incidenciasData.map(incidencia => ({
      id: incidencia.id,
      name: incidencia.name,
      descripcion: this.truncateText(incidencia.description, 25),
      tipoIncidencia: this.mapTipoIncidencia(incidencia.tipo),
      estado: this.mapEstado(incidencia.status),
      empleadoAsignado: incidencia.assignedEmployeeId || '',
      fechaCreacion: this.formatDate(incidencia.createdAt)
    }));
  }

  // Truncar texto a un número máximo de caracteres
  private truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  // Mapear tipo de incidencia del backend a texto legible
  private mapTipoIncidencia(tipo: string): string {
    const tipoMap: { [key: string]: string } = {
      'por_perdida': 'Pérdida',
      'por_dano': 'Daño',
      'por_error_humano': 'Error Humano',
      'por_mantenimiento': 'Mantenimiento',
      'por_falla_tecnica': 'Falla Técnica',
      'otro': 'Otro'
    };
    return tipoMap[tipo] || tipo;
  }

  // Mapear estado del backend a texto para el DataTable
  private mapEstado(status: string): string {
    const estadoMap: { [key: string]: string } = {
      'RESOLVED': 'Resuelto',
      'PENDING': 'Pendiente',
      'IN_PROGRESS': 'En Progreso'
    };
    return estadoMap[status] || status;
  }

  // Formatear fecha de ISO a DD/M/YYYY
  private formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
