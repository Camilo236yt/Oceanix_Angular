import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Company } from '../models/company.model';
import { EmpresasApiResponse, EmpresaData, CreateEmpresaRequest, CreateEmpresaResponse, UpdateEmpresaRequest, UpdateEmpresaResponse } from '../../../interface/empresas-api.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EmpresaService {
  private apiUrl = `${environment.apiUrl}/enterprise`;

  constructor(private http: HttpClient) { }

  // Main GET request for all enterprises
  getEmpresas(): Observable<Company[]> {
    return this.http.get<EmpresasApiResponse>(`${this.apiUrl}?includeRelations=false`, {
      withCredentials: true
    }).pipe(
      map(response => {
        console.log('API Response completa:', response);
        console.log('Datos a transformar:', response.data);
        const transformed = this.transformEmpresas(response.data);
        console.log('Datos transformados:', transformed);
        return transformed;
      })
    );
  }

  // GET single enterprise by ID with relations
  getEmpresaById(empresaId: string): Observable<EmpresaData> {
    return this.http.get<{ success: boolean; data: EmpresaData }>(`${this.apiUrl}/${empresaId}?includeRelations=true`, {
      withCredentials: true
    }).pipe(
      map(response => response.data)
    );
  }

  // POST create new enterprise
  createEmpresa(empresaData: CreateEmpresaRequest): Observable<EmpresaData> {
    return this.http.post<CreateEmpresaResponse>(this.apiUrl, empresaData, {
      withCredentials: true
    }).pipe(
      map(response => response.data)
    );
  }

  // PATCH update enterprise by ID
  updateEmpresa(empresaId: string, empresaData: UpdateEmpresaRequest): Observable<EmpresaData> {
    return this.http.patch<UpdateEmpresaResponse>(`${this.apiUrl}/${empresaId}`, empresaData, {
      withCredentials: true
    }).pipe(
      map(response => response.data)
    );
  }

  // DELETE enterprise by ID
  deleteEmpresa(empresaId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${empresaId}`, {
      withCredentials: true
    });
  }

  // PATCH update verification status (SUPER_ADMIN only)
  updateVerificationStatus(
    enterpriseId: string,
    verificationStatus: string,
    rejectionReason?: string
  ): Observable<any> {
    const configApiUrl = `${environment.apiUrl}/enterprise-config`;
    const payload: any = { verificationStatus };
    if (rejectionReason) {
      payload.rejectionReason = rejectionReason;
    }

    return this.http.patch(`${configApiUrl}/${enterpriseId}/verification-status`, payload, {
      withCredentials: true
    });
  }

  // GET verification info (SUPER_ADMIN only)
  getVerificationInfo(enterpriseId: string): Observable<any> {
    const configApiUrl = `${environment.apiUrl}/enterprise-config`;
    return this.http.get(`${configApiUrl}/${enterpriseId}/verification-info`, {
      withCredentials: true
    });
  }

  // GET document download URL (SUPER_ADMIN only)
  getDocumentDownloadUrl(enterpriseId: string, documentId: string): Observable<{
    url: string;
    fileName: string;
    mimeType: string;
  }> {
    const configApiUrl = `${environment.apiUrl}/enterprise-config`;
    return this.http.get<{
      url: string;
      fileName: string;
      mimeType: string;
    }>(`${configApiUrl}/${enterpriseId}/documents/${documentId}/download`, {
      withCredentials: true
    });
  }

  // Data transformation - converts API response to UI model
  private transformEmpresas(empresasData: EmpresaData[]): Company[] {
    if (!empresasData || !Array.isArray(empresasData)) {
      console.error('Error: empresasData no es un array válido', empresasData);
      return [];
    }
    return empresasData.map(empresa => {
      console.log('Transformando empresa:', empresa);
      return {
        id: empresa.id,
        nombreEmpresa: empresa.name || '',
        subdomain: empresa.subdomain || '',
        correoEmpresarial: empresa.email || '',
        telefono: empresa.phone || '',
        estado: empresa.isActive ? 'Activo' : 'Inactivo'
      };
    });
  }
}
