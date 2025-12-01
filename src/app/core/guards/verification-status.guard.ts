import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { map, take } from 'rxjs/operators';

/**
 * Guard that prevents access to verification page when already verified or in progress
 * Only allows access when actualVerificationStatus is 'pending'
 */
export const verificationStatusGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.config$.pipe(
    take(1),
    map(config => {
      const actualVerificationStatus = config?.actualVerificationStatus;

      // Si el estado es 'verified', redirigir al dashboard (ya está verificado)
      if (actualVerificationStatus === 'verified') {
        console.log('⛔ Acceso bloqueado a verificar-cuenta: empresa ya verificada');
        router.navigate(['/crm/dashboard']);
        return false;
      }

      // Si el estado es 'in_progress', redirigir al dashboard (en revisión)
      if (actualVerificationStatus === 'in_progress') {
        console.log('⛔ Acceso bloqueado a verificar-cuenta: estado in_progress');
        router.navigate(['/crm/dashboard']);
        return false;
      }

      // Permitir acceso solo cuando está en 'pending'
      return true;
    })
  );
};
