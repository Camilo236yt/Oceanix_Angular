import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { UsuariosApiResponse, UsuarioData } from '../../../interface/usuarios-api.interface';
import { CreateUserRequest } from '../../../shared/models/user-request.model';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private apiUrl = 'https://backend-dev.oceanix.space/api/v1/users';

  constructor(private http: HttpClient) {}

  // Main GET request for all users
  getUsuarios(): Observable<User[]> {
    return this.http.get<UsuariosApiResponse>(this.apiUrl, {
      withCredentials: true
    }).pipe(
      map(response => {
        console.log('API Response completa:', response);
        console.log('Datos a transformar:', response.data.data);
        const transformed = this.transformUsuarios(response.data.data);
        console.log('Datos transformados:', transformed);
        return transformed;
      })
    );
  }

  // GET single user by ID
  getUsuarioById(userId: string): Observable<UsuarioData> {
    return this.http.get<{ success: boolean; data: UsuarioData }>(`${this.apiUrl}/${userId}`, {
      withCredentials: true
    }).pipe(
      map(response => response.data)
    );
  }

  // POST - Create user
  createUser(request: CreateUserRequest): Observable<any> {
    return this.http.post(this.apiUrl, request, {
      withCredentials: true
    });
  }

  // Data transformation - converts API response to UI model
  private transformUsuarios(usuariosData: UsuarioData[]): User[] {
    if (!usuariosData || !Array.isArray(usuariosData)) {
      console.error('Error: usuariosData no es un array válido', usuariosData);
      return [];
    }
    return usuariosData.map(usuario => {
      console.log('Transformando usuario:', usuario);
      return {
        id: usuario.id,
        nombre: `${usuario.name || ''} ${usuario.lastName || ''}`.trim(),
        correo: usuario.email || '',
        rol: this.mapUserTypeToRol(usuario.userType || ''),
        estado: usuario.isActive ? 'Activo' : 'Inactivo',
        fechaRegistro: usuario.createdAt ? this.formatDate(usuario.createdAt) : ''
      };
    });
  }

  // Map userType from API to Rol for UI
  private mapUserTypeToRol(userType: string): string {
    const roleMap: { [key: string]: string } = {
      'EMPLOYEE': 'Empleado',
      'ADMIN': 'Admin',
      'SUPERVISOR': 'Supervisor'
    };
    return roleMap[userType] || 'Empleado';
  }

  // Format date from ISO string to DD/M/YYYY
  private formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
