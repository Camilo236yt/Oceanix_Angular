import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, IconComponent, LoadingSpinner],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  isLoading = false;
  currentYear = new Date().getFullYear();

  constructor(private router: Router) {}

  /**
   * Redirigir al registro con animación de carga
   */
  goToRegister(): void {
    this.isLoading = true;

    setTimeout(() => {
      this.router.navigate(['/register']);
      this.isLoading = false;
    }, 800);
  }
}
