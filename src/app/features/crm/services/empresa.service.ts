import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Company } from '../models/company.model';
import { EmpresasApiResponse, EmpresaData } from '../../../interface/empresas-api.interface';

@Injectable({
  providedIn: 'root',
})
export class EmpresaService {
  private apiUrl = 'https://backend-dev.oceanix.space/api/v1/enterprise';

  constructor(private http: HttpClient) {}

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
