import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

interface Step {
  number: number;
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-steps',
  standalone: true,
  imports: [CommonModule, LoadingSpinner],
  templateUrl: './steps.component.html',
  styleUrl: './steps.component.scss'
})
export class StepsComponent {
  isLoading = false;

  steps: Step[] = [
    {
      number: 1,
      icon: 'document',
      title: 'El cliente llena un formulario',
      description: 'Con sus datos, NIT y número de guía.'
    },
    {
      number: 2,
      icon: 'lightning',
      title: 'Sistema crea un ticket',
      description: 'Y lo asigna automáticamente a un empleado.'
    },
    {
      number: 3,
      icon: 'check',
      title: 'Gestión y actualizaciones',
      description: 'La empresa gestiona el caso y el cliente recibe actualizaciones.'
    }
  ];

  constructor(private router: Router) {}

  /**
   * Redirigir al registro con animación de carga
   */
  goToRegister(): void {
    this.isLoading = true;

    // Mostrar loading durante 800ms (duración estándar)
    setTimeout(() => {
      this.router.navigate(['/register']);
      this.isLoading = false;
    }, 800);
  }
}
