import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Permission } from '../models/permission.model';
import { PermissionsApiResponse } from '../../interface/permissions-api.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private apiUrl = `${environment.apiUrl}/permissions`;

  constructor(private http: HttpClient) {}

  getPermissions(): Observable<Permission[]> {
    return this.http.get<PermissionsApiResponse>(this.apiUrl, {
      withCredentials: true
    }).pipe(
      map(response => response.data)
    );
  }
}
