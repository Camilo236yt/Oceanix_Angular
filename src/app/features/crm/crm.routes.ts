import { Routes } from '@angular/router';
import { CrmLayout } from './layout/crm-layout/crm-layout';
import { Dashboard } from './components/dashboard/dashboard';
import { Incidencias } from './components/incidencias/incidencias';
import { Usuarios } from './components/usuarios/usuarios';
import { Empresas } from './components/empresas/empresas';
import { RolesPermisos } from './components/roles-permisos/roles-permisos';
import { Reportes } from './components/reportes/reportes';
import { VerificarCuenta } from './components/verificar-cuenta/verificar-cuenta';

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
        component: Dashboard
      },
      {
        path: 'incidencias',
        component: Incidencias
      },
      {
        path: 'usuarios',
        component: Usuarios
      },
      {
        path: 'empresas',
        component: Empresas
      },
      {
        path: 'roles-permisos',
        component: RolesPermisos
      },
      {
        path: 'reportes',
        component: Reportes
      },
      {
        path: 'verificar-cuenta',
        component: VerificarCuenta
      }
    ]
  }
];
