import { Routes } from '@angular/router';
import { PortalLoginComponent } from './components/login/login.component';
import { RegistroClienteIncidenciaComponent } from './components/registro-cliente-incidencia/registro-cliente-incidencia.component';

export const PORTAL_ROUTES: Routes = [
  {
    path: 'login',
    component: PortalLoginComponent
  },
  {
    path: 'registro-incidencia',
    component: RegistroClienteIncidenciaComponent
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
