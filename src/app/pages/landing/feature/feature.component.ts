import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-feature',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feature.component.html',
  styleUrl: './feature.component.scss'
})
export class FeatureComponent {
  features: Feature[] = [
    {
      icon: 'clock',
      title: 'Rápido seguimiento',
      description: 'Cada incidencia genera un ticket automático y notifica al empleado asignado.'
    },
    {
      icon: 'bell',
      title: 'Notificaciones inteligentes',
      description: 'Recordatorios antes de que se cumplan los plazos.'
    },
    {
      icon: 'chart',
      title: 'Panel para empresas',
      description: 'Visualiza todos los casos con su estado (verde, amarillo, rojo).'
    }
  ];
}
