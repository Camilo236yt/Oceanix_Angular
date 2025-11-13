import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../environments/environment';
import {
  RegisterEnterpriseRequest,
  RegisterEnterpriseResponse,
  LoginRequest,
  LoginResponse,
  AdminUser,
  Enterprise,
  ActivateAccountRequest,
  ActivateAccountResponse
} from '../interface/auth.interface';

/**
 * Service for handling authentication operations
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private readonly ENTERPRISE_KEY = 'auth_enterprise';

  // Observable para el estado de autenticación
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Register a new enterprise with admin user
   * @param data Enterprise registration data
   * @returns Observable with registration response
   */
  registerEnterprise(data: RegisterEnterpriseRequest): Observable<RegisterEnterpriseResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<RegisterEnterpriseResponse>(
      `${this.API_URL}/auth/register-enterprise`,
      data,
      { headers }
    ).pipe(
      tap(response => {
        if (response.success) {
          console.log('Empresa registrada exitosamente:', response.data.enterprise);
        }
      })
    );
  }

  /**
   * Login user
   * @param credentials User credentials
   * @returns Observable with login response
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<LoginResponse>(
      `${this.API_URL}/auth/login`,
      credentials,
      { headers }
    ).pipe(
      tap(response => {
        if (response.success && response.data.token) {
          this.setAuthData(
            response.data.token,
            response.data.user,
            response.data.enterprise
          );
        }
      })
    );
  }

  /**
   * Activate account with token
   * @param activationToken Token received after registration
   * @returns Observable with activation response
   */
  activateAccount(activationToken: string): Observable<ActivateAccountResponse> {
    console.group('🔐 AuthService.activateAccount()');
    console.log('📍 Paso 0: Preparando petición de activación');
    console.log('  URL:', `${this.API_URL}/auth/activate-account`);
    console.log('  Token length:', activationToken?.length || 0);
    console.log('  withCredentials configurado:', true);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body: ActivateAccountRequest = {
      activationToken
    };

    console.log('  Headers:', headers.keys());
    console.log('  Body:', { activationToken: activationToken.substring(0, 20) + '...' });
    console.groupEnd();

    return this.http.post<ActivateAccountResponse>(
      `${this.API_URL}/auth/activate-account`,
      body,
      {
        headers,
        withCredentials: true // Permite enviar y recibir cookies cross-origin
      }
    ).pipe(
      tap({
        next: (response) => {
          console.group('✅ AuthService - Respuesta de activación');
          console.log('  Success:', response.success);
          console.log('  Status Code:', response.statusCode);

          // Verificar si hay cookies después de la respuesta
          console.log('📍 Paso 4: Verificando cookies en navegador');
          const allCookies = document.cookie;
          console.log('  document.cookie:', allCookies || '(vacío - esperado si HttpOnly)');
          console.warn('  ⚠️  Si authToken es HttpOnly, NO aparecerá aquí (correcto)');
          console.log('  💡 Verifica DevTools > Application > Cookies manualmente');
          console.groupEnd();
        },
        error: (error) => {
          console.group('❌ AuthService - Error en activación');
          console.error('  Error:', error);
          console.groupEnd();
        }
      })
    );
  }

  /**
   * Save authentication data to localStorage
   * @param token JWT token
   * @param user User data
   * @param enterprise Enterprise data
   */
  private setAuthData(token: string, user: AdminUser, enterprise: Enterprise): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    localStorage.setItem(this.ENTERPRISE_KEY, JSON.stringify(enterprise));
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Get stored authentication token
   * @returns Token string or null
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get stored user data
   * @returns User object or null
   */
  getUser(): AdminUser | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  /**
   * Get stored enterprise data
   * @returns Enterprise object or null
   */
  getEnterprise(): Enterprise | null {
    const enterprise = localStorage.getItem(this.ENTERPRISE_KEY);
    return enterprise ? JSON.parse(enterprise) : null;
  }

  /**
   * Check if user has authentication token
   * @returns true if token exists
   */
  private hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Check if user is authenticated
   * @returns true if authenticated
   */
  isAuthenticated(): boolean {
    return this.hasToken();
  }

  /**
   * Logout user and clear stored data
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ENTERPRISE_KEY);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Redirect to enterprise subdomain
   * @param subdomain The subdomain to redirect to
   */
  redirectToSubdomain(subdomain: string): void {
    const protocol = window.location.protocol; // http: or https:
    const domain = environment.appDomain; // oceanix.space
    const newUrl = `${protocol}//${subdomain}.${domain}/crm/dashboard`;

    // Guardar el subdominio
    localStorage.setItem('subdomain', subdomain);

    // Si la redirección de subdominio está deshabilitada (desarrollo)
    if (!environment.enableSubdomainRedirect) {
      console.log(`[DEV MODE] Redirección de subdominio deshabilitada. En producción se redirigiría a: ${newUrl}`);
      // En desarrollo, navegar al dashboard sin cambiar de dominio
      window.location.href = '/crm/dashboard';
      return;
    }

    // En localhost, no redirigir a subdominio
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log(`[DEV MODE - localhost] En producción se redirigiría a: ${newUrl}`);
      window.location.href = '/crm/dashboard';
      return;
    }

    // En producción, redirigir al subdominio real
    console.log(`Redirigiendo a: ${newUrl}`);
    window.location.href = newUrl;
  }
}
