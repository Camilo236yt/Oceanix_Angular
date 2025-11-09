import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'crm',
    loadChildren: () => import('./features/crm/crm.routes').then(m => m.CRM_ROUTES)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
