# Guía de Uso: Configuración de Usuario (BehaviorSubject + sessionStorage)

## 📋 Descripción General

Este proyecto implementa un patrón **BehaviorSubject + sessionStorage** para manejar la configuración del usuario obtenida del endpoint `/auth/me`.

### ✅ Ventajas de este enfoque:

1. **Reactivo**: Los componentes se actualizan automáticamente cuando cambian los datos
2. **Persistente**: Los datos se mantienen al recargar la página (sessionStorage)
3. **Seguro**: sessionStorage se limpia automáticamente al cerrar la pestaña
4. **Sincronizado**: Los datos se sincronizan con el backend al iniciar la app
5. **Tipado**: TypeScript garantiza la seguridad de tipos

---

## 🏗️ Arquitectura

```
Login exitoso
    ↓
Llama /auth/me
    ↓
Guarda en BehaviorSubject (memoria) + sessionStorage (backup)
    ↓
Redirige al dashboard
    ↓
Componentes se suscriben a los Observables

Al recargar la página:
    ↓
APP_INITIALIZER ejecuta
    ↓
BehaviorSubjects se inicializan desde sessionStorage
    ↓
Llama /auth/me para sincronizar con backend
    ↓
Datos disponibles para toda la app
```

---

## 📦 Datos Disponibles

### 1. **Usuario** (`meUser$`)
```typescript
interface MeUser {
  id: string;
  email: string;
  name: string;
  lastName: string;
  phoneNumber: string;
  userType: string;
  isEmailVerified: boolean;
  isActive: boolean;
}
```

### 2. **Empresa** (`meEnterprise$`)
```typescript
interface MeEnterprise {
  id: string;
  name: string;
  subdomain: string;
  email: string;
  phone: string;
}
```

### 3. **Configuración de Empresa** (`config$`)
```typescript
interface EnterpriseConfig {
  isVerified: boolean;
  verificationStatus: string;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  bannerUrl: string | null;
  requireCorporateEmail: boolean;
}
```

### 4. **Roles** (`roles$`)
```typescript
interface UserRole {
  id: string;
  name: string;
  description: string;
}
```

### 5. **Permisos** (`permissions$`)
```typescript
string[] // Array de permisos como strings
```

---

## 🚀 Cómo Usar en Componentes

### Ejemplo 1: Mostrar datos del usuario

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@services/auth.service';
import { MeUser } from '@interface/auth.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile">
      @if (user) {
        <h2>Bienvenido, {{ user.name }} {{ user.lastName }}</h2>
        <p>Email: {{ user.email }}</p>
        <p>Teléfono: {{ user.phoneNumber }}</p>
        <p>Tipo de usuario: {{ user.userType }}</p>

        @if (user.isEmailVerified) {
          <span class="badge-verified">✓ Email Verificado</span>
        }
      }
    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: MeUser | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Suscribirse al observable del usuario
    this.authService.meUser$.subscribe(user => {
      this.user = user;
      console.log('Usuario actualizado:', user);
    });
  }
}
```

### Ejemplo 2: Usar configuración de la empresa (colores)

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@services/auth.service';
import { EnterpriseConfig } from '@interface/auth.interface';

@Component({
  selector: 'app-themed-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header [style.background-color]="primaryColor">
      @if (logoUrl) {
        <img [src]="logoUrl" alt="Logo" />
      }
      <h1 [style.color]="accentColor">{{ enterpriseName }}</h1>
    </header>
  `
})
export class ThemedHeaderComponent implements OnInit {
  primaryColor: string = '#9333ea'; // Default
  accentColor: string = '#ffffff'; // Default
  logoUrl: string | null = null;
  enterpriseName: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Obtener configuración de colores
    this.authService.config$.subscribe(config => {
      if (config) {
        this.primaryColor = config.primaryColor || '#9333ea';
        this.accentColor = config.accentColor || '#ffffff';
        this.logoUrl = config.logoUrl;
      }
    });

    // Obtener nombre de la empresa
    this.authService.meEnterprise$.subscribe(enterprise => {
      if (enterprise) {
        this.enterpriseName = enterprise.name;
      }
    });
  }
}
```

### Ejemplo 3: Verificar permisos

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-panel">
      <h2>Panel de Administración</h2>

      <!-- Mostrar solo si tiene el permiso -->
      @if (canManageUsers) {
        <button (click)="manageUsers()">Gestionar Usuarios</button>
      }

      @if (canManageIncidents) {
        <button (click)="manageIncidents()">Gestionar Incidentes</button>
      }

      @if (canViewReports) {
        <button (click)="viewReports()">Ver Reportes</button>
      }

      <!-- Mensaje si no tiene permisos -->
      @if (!canManageUsers && !canManageIncidents && !canViewReports) {
        <p class="no-permissions">No tienes permisos de administrador</p>
      }
    </div>
  `
})
export class AdminPanelComponent implements OnInit {
  canManageUsers = false;
  canManageIncidents = false;
  canViewReports = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.permissions$.subscribe(permissions => {
      this.canManageUsers = permissions.includes('manage_users');
      this.canManageIncidents = permissions.includes('manage_incidents');
      this.canViewReports = permissions.includes('view_reports');
    });
  }

  manageUsers() {
    console.log('Gestionar usuarios');
  }

  manageIncidents() {
    console.log('Gestionar incidentes');
  }

  viewReports() {
    console.log('Ver reportes');
  }
}
```

### Ejemplo 4: Usar métodos síncronos (sin suscripción)

```typescript
import { Component } from '@angular/core';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-quick-check',
  standalone: true,
  template: `
    <button (click)="deleteItem()" [disabled]="!canDelete()">
      Eliminar Item
    </button>
  `
})
export class QuickCheckComponent {
  constructor(private authService: AuthService) {}

  canDelete(): boolean {
    // Obtener valor actual sin suscripción
    return this.authService.hasPermission('delete_items');
  }

  deleteItem() {
    if (this.canDelete()) {
      console.log('Eliminando item...');
    }
  }
}
```

### Ejemplo 5: Verificar múltiples permisos

```typescript
import { Component, OnInit } from '@angular/core';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-incident-detail',
  standalone: true,
  template: `
    @if (canEdit) {
      <button (click)="edit()">Editar</button>
    }

    @if (canDelete) {
      <button (click)="delete()">Eliminar</button>
    }

    @if (canAssign) {
      <button (click)="assign()">Asignar</button>
    }
  `
})
export class IncidentDetailComponent implements OnInit {
  canEdit = false;
  canDelete = false;
  canAssign = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Verificar si tiene ALGUNO de estos permisos
    this.canEdit = this.authService.hasAnyPermission([
      'edit_incidents',
      'edit_own_incidents'
    ]);

    // Verificar si tiene TODOS estos permisos
    this.canDelete = this.authService.hasAllPermissions([
      'delete_incidents',
      'manage_incidents'
    ]);

    // Verificar un permiso específico
    this.canAssign = this.authService.hasPermission('assign_incidents');
  }

  edit() { console.log('Editando...'); }
  delete() { console.log('Eliminando...'); }
  assign() { console.log('Asignando...'); }
}
```

### Ejemplo 6: Mostrar roles del usuario

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@services/auth.service';
import { UserRole } from '@interface/auth.interface';

@Component({
  selector: 'app-user-roles',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="roles-list">
      <h3>Tus Roles</h3>
      @if (roles.length > 0) {
        <ul>
          @for (role of roles; track role.id) {
            <li>
              <strong>{{ role.name }}</strong>
              <p>{{ role.description }}</p>
            </li>
          }
        </ul>
      } @else {
        <p>No tienes roles asignados</p>
      }
    </div>
  `
})
export class UserRolesComponent implements OnInit {
  roles: UserRole[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.roles$.subscribe(roles => {
      this.roles = roles;
    });
  }
}
```

---

## 🛡️ Guards de Rutas basados en Permisos

### Guard para verificar permisos:

```typescript
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '@services/auth.service';

/**
 * Guard que verifica si el usuario tiene un permiso específico
 */
export const permissionGuard = (requiredPermission: string): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.hasPermission(requiredPermission)) {
      return true;
    }

    // Redirigir a página de acceso denegado
    router.navigate(['/unauthorized']);
    return false;
  };
};

/**
 * Guard que verifica si el usuario tiene ALGUNO de los permisos
 */
export const anyPermissionGuard = (requiredPermissions: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.hasAnyPermission(requiredPermissions)) {
      return true;
    }

    router.navigate(['/unauthorized']);
    return false;
  };
};
```

### Uso en rutas:

```typescript
import { Routes } from '@angular/router';
import { permissionGuard, anyPermissionGuard } from './guards/permission.guard';

export const routes: Routes = [
  {
    path: 'admin/users',
    component: UserManagementComponent,
    canActivate: [permissionGuard('manage_users')]
  },
  {
    path: 'incidents',
    component: IncidentsComponent,
    canActivate: [anyPermissionGuard(['view_incidents', 'view_own_incidents'])]
  },
  {
    path: 'reports',
    component: ReportsComponent,
    canActivate: [permissionGuard('view_reports')]
  }
];
```

---

## 🧪 Testing

### Ejemplo de test de un componente que usa permisos:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '@services/auth.service';
import { BehaviorSubject } from 'rxjs';
import { AdminPanelComponent } from './admin-panel.component';

describe('AdminPanelComponent', () => {
  let component: AdminPanelComponent;
  let fixture: ComponentFixture<AdminPanelComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let permissionsSubject: BehaviorSubject<string[]>;

  beforeEach(async () => {
    // Crear spy del AuthService
    permissionsSubject = new BehaviorSubject<string[]>([]);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['hasPermission'], {
      permissions$: permissionsSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [AdminPanelComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPanelComponent);
    component = fixture.componentInstance;
  });

  it('should show manage users button when user has permission', () => {
    // Emitir permisos
    permissionsSubject.next(['manage_users', 'view_reports']);
    fixture.detectChanges();

    expect(component.canManageUsers).toBeTrue();
  });

  it('should hide manage users button when user lacks permission', () => {
    // Emitir permisos sin manage_users
    permissionsSubject.next(['view_reports']);
    fixture.detectChanges();

    expect(component.canManageUsers).toBeFalse();
  });
});
```

---

## 📌 Métodos Disponibles en AuthService

### Observables (Reactivos):
- `meUser$` - Observable del usuario
- `meEnterprise$` - Observable de la empresa
- `config$` - Observable de la configuración
- `roles$` - Observable de los roles
- `permissions$` - Observable de los permisos

### Métodos Síncronos:
- `getCurrentMeUser()` - Obtener usuario actual (sin suscripción)
- `getCurrentPermissions()` - Obtener permisos actuales
- `getCurrentRoles()` - Obtener roles actuales
- `hasPermission(permission: string)` - Verificar si tiene un permiso
- `hasAnyPermission(permissions: string[])` - Verificar si tiene alguno de los permisos
- `hasAllPermissions(permissions: string[])` - Verificar si tiene todos los permisos

### Métodos HTTP:
- `getMe()` - Obtener datos frescos de `/auth/me` (actualiza automáticamente los BehaviorSubjects)

---

## 🔄 Flujo de Datos

```
1. Login exitoso
   └─> authService.login()
       └─> authService.getMe() (automático)
           └─> Actualiza BehaviorSubjects
           └─> Guarda en sessionStorage
           └─> Redirige al dashboard

2. Recarga de página
   └─> APP_INITIALIZER ejecuta
       └─> BehaviorSubjects se inicializan desde sessionStorage (instantáneo)
       └─> authService.getMe() (sincronización con backend)
           └─> Actualiza BehaviorSubjects con datos frescos del servidor

3. Logout
   └─> authService.logout()
       └─> Limpia BehaviorSubjects (null/[])
       └─> Limpia sessionStorage
       └─> Limpia localStorage
       └─> Limpia cookie del backend
```

---

## ⚠️ Notas Importantes

1. **sessionStorage vs localStorage**:
   - ✅ Usamos `sessionStorage` (se limpia al cerrar pestaña)
   - ❌ NO usamos `localStorage` (persiste indefinidamente)

2. **Los datos NO son secretos**:
   - Los permisos y roles son **configuración de UI**, no son un límite de seguridad
   - **SIEMPRE valida los permisos en el backend**

3. **Sincronización automática**:
   - Al recargar, primero se cargan datos de sessionStorage (instantáneo)
   - Luego se llama al backend para sincronizar (puede tardar)
   - Los componentes ven ambas actualizaciones gracias a los Observables

4. **Limpieza automática**:
   - sessionStorage se limpia al cerrar la pestaña del navegador
   - Al hacer logout, todo se limpia manualmente

---

## 🎉 Resumen

Este patrón combina lo mejor de ambos mundos:
- **BehaviorSubject**: Estado reactivo en memoria para uso en la app
- **sessionStorage**: Persistencia temporal para recuperar al recargar
- **Sincronización**: Los datos se actualizan desde el backend al iniciar

Es el enfoque **correcto** para datos de configuración de usuario que no son secretos críticos pero que necesitan persistencia durante la sesión.
