import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { Login } from './auth/login/login';

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
    path: '**',
    redirectTo: ''
  }
];
