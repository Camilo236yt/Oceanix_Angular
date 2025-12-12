import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { ActivateAccount } from './auth/activate-account/activate-account';
import { Documentation } from './pages/documentation/documentation';
import { mainDomainGuard } from './core/guards/main-domain.guard';
import { authRedirectGuard } from './core/guards/auth-redirect.guard';
import { loginAccessGuard } from './core/guards/login-access.guard';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    canActivate: [mainDomainGuard, authRedirectGuard] // Solo en dominio principal y sin autenticación
  },
  {
    path: 'admin',
    component: Login,
    canActivate: [mainDomainGuard] // Solo en dominio principal
  },
  {
    path: 'login',
    component: Login,
    canActivate: [loginAccessGuard]
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
    path: 'documentacion',
    component: Documentation
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
    redirectTo: 'admin'
  }
];
