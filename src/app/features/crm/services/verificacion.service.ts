import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Interfaz para la respuesta del endpoint enterprise-config/status
 */
export interface EnterpriseConfigStatus {
  documentsUploaded: boolean;
  brandingConfigured: boolean;
  emailDomainsConfigured: boolean;
}

/**
 * Servicio para manejar las operaciones de verificación de cuenta empresarial
 */
@Injectable({
  providedIn: 'root'
})
export class VerificacionService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el estado actual de la configuración empresarial
   * @returns Observable con el estado de configuración
   */
  getEnterpriseConfigStatus(): Observable<EnterpriseConfigStatus> {
    const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<EnterpriseConfigStatus>(
      `${this.API_URL}/enterprise-config/status`,
      { headers }
    );
  }
}
