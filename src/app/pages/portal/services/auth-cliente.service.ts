import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Cliente, LoginClienteResponse } from '../models/cliente.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthClienteService {
  private readonly TOKEN_KEY = 'portal_cliente_token';
  private readonly CLIENTE_KEY = 'portal_cliente_data';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Login con Google - Envía el idToken al backend
   */
  loginConGoogle(idToken: string): Observable<LoginClienteResponse> {
    return this.http.post<LoginClienteResponse>(
      `${environment.apiUrl}/auth/google/client`,
      { idToken },
      { withCredentials: true }
    ).pipe(
      tap(response => {
        // Guardar token y datos del cliente en localStorage
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.CLIENTE_KEY, JSON.stringify(response.cliente));
      })
    );
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.CLIENTE_KEY);
    this.router.navigate(['/portal/login']);
  }

  /**
   * Obtener token almacenado
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtener datos del cliente
   */
  getCliente(): Cliente | null {
    const clienteData = localStorage.getItem(this.CLIENTE_KEY);
    return clienteData ? JSON.parse(clienteData) : null;
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
