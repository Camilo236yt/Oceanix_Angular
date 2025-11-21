import { Routes } from '@angular/router';
import { CrmLayout } from './layout/crm-layout/crm-layout';
import { Dashboard } from './components/dashboard/dashboard';
import { Incidencias } from './components/incidencias/incidencias';
import { Usuarios } from './components/usuarios/usuarios';
import { Empresas } from './components/empresas/empresas';
import { RolesPermisos } from './components/roles-permisos/roles-permisos';
import { Reportes } from './components/reportes/reportes';
import { VerificarCuenta } from './components/verificar-cuenta/verificar-cuenta';
import { permissionGuard, anyPermissionGuard } from '../../core/guards/permission.guard';

export const CRM_ROUTES: Routes = [
  {
    path: '',
    component: CrmLayout,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: Dashboard,
        canActivate: [permissionGuard('read_dashboard')]
      },
      {
        path: 'incidencias',
        component: Incidencias,
        canActivate: [anyPermissionGuard(['view_incidents', 'view_own_incidents'])]
      },
      {
        path: 'usuarios',
        component: Usuarios,
        canActivate: [permissionGuard('view_users')]
      },
      {
        path: 'empresas',
        component: Empresas,
        canActivate: [permissionGuard('manage_system')]
      },
      {
        path: 'roles-permisos',
        component: RolesPermisos,
        canActivate: [anyPermissionGuard(['manage_roles', 'manage_permissions'])]
      },
      {
        path: 'reportes',
        component: Reportes,
        canActivate: [permissionGuard('view_reports')]
      },
      {
        path: 'verificar-cuenta',
        component: VerificarCuenta
      }
    ]
  }
];
