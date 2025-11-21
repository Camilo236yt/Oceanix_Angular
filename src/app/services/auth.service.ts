import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import { environment } from '../environments/environment';
import {
  RegisterEnterpriseRequest,
  RegisterEnterpriseResponse,
  LoginRequest,
  LoginResponse,
  AdminUser,
  Enterprise,
  ActivateAccountRequest,
  ActivateAccountResponse,
  MeResponse,
  MeResponseData,
  MeUser,
  MeEnterprise,
  EnterpriseConfig,
  UserRole
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

  // Session storage keys para datos de configuración de /auth/me
  private readonly ME_DATA_KEY = 'user_config_data';
  private readonly ME_USER_KEY = 'user_config_user';
  private readonly ME_ENTERPRISE_KEY = 'user_config_enterprise';
  private readonly ME_CONFIG_KEY = 'user_config_config';
  private readonly ME_ROLES_KEY = 'user_config_roles';
  private readonly ME_PERMISSIONS_KEY = 'user_config_permissions';

  // Observable para el estado de autenticación
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // BehaviorSubjects para datos de configuración del usuario (desde /auth/me)
  private meUserSubject = new BehaviorSubject<MeUser | null>(this.getStoredMeUser());
  public meUser$ = this.meUserSubject.asObservable();

  private meEnterpriseSubject = new BehaviorSubject<MeEnterprise | null>(this.getStoredMeEnterprise());
  public meEnterprise$ = this.meEnterpriseSubject.asObservable();

  private configSubject = new BehaviorSubject<EnterpriseConfig | null>(this.getStoredConfig());
  public config$ = this.configSubject.asObservable();

  private rolesSubject = new BehaviorSubject<UserRole[]>(this.getStoredRoles());
  public roles$ = this.rolesSubject.asObservable();

  private permissionsSubject = new BehaviorSubject<string[]>(this.getStoredPermissions());
  public permissions$ = this.permissionsSubject.asObservable();

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
      {
        headers,
        withCredentials: true // Permite enviar y recibir cookies cross-origin
      }
    ).pipe(
      map(response => {
        // Guardar token SINCRÓNICAMENTE antes de retornar
        if (response.success && response.data.token) {
          this.setAuthData(
            response.data.token,
            response.data.user,
            response.data.enterprise
          );
        }
        return response;
      })
    );
  }

  /**
   * Activate account with token
   * @param activationToken Token received after registration
   * @returns Observable with activation response
   */
  activateAccount(activationToken: string): Observable<ActivateAccountResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body: ActivateAccountRequest = {
      activationToken
    };

    return this.http.post<ActivateAccountResponse>(
      `${this.API_URL}/auth/activate-account`,
      body,
      {
        headers,
        withCredentials: true // Permite enviar y recibir cookies cross-origin
      }
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
   * Extrae el subdomain actual de la URL
   * @returns subdomain string o null si no está en un subdomain
   */
  private getCurrentSubdomain(): string | null {
    const hostname = window.location.hostname;

    // Si es localhost, retornar null
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return null;
    }

    // Ejemplo: techsol-abc.oceanix.space -> techsol-abc
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      return parts[0];
    }

    return null;
  }

  /**
   * Valida que el usuario esté en el subdomain correcto
   * Si no coincide, limpia la sesión y retorna false
   * @returns true si está en el subdomain correcto
   */
  validateSubdomain(): boolean {
    const enterprise = this.getEnterprise();
    const currentSubdomain = this.getCurrentSubdomain();

    // Si no hay empresa guardada o no estamos en un subdomain, no validar
    if (!enterprise || !currentSubdomain) {
      return true;
    }

    // Si el subdomain no coincide con la empresa del usuario
    if (enterprise.subdomain !== currentSubdomain) {
      // Limpiar la sesión local y la cookie del backend
      this.logout().subscribe({
        error: (err) => console.error('Error clearing auth cookie:', err)
      });

      return false;
    }

    return true;
  }

  /**
   * Get user configuration data from /auth/me endpoint
   * @returns Observable with user configuration data
   */
  getMe(): Observable<MeResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get<MeResponse>(
      `${this.API_URL}/auth/me`,
      {
        headers,
        withCredentials: true
      }
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setMeData(response.data);
        }
      })
    );
  }

  /**
   * Save user configuration data to BehaviorSubjects and sessionStorage
   * @param data User configuration data from /auth/me
   */
  private setMeData(data: MeResponseData): void {
    // Actualizar BehaviorSubjects (estado reactivo en memoria)
    this.meUserSubject.next(data.user);
    this.meEnterpriseSubject.next(data.enterprise);
    this.configSubject.next(data.config);
    this.rolesSubject.next(data.roles);
    this.permissionsSubject.next(data.permissions);

    // Guardar en sessionStorage como backup (se limpia al cerrar pestaña)
    sessionStorage.setItem(this.ME_USER_KEY, JSON.stringify(data.user));
    sessionStorage.setItem(this.ME_ENTERPRISE_KEY, JSON.stringify(data.enterprise));
    sessionStorage.setItem(this.ME_CONFIG_KEY, JSON.stringify(data.config));
    sessionStorage.setItem(this.ME_ROLES_KEY, JSON.stringify(data.roles));
    sessionStorage.setItem(this.ME_PERMISSIONS_KEY, JSON.stringify(data.permissions));
  }

  /**
   * Get stored user data from sessionStorage
   * @returns MeUser object or null
   */
  private getStoredMeUser(): MeUser | null {
    const stored = sessionStorage.getItem(this.ME_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Get stored enterprise data from sessionStorage
   * @returns MeEnterprise object or null
   */
  private getStoredMeEnterprise(): MeEnterprise | null {
    const stored = sessionStorage.getItem(this.ME_ENTERPRISE_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Get stored config data from sessionStorage
   * @returns EnterpriseConfig object or null
   */
  private getStoredConfig(): EnterpriseConfig | null {
    const stored = sessionStorage.getItem(this.ME_CONFIG_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Get stored roles from sessionStorage
   * @returns Array of UserRole objects
   */
  private getStoredRoles(): UserRole[] {
    const stored = sessionStorage.getItem(this.ME_ROLES_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Get stored permissions from sessionStorage
   * @returns Array of permission strings
   */
  private getStoredPermissions(): string[] {
    const stored = sessionStorage.getItem(this.ME_PERMISSIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Clear all user configuration data from memory and sessionStorage
   */
  private clearMeData(): void {
    // Limpiar BehaviorSubjects
    this.meUserSubject.next(null);
    this.meEnterpriseSubject.next(null);
    this.configSubject.next(null);
    this.rolesSubject.next([]);
    this.permissionsSubject.next([]);

    // Limpiar sessionStorage
    sessionStorage.removeItem(this.ME_USER_KEY);
    sessionStorage.removeItem(this.ME_ENTERPRISE_KEY);
    sessionStorage.removeItem(this.ME_CONFIG_KEY);
    sessionStorage.removeItem(this.ME_ROLES_KEY);
    sessionStorage.removeItem(this.ME_PERMISSIONS_KEY);
  }

  /**
   * Get current user data (synchronous)
   * @returns Current MeUser or null
   */
  getCurrentMeUser(): MeUser | null {
    return this.meUserSubject.value;
  }

  /**
   * Get current permissions (synchronous)
   * @returns Array of permission strings
   */
  getCurrentPermissions(): string[] {
    return this.permissionsSubject.value;
  }

  /**
   * Get current roles (synchronous)
   * @returns Array of UserRole objects
   */
  getCurrentRoles(): UserRole[] {
    return this.rolesSubject.value;
  }

  /**
   * Check if user has a specific permission
   * @param permission Permission to check
   * @returns true if user has the permission
   */
  hasPermission(permission: string): boolean {
    return this.permissionsSubject.value.includes(permission);
  }

  /**
   * Check if user has any of the specified permissions
   * @param permissions Array of permissions to check
   * @returns true if user has at least one permission
   */
  hasAnyPermission(permissions: string[]): boolean {
    const userPermissions = this.permissionsSubject.value;
    return permissions.some(p => userPermissions.includes(p));
  }

  /**
   * Check if user has all of the specified permissions
   * @param permissions Array of permissions to check
   * @returns true if user has all permissions
   */
  hasAllPermissions(permissions: string[]): boolean {
    const userPermissions = this.permissionsSubject.value;
    return permissions.every(p => userPermissions.includes(p));
  }

  /**
   * Limpia la cookie de autenticación haciendo una petición al backend
   * @returns Observable que se completa cuando la cookie se limpia
   */
  clearAuthCookie(): Observable<any> {
    return this.http.post(
      `${this.API_URL}/auth/logout`,
      {},
      { withCredentials: true }
    );
  }

  /**
   * Logout user and clear stored data
   * @returns Observable que se completa cuando el logout finaliza
   */
  logout(): Observable<any> {
    // Limpiar localStorage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ENTERPRISE_KEY);
    localStorage.removeItem('subdomain');
    localStorage.removeItem('dev_subdomain');

    // Limpiar datos de configuración de usuario
    this.clearMeData();

    // Actualizar estado de autenticación
    this.isAuthenticatedSubject.next(false);

    // Limpiar cookie del backend y retornar el observable
    return this.clearAuthCookie();
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

    // En localhost, guardar subdomain para desarrollo y navegar al dashboard
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log(`[DEV MODE - localhost] Simulando subdominio: ${subdomain}`);

      // Guardar subdomain para modo desarrollo (usado por HTTP Interceptor)
      localStorage.setItem('dev_subdomain', subdomain);

      // Navegar al dashboard sin cambiar de dominio
      window.location.href = '/crm/dashboard';
      return;
    }

    // Si la redirección de subdominio está deshabilitada (desarrollo)
    if (!environment.enableSubdomainRedirect) {
      console.log(`[DEV MODE] Redirección de subdominio deshabilitada. En producción se redirigiría a: ${newUrl}`);
      // En desarrollo, navegar al dashboard sin cambiar de dominio
      window.location.href = '/crm/dashboard';
      return;
    }

    // En producción, redirigir al subdominio real
    console.log(`Redirigiendo a: ${newUrl}`);
    window.location.href = newUrl;
  }
}
