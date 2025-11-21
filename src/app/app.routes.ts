import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { ActivateAccount } from './auth/activate-account/activate-account';
import { mainDomainGuard } from './core/guards/main-domain.guard';
import { subdomainGuard } from './core/guards/subdomain.guard';
import { authRedirectGuard } from './core/guards/auth-redirect.guard';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    canActivate: [mainDomainGuard, authRedirectGuard] // Solo accesible desde oceanix.space y sin autenticación
  },
  {
    path: 'login',
    component: Login
    // Sin guard - accesible siempre (el landing tiene authRedirectGuard para bloquear usuarios autenticados)
  },
  {
    path: 'register',
    component: Register,
    canActivate: [mainDomainGuard, authRedirectGuard] // Solo en dominio principal y sin autenticación
  },
  {
    path: 'auth/activate',
    component: ActivateAccount
  },
  {
    path: 'crm',
    loadChildren: () => import('./features/crm/crm.routes').then(m => m.CRM_ROUTES)
  },
  {
    path: 'portal',
    loadChildren: () => import('./pages/portal/portal.routes').then(m => m.PORTAL_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
