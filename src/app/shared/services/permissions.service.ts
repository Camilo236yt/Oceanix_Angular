import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Permission } from '../models/permission.model';
import { PermissionsApiResponse } from '../../interface/permissions-api.interface';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private apiUrl = 'https://backend-dev.oceanix.space/api/v1/permissions';

  constructor(private http: HttpClient) {}

  getPermissions(): Observable<Permission[]> {
    console.log('PermissionsService: Haciendo petición a:', this.apiUrl);
    return this.http.get<PermissionsApiResponse>(this.apiUrl, {
      withCredentials: true
    }).pipe(
      map(response => {
        console.log('PermissionsService: Respuesta recibida:', response);
        console.log('PermissionsService: Data:', response.data);
        return response.data;
      })
    );
  }
}
