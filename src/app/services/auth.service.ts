import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map, of, catchError, switchMap } from 'rxjs';
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
    const token = localStorage.getItem(this.TOKEN_KEY);
    return token;
  }

  /**
   * Get stored user data
   * @returns User object or null
   */
  getUser(): AdminUser | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Get stored enterprise data
   * @returns Enterprise object or null
   */
  getEnterprise(): Enterprise | null {
    const enterpriseData = localStorage.getItem(this.ENTERPRISE_KEY);
    return enterpriseData ? JSON.parse(enterpriseData) : null;
  }

  /**
   * Check if token exists
   * @returns True if token exists
   */
  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   * @returns Observable with boolean
   */
  checkAuth(): Observable<boolean> {
    return this.isAuthenticated$;
  }

  /**
   * Fetch user configuration data from /auth/me
   * This includes user details, enterprise info, config, roles, and permissions
   * @returns Observable with user config data
   */
  fetchMeData(): Observable<MeResponse> {
    return this.http.get<MeResponse>(`${this.API_URL}/auth/me`, {
      withCredentials: true
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.storeMeData(response.data);
        }
      })
    );
  }

  /**
   * Check if the current session is valid
   * @returns Observable with boolean indicating if session is valid
   */
  checkSession(): Observable<boolean> {
    return this.http.get<{ success: boolean }>(
      `${this.API_URL}/auth/check`,
      { withCredentials: true }
    ).pipe(
      switchMap(response => {
        if (response.success === true) {
          // Si la sesión es válida pero no hay permisos en memoria, cargarlos
          if (this.permissionsSubject.value.length === 0) {
            return this.fetchMeData().pipe(
              map(() => true),
              catchError(() => of(true)) // Aún así retornar true si falla cargar permisos
            );
          }
          return of(true);
        }

        return of(false);
      }),
      catchError(() => of(false))
    );
  }

  /**
   * Store user config data to session storage
   * @param data User config data from /auth/me
   */
  private storeMeData(data: MeResponseData): void {
    sessionStorage.setItem(this.ME_DATA_KEY, JSON.stringify(data));
    sessionStorage.setItem(this.ME_USER_KEY, JSON.stringify(data.user));
    sessionStorage.setItem(this.ME_ENTERPRISE_KEY, JSON.stringify(data.enterprise));
    sessionStorage.setItem(this.ME_CONFIG_KEY, JSON.stringify(data.config));
    sessionStorage.setItem(this.ME_ROLES_KEY, JSON.stringify(data.roles));
    sessionStorage.setItem(this.ME_PERMISSIONS_KEY, JSON.stringify(data.permissions));

    // Update BehaviorSubjects
    this.meUserSubject.next(data.user);
    this.meEnterpriseSubject.next(data.enterprise);
    this.configSubject.next(data.config);
    this.rolesSubject.next(data.roles);
    this.permissionsSubject.next(data.permissions);
  }

  /**
   * Get stored user config data from session storage
   * @returns User config data or null
   */
  private getStoredMeData(): MeResponseData | null {
    const data = sessionStorage.getItem(this.ME_DATA_KEY);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Get stored user data from /auth/me
   * @returns User data or null
   */
  private getStoredMeUser(): MeUser | null {
    const data = sessionStorage.getItem(this.ME_USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Get stored enterprise data from /auth/me
   * @returns Enterprise data or null
   */
  private getStoredMeEnterprise(): MeEnterprise | null {
    const data = sessionStorage.getItem(this.ME_ENTERPRISE_KEY);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Get stored config data from /auth/me
   * @returns Config data or null
   */
  private getStoredConfig(): EnterpriseConfig | null {
    const data = sessionStorage.getItem(this.ME_CONFIG_KEY);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Get stored roles from /auth/me
   * @returns Roles array
   */
  private getStoredRoles(): UserRole[] {
    const data = sessionStorage.getItem(this.ME_ROLES_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Get stored permissions from /auth/me
   * @returns Permissions array
   */
  private getStoredPermissions(): string[] {
    const data = sessionStorage.getItem(this.ME_PERMISSIONS_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Get current user data (from /auth/me)
   * @returns Observable with current user data
   */
  getCurrentUser(): Observable<MeUser | null> {
    const storedData = this.getStoredMeUser();
    if (storedData) {
      return of(storedData);
    }
    return this.fetchMeData().pipe(
      map(response => response.success ? response.data.user : null),
      catchError(() => of(null))
    );
  }

  /**
   * Get current enterprise data (from /auth/me)
   * @returns Observable with current enterprise data
   */
  getCurrentEnterprise(): Observable<MeEnterprise | null> {
    const storedData = this.getStoredMeEnterprise();
    if (storedData) {
      return of(storedData);
    }
    return this.fetchMeData().pipe(
      map(response => response.success ? response.data.enterprise : null),
      catchError(() => of(null))
    );
  }

  /**
   * Get current config data (from /auth/me)
   * @returns Observable with current config data
   */
  getCurrentConfig(): Observable<EnterpriseConfig | null> {
    const storedData = this.getStoredConfig();
    if (storedData) {
      return of(storedData);
    }
    return this.fetchMeData().pipe(
      map(response => response.success ? response.data.config : null),
      catchError(() => of(null))
    );
  }

  /**
   * Get current roles (from /auth/me)
   * @returns Observable with current roles
   */
  getCurrentRoles(): Observable<UserRole[]> {
    const storedData = this.getStoredRoles();
    if (storedData.length > 0) {
      return of(storedData);
    }
    return this.fetchMeData().pipe(
      map(response => response.success ? response.data.roles : []),
      catchError(() => of([]))
    );
  }

  /**
   * Get current permissions (from /auth/me)
   * @returns Observable with current permissions
   */
  getCurrentPermissions(): Observable<string[]> {
    const storedData = this.getStoredPermissions();
    if (storedData.length > 0) {
      return of(storedData);
    }
    return this.fetchMeData().pipe(
      map(response => response.success ? response.data.permissions : []),
      catchError(() => of([]))
    );
  }

  /**
   * Clear stored user config data
   */
  private clearMeData(): void {
    sessionStorage.removeItem(this.ME_DATA_KEY);
    sessionStorage.removeItem(this.ME_USER_KEY);
    sessionStorage.removeItem(this.ME_ENTERPRISE_KEY);
    sessionStorage.removeItem(this.ME_CONFIG_KEY);
    sessionStorage.removeItem(this.ME_ROLES_KEY);
    sessionStorage.removeItem(this.ME_PERMISSIONS_KEY);

    // Reset BehaviorSubjects
    this.meUserSubject.next(null);
    this.meEnterpriseSubject.next(null);
    this.configSubject.next(null);
    this.rolesSubject.next([]);
    this.permissionsSubject.next([]);
  }

  /**
   * Logout user
   * Clear authentication data from localStorage and session storage
   * @returns Observable with logout response
   */
  logout(): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.ENTERPRISE_KEY);
        this.clearMeData();
        this.isAuthenticatedSubject.next(false);
      }),
      catchError((error) => {
        // Even if backend logout fails, clear local data
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.ENTERPRISE_KEY);
        this.clearMeData();
        this.isAuthenticatedSubject.next(false);
        return of(null);
      })
    );
  }

  /**
   * Check if user has specific permission
   * @param permission Permission name to check
   * @returns Observable with boolean
   */
  hasPermission(permission: string): Observable<boolean> {
    return this.permissions$.pipe(
      map(permissions => permissions.includes(permission))
    );
  }

  /**
   * Check if user has specific role
   * @param roleName Role name to check
   * @returns Observable with boolean
   */
  hasRole(roleName: string): Observable<boolean> {
    return this.roles$.pipe(
      map(roles => roles.some(role => role.name === roleName))
    );
  }

  /**
   * Check if user has any of the specified permissions
   * @param permissions Array of permission names to check
   * @returns True if user has at least one permission
   */
  hasAnyPermission(permissions: string[]): boolean {
    const userPermissions = this.permissionsSubject.value;
    return permissions.some(permission => userPermissions.includes(permission));
  }

  /**
   * Check if user has all specified permissions
   * @param permissions Array of permission names to check
   * @returns True if user has all permissions
   */
  hasAllPermissions(permissions: string[]): boolean {
    const userPermissions = this.permissionsSubject.value;
    return permissions.every(permission => userPermissions.includes(permission));
  }

  /**
   * Check if user has specific user type
   * @param userType User type to check
   * @returns True if user has the user type
   */
  hasUserType(userType: string): boolean {
    const user = this.meUserSubject.value;
    return user?.userType === userType;
  }

  /**
   * Check if user has any of the specified user types
   * @param userTypes Array of user types to check
   * @returns True if user has at least one user type
   */
  hasAnyUserType(userTypes: string[]): boolean {
    const user = this.meUserSubject.value;
    return userTypes.includes(user?.userType || '');
  }

  /**
   * Check if user is authenticated (synchronous)
   * @returns True if user has token
   */
  isAuthenticated(): boolean {
    return this.hasToken();
  }

  /**
   * Get user data from /auth/me endpoint
   * @returns Observable with user config data
   */
  getMe(): Observable<MeResponseData> {
    return this.fetchMeData().pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error('Failed to fetch user data');
        }
        return response.data;
      })
    );
  }

  /**
   * Get current user from /auth/me (synchronous from BehaviorSubject)
   * @returns Current user or null
   */
  getCurrentMeUser(): MeUser | null {
    return this.meUserSubject.value;
  }

  /**
   * Validate subdomain on app initialization
   */
  validateSubdomain(): void {
    // En localhost, no validar subdominio
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return;
    }

    // Validar que estemos en un subdominio válido
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    // Si no hay subdominio (ej: oceanix.space), NO hacer nada
    // El dominio principal (oceanix.space) es válido para landing, login y registro
    if (parts.length < 3) {
      return;
    }
  }

  /**
   * Redirect to enterprise subdomain
   * @param subdomain The subdomain to redirect to
   */
  redirectToSubdomain(subdomain: string): void {
    const protocol = window.location.protocol; // http: or https:
    const domain = environment.appDomain; // oceanix.space
    const newUrl = `${protocol}//${subdomain}.${domain}/crm/dashboard`;

    // En localhost, guardar subdomain para desarrollo y navegar al dashboard
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Guardar subdomain SOLO para modo desarrollo (usado por HTTP Interceptor)
      localStorage.setItem('subdomain', subdomain);
      localStorage.setItem('dev_subdomain', subdomain);

      // Navegar al dashboard sin cambiar de dominio
      window.location.href = '/crm/dashboard';
      return;
    }

    // Si la redirección de subdominio está deshabilitada (desarrollo)
    if (!environment.enableSubdomainRedirect) {
      // En desarrollo, navegar al dashboard sin cambiar de dominio
      window.location.href = '/crm/dashboard';
      return;
    }

    // En producción, redirigir al subdominio real
    // NO guardamos en localStorage porque el subdomain ya está en la URL
    window.location.href = newUrl;
  }
}
