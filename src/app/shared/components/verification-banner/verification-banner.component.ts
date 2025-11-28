import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-verification-banner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verification-banner.component.html',
  styleUrls: ['./verification-banner.component.scss']
})
export class VerificationBannerComponent implements OnInit, OnDestroy {
  // Property to control visibility of the banner
  showBanner = false;
  bannerMessage = '';
  showLink = true;
  private routerSubscription?: Subscription;

  // Permisos requeridos para ver el banner de verificación
  private readonly verificationPermissions = [
    'manage_enterprise_config',
    'upload_enterprise_documents',
    'verify_enterprises'
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Verificar si el usuario tiene permisos de verificación
    const hasVerificationPermission = this.authService.hasAnyPermission(this.verificationPermissions);

    if (!hasVerificationPermission) {
      // Si no tiene permisos de verificación, no mostrar el banner
      this.showBanner = false;
      return;
    }

    // Check initial route
    this.checkRoute(this.router.url);

    // Subscribe to route changes
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.checkRoute(event.urlAfterRedirects);
      });
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private checkRoute(url: string) {
    // Verificar si tiene permisos de verificación
    const hasVerificationPermission = this.authService.hasAnyPermission(this.verificationPermissions);

    // Verificar el estado de verificación en localStorage
    const verificationStatus = localStorage.getItem('verificationStatus');

    // Determinar el mensaje del banner según el estado
    if (verificationStatus === 'pending_review') {
      this.bannerMessage = 'Estamos verificando tus datos, pronto recibirás una confirmación';
      this.showLink = false; // No mostrar el link cuando está en revisión
    } else {
      this.bannerMessage = 'No has completado tu verificación, haz click';
      this.showLink = true;
    }

    // Hide banner if we're on the verification page or don't have permissions
    this.showBanner = hasVerificationPermission && !url.includes('/verificar-cuenta');
  }
}
