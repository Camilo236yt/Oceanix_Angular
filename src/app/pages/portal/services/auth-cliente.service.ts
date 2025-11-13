import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Cliente, LoginClienteRequest, LoginClienteResponse } from '../models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class AuthClienteService {
  private readonly TOKEN_KEY = 'portal_cliente_token';
  private readonly CLIENTE_KEY = 'portal_cliente_data';

  constructor(private router: Router) {}

  /**
   * Login con Google (Mock)
   */
  loginConGoogle(request: LoginClienteRequest): Observable<LoginClienteResponse> {
    // Mock: Simula login exitoso
    const mockResponse: LoginClienteResponse = {
      token: 'mock-jwt-token-123456',
      cliente: {
        id: 'CLI-001',
        nombre: 'Usuario Demo',
        email: 'demo@example.com',
        telefono: '+57 300 123 4567',
        empresa: 'Empresa Demo'
      }
    };

    // Guardar en localStorage
    localStorage.setItem(this.TOKEN_KEY, mockResponse.token);
    localStorage.setItem(this.CLIENTE_KEY, JSON.stringify(mockResponse.cliente));

    return of(mockResponse);
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
