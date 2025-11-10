import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { mainDomainGuard } from './core/guards/main-domain.guard';
import { subdomainGuard } from './core/guards/subdomain.guard';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    canActivate: [mainDomainGuard] // Solo accesible desde oceanix.space
  },
  {
    path: 'login',
    component: Login,
    canActivate: [subdomainGuard] // Solo accesible desde subdominios
  },
  {
    path: 'register',
    component: Register,
    canActivate: [subdomainGuard] // Solo accesible desde subdominios
  },
  {
    path: 'crm',
    loadChildren: () => import('./features/crm/crm.routes').then(m => m.CRM_ROUTES),
    canActivate: [subdomainGuard] // Solo accesible desde subdominios
  },
  {
    path: '**',
    redirectTo: ''
  }
];
