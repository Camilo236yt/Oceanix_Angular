import { Routes } from '@angular/router';
import { PortalLoginComponent } from './components/login/login.component';
import { RegistroClienteIncidenciaComponent } from './components/registro-cliente-incidencia/registro-cliente-incidencia.component';
import { authClienteGuard } from './guards/auth-cliente.guard';

export const PORTAL_ROUTES: Routes = [
  {
    path: 'login',
    component: PortalLoginComponent
  },
  {
    path: 'registro-incidencia',
    component: RegistroClienteIncidenciaComponent,
    canActivate: [authClienteGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
