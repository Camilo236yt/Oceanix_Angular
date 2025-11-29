import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { UsuariosApiResponse, UsuarioData, UsuariosPaginatedResponse } from '../../../interface/usuarios-api.interface';
import { CreateUserRequest, UpdateUserRequest } from '../../../shared/models/user-request.model';
import { environment } from '../../../environments/environment';

export interface UserPaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  filter?: Record<string, any>;
}

export interface PaginatedUsersResult {
  users: User[];
  meta: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  // Main GET request for all users
  getUsuarios(): Observable<User[]> {
    return this.http.get<UsuariosApiResponse>(this.apiUrl, {
      withCredentials: true
    }).pipe(
      map((response: UsuariosApiResponse) => {
        return this.transformUsuarios(response.data.data);
      })
    );
  }

  // GET paginated users
  getUsuariosPaginated(params: UserPaginationParams = {}): Observable<PaginatedUsersResult> {
    let httpParams = new HttpParams();

    if (params.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.sortBy) {
      const sortOrder = params.sortOrder || 'ASC';
      httpParams = httpParams.set('sortBy', `${params.sortBy}:${sortOrder}`);
    }
    if (params.filter) {
      Object.keys(params.filter).forEach(key => {
        if (params.filter![key] !== undefined && params.filter![key] !== null && params.filter![key] !== '') {
          // Use $eq operator for exact match as expected by nestjs-paginate
          httpParams = httpParams.set(`filter.${key}`, `$eq:${params.filter![key]}`);
        }
      });
    }

    return this.http.get<{ success: boolean; data: UsuariosPaginatedResponse; statusCode: number }>(this.apiUrl, {
      params: httpParams,
      withCredentials: true
    }).pipe(
      map((response: { success: boolean; data: UsuariosPaginatedResponse; statusCode: number }) => ({
        users: this.transformUsuarios(response.data.data),
        meta: {
          currentPage: response.data.meta.currentPage,
          itemsPerPage: response.data.meta.itemsPerPage,
          totalItems: response.data.meta.totalItems,
          totalPages: response.data.meta.totalPages
        }
      }))
    );
  }

  // GET single user by ID
  getUsuarioById(userId: string): Observable<UsuarioData> {
    return this.http.get<{ success: boolean; data: UsuarioData }>(`${this.apiUrl}/${userId}`, {
      withCredentials: true
    }).pipe(
      map((response: { success: boolean; data: UsuarioData }) => response.data)
    );
  }

  // POST - Create user
  createUser(request: CreateUserRequest): Observable<any> {
    return this.http.post(this.apiUrl, request, {
      withCredentials: true
    });
  }

  // DELETE - Delete user (soft delete)
  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`, {
      withCredentials: true
    });
  }

  // PATCH - Update user
  updateUser(userId: string, request: UpdateUserRequest): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${userId}`, request, {
      withCredentials: true
    });
  }

  // PATCH - Reactivate user
  reactivateUser(userId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${userId}/reactivate`, {}, {
      withCredentials: true
    });
  }

  // POST - Assign roles to user
  assignRolesToUser(userId: string, roleIds: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/roles`, { roleIds }, {
      withCredentials: true
    });
  }

  // Data transformation - converts API response to UI model
  private transformUsuarios(usuariosData: UsuarioData[]): User[] {
    if (!usuariosData || !Array.isArray(usuariosData)) {
      return [];
    }
    return usuariosData.map(usuario => ({
      id: usuario.id,
      nombre: `${usuario.name || ''} ${usuario.lastName || ''}`.trim(),
      correo: usuario.email || '',
      rol: this.determineUserRole(usuario),
      estado: usuario.isActive ? 'Activo' : 'Inactivo',
      fechaRegistro: usuario.createdAt ? this.formatDate(usuario.createdAt) : ''
    }));
  }

  // Determine user role - prioritize actual roles, fallback to userType
  private determineUserRole(usuario: UsuarioData): string {
    // If user has roles assigned, use the first role name
    if (usuario.roles && Array.isArray(usuario.roles) && usuario.roles.length > 0) {
      const firstRole = usuario.roles[0];
      // UserRole structure: { id, role: { id, name, description } }
      if (firstRole.role && firstRole.role.name) {
        return firstRole.role.name;
      }
    }

    // Fallback to userType mapping
    return this.mapUserTypeToRol(usuario.userType || '');
  }

  // Map userType from API to Rol for UI (fallback)
  private mapUserTypeToRol(userType: string): string {
    const roleMap: { [key: string]: string } = {
      'ENTERPRISE_ADMIN': 'Admin Empresarial',
      'EMPLOYEE': 'Empleado',
      'CLIENT': 'Cliente',
      'SUPER_ADMIN': 'Super Admin'
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
