import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  productLinks = ['Características', 'Precios', 'Casos de uso'];
  companyLinks = ['Sobre nosotros', 'Términos', 'Privacidad'];
  supportLinks = ['Centro de ayuda', 'Contacto'];
}
