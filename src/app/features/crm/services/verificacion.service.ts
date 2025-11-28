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
 * Interfaz para la respuesta de actualización de dominios de email
 */
export interface EmailDomainsResponse {
  message: string;
  config: {
    id: string;
    emailDomains: string[];
    requireCorporateEmail: boolean;
  };
}

/**
 * Interfaz para la respuesta del email actual del usuario
 */
export interface CurrentEmailResponse {
  email: string;
  hasEmail: boolean;
}

/**
 * Interfaz para la respuesta de envío de código de verificación
 */
export interface SendEmailVerificationResponse {
  message: string;
  emailSentTo: string;
}

/**
 * Interfaz para la respuesta de verificación de código de email
 */
export interface VerifyEmailCodeResponse {
  message: string;
  verified: boolean;
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

  /**
   * Actualiza los dominios de email corporativo
   * @param emailDomains Array de dominios permitidos (opcional, puede ser vacío)
   * @param requireCorporateEmail Si requiere email corporativo
   * @returns Observable con la respuesta de actualización
   */
  updateEmailDomains(emailDomains: string[], requireCorporateEmail: boolean = false): Observable<EmailDomainsResponse> {
    const body = {
      emailDomains,
      requireCorporateEmail
    };

    // El interceptor ya agrega automáticamente:
    // - X-Subdomain header
    // - Authorization header
    // - Content-Type: application/json
    return this.http.patch<EmailDomainsResponse>(
      `${this.API_URL}/enterprise-config/email-domains`,
      body
    );
  }

  /**
   * Obtiene el email actual del usuario registrado
   * @returns Observable con el email del usuario
   */
  getCurrentEmail(): Observable<CurrentEmailResponse> {
    // El interceptor ya agrega automáticamente:
    // - X-Subdomain header
    // - Authorization header
    return this.http.get<CurrentEmailResponse>(
      `${this.API_URL}/enterprise-config/current-email`
    );
  }

  /**
   * Envía el código de verificación al email del usuario
   * @returns Observable con la respuesta del envío
   */
  sendEmailVerification(): Observable<SendEmailVerificationResponse> {
    // El interceptor ya agrega automáticamente:
    // - X-Subdomain header
    // - Authorization header
    // - Content-Type: application/json
    return this.http.post<SendEmailVerificationResponse>(
      `${this.API_URL}/enterprise-config/send-email-verification`,
      {} // Body vacío
    );
  }

  /**
   * Verifica el código de email ingresado por el usuario
   * @param code Código de 6 dígitos enviado al email
   * @returns Observable con la respuesta de verificación
   */
  verifyEmailCode(code: string): Observable<VerifyEmailCodeResponse> {
    const body = { code };

    // El interceptor ya agrega automáticamente:
    // - X-Subdomain header
    // - Authorization header
    // - Content-Type: application/json
    return this.http.post<VerifyEmailCodeResponse>(
      `${this.API_URL}/enterprise-config/verify-email-code`,
      body
    );
  }
}
