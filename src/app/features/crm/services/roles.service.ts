import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Role } from '../models/role.model';
import { RolesApiResponse, RoleData, PaginatedResponse } from '../../../interface/roles-api.interface';
import { CreateRoleRequest } from '../../../shared/models/permission.model';
import { environment } from '../../../environments/environment';

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  filter?: Record<string, any>;
}

export interface PaginatedRolesResult {
  roles: Role[];
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
export class RolesService {
  private apiUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  getRoles(): Observable<Role[]> {
    return this.http.get<RolesApiResponse>(this.apiUrl, {
      withCredentials: true
    }).pipe(
      map((response: RolesApiResponse) => this.transformRoles(response.data))
    );
  }

  getRolesPaginated(params: PaginationParams = {}): Observable<PaginatedRolesResult> {
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

    return this.http.get<{ success: boolean; data: PaginatedResponse<RoleData>; statusCode: number }>(this.apiUrl, {
      params: httpParams,
      withCredentials: true
    }).pipe(
      map((response: { success: boolean; data: PaginatedResponse<RoleData>; statusCode: number }) => ({
        roles: this.transformRoles(response.data.data),
        meta: {
          currentPage: response.data.meta.currentPage,
          itemsPerPage: response.data.meta.itemsPerPage,
          totalItems: response.data.meta.totalItems,
          totalPages: response.data.meta.totalPages
        }
      }))
    );
  }

  createRole(request: CreateRoleRequest): Observable<any> {
    return this.http.post(this.apiUrl, request, {
      withCredentials: true
    });
  }

  deleteRole(roleId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${roleId}`, {
      withCredentials: true
    });
  }

  updateRole(roleId: string, request: CreateRoleRequest): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${roleId}`, request, {
      withCredentials: true
    });
  }

  getRoleById(roleId: string): Observable<RoleData> {
    return this.http.get<{ success: boolean; data: RoleData }>(`${this.apiUrl}/${roleId}`, {
      withCredentials: true
    }).pipe(
      map((response: { success: boolean; data: RoleData }) => response.data)
    );
  }

  private transformRoles(rolesData: RoleData[]): Role[] {
    return rolesData.map(role => ({
      id: role.id,
      rol: role.name,
      descripcion: this.truncateText(role.description, 25),
      permisos: role.permissions.map(p => p.permission.title),
      estado: role.isActive ? 'Activo' : 'Inactivo'
    }));
  }

  private truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}
