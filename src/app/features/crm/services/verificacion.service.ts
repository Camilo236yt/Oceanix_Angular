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
 * Interfaz para la respuesta de subida de documentos
 */
export interface DocumentUploadResponse {
  message: string;
  documents: Array<{
    id: string;
    type: string;
    fileName: string;
    status: string;
    version: number;
  }>;
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

  /**
   * Sube los documentos obligatorios de la empresa
   * @param taxId Archivo RUT/NIT/CUIT
   * @param chamberCommerce Archivo Cámara de Comercio
   * @param legalRepId Archivo Cédula Representante Legal
   * @returns Observable con la respuesta de subida
   */
  uploadDocuments(taxId: File, chamberCommerce: File, legalRepId: File): Observable<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('taxId', taxId);
    formData.append('chamberCommerce', chamberCommerce);
    formData.append('legalRepId', legalRepId);

    // El interceptor ya agrega automáticamente:
    // - X-Subdomain header
    // - Authorization header
    // - Configuración correcta para FormData
    return this.http.post<DocumentUploadResponse>(
      `${this.API_URL}/enterprise-config/documents/upload`,
      formData
    );
  }
}
