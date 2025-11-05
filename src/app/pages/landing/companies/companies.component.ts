import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Testimonial {
  quote: string;
  name: string;
  position: string;
  company: string;
  initials: string;
}

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './companies.component.html',
  styleUrl: './companies.component.scss'
})
export class CompaniesComponent {
  testimonials: Testimonial[] = [
    {
      quote: 'Desde que usamos este sistema, redujimos los reclamos pendientes en un 40%.',
      name: 'María González',
      position: 'Directora de Operaciones',
      company: 'LogísticaX S.A.',
      initials: 'M.G.'
    },
    {
      quote: 'La asignación automática de tickets nos ahorró horas de trabajo manual cada semana.',
      name: 'Carlos Ramírez',
      position: 'Gerente de Servicio al Cliente',
      company: 'EnvíosRápidos',
      initials: 'C.R.'
    },
    {
      quote: 'El semáforo de tiempos nos ayudó a priorizar casos críticos y mejorar nuestros tiempos de respuesta.',
      name: 'Ana Patricia López',
      position: 'CEO',
      company: 'Distribuidora Nacional',
      initials: 'A.L.'
    }
  ];
}
