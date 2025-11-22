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
   * Crear una nueva incidencia
   */
  crearIncidencia(request: CrearIncidenciaRequest): Observable<Incidencia> {
    return this.http.post<Incidencia>(
      `${environment.apiUrl}/incidencias/client`,
      request,
      { withCredentials: true }
    );
  }
}
