import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Step {
  number: number;
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-steps',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './steps.component.html',
  styleUrl: './steps.component.scss'
})
export class StepsComponent {
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
}
