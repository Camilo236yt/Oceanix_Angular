import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Role } from '../models/role.model';
import { RolesApiResponse, RoleData } from '../../../interface/roles-api.interface';
import { CreateRoleRequest } from '../../../shared/models/permission.model';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private apiUrl = 'https://backend-dev.oceanix.space/api/v1/roles';

  constructor(private http: HttpClient) {}

  getRoles(): Observable<Role[]> {
    return this.http.get<RolesApiResponse>(this.apiUrl, {
      withCredentials: true
    }).pipe(
      map(response => this.transformRoles(response.data))
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
      map(response => response.data)
    );
  }

  private transformRoles(rolesData: RoleData[]): Role[] {
    return rolesData.map(role => ({
      id: role.id,
      rol: role.name,
      descripcion: role.description,
      permisos: role.permissions.map(p => p.permission.title),
      estado: role.isActive ? 'Activo' : 'Inactivo'
    }));
  }
}
