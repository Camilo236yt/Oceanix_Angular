import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  productLinks = ['Características', 'Precios', 'Casos de uso'];
  companyLinks = ['Sobre nosotros', 'Términos', 'Privacidad'];
  supportLinks = ['Centro de ayuda', 'Contacto'];
}
