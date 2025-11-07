import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICONS, SPECIAL_ICONS } from './icons.config';

/**
 * Componente reutilizable para renderizar íconos SVG
 *
 * @example
 * // Uso básico
 * <app-icon name="facebook"></app-icon>
 *
 * @example
 * // Con tamaño y clases personalizadas
 * <app-icon name="email" class="w-6 h-6 text-gray-400"></app-icon>
 *
 * @example
 * // Con tamaño específico
 * <app-icon name="lock" [size]="32"></app-icon>
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss'
})
export class IconComponent {
  /**
   * Nombre del ícono a renderizar
   * Debe corresponder a una clave en el objeto ICONS
   */
  @Input({ required: true }) name!: string;

  /**
   * Tamaño del ícono en píxeles
   * Por defecto es 24px
   */
  @Input() size: string | number = 24;

  /**
   * Color del ícono
   * Por defecto usa 'currentColor' para heredar el color del texto padre
   */
  @Input() color: string = 'currentColor';

  /**
   * Clases CSS adicionales para el ícono
   */
  @Input() class: string = '';

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Obtiene la configuración del ícono desde icons.config.ts
   */
  get iconConfig() {
    return ICONS[this.name];
  }

  /**
   * Verifica si el ícono requiere renderizado especial (múltiples paths)
   */
  get isSpecialIcon(): boolean {
    return Object.keys(SPECIAL_ICONS).includes(this.name);
  }

  /**
   * Obtiene el HTML del ícono especial (sanitizado)
   */
  get specialIconHtml(): SafeHtml {
    const html = SPECIAL_ICONS[this.name] || '';
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /**
   * Convierte el tamaño a píxeles si es un número
   */
  get sizeInPx(): string {
    return typeof this.size === 'number' ? `${this.size}px` : this.size;
  }

  /**
   * Obtiene el viewBox del ícono
   */
  get viewBox(): string {
    // Para el logo de Oceanix, usar viewBox ajustado a las coordenadas reales del SVG
    if (this.name === 'oceanix-logo') {
      return '200 400 250 250';
    }
    // Para Google, usar viewBox estándar
    if (this.name === 'google') {
      return '0 0 24 24';
    }
    return this.iconConfig?.viewBox || '0 0 24 24';
  }

  /**
   * Verifica si el ícono existe en la configuración
   */
  get iconExists(): boolean {
    return !!this.iconConfig || this.isSpecialIcon;
  }

  /**
   * Obtiene el fill del ícono
   */
  get fill(): string {
    if (this.iconConfig?.fill === 'currentColor') {
      return this.color;
    }
    return this.iconConfig?.fill || 'none';
  }

  /**
   * Obtiene el stroke del ícono
   */
  get stroke(): string {
    if (this.iconConfig?.stroke === 'currentColor') {
      return this.color;
    }
    return this.iconConfig?.stroke || 'none';
  }

  /**
   * Obtiene el strokeWidth del ícono
   */
  get strokeWidth(): string {
    return this.iconConfig?.strokeWidth || '0';
  }

  /**
   * Obtiene el strokeLinecap del ícono
   */
  get strokeLinecap(): string {
    return this.iconConfig?.strokeLinecap || 'round';
  }

  /**
   * Obtiene el strokeLinejoin del ícono
   */
  get strokeLinejoin(): string {
    return this.iconConfig?.strokeLinejoin || 'round';
  }
}
