import { Directive, ElementRef, HostListener } from '@angular/core';

/**
 * Directiva que permite solo la entrada de números en un input
 * Bloquea cualquier caracter que no sea un dígito
 */
@Directive({
  selector: '[numericOnly]',
  standalone: true
})
export class NumericOnlyDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Reemplazar cualquier caracter que no sea un dígito
    const newValue = value.replace(/[^\d]/g, '');

    if (value !== newValue) {
      input.value = newValue;
      // Disparar el evento input manualmente para que Angular detecte el cambio
      input.dispatchEvent(new Event('input'));
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Permitir teclas especiales: backspace, delete, tab, escape, enter, home, end, arrows
    const specialKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
    ];

    if (specialKeys.includes(event.key)) {
      return;
    }

    // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (event.ctrlKey || event.metaKey) {
      if (['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) {
        return;
      }
    }

    // Bloquear si no es un número
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    // Solo permitir números del texto pegado
    const numericData = pastedData.replace(/[^\d]/g, '');

    if (numericData) {
      const input = event.target as HTMLInputElement;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const currentValue = input.value;

      // Insertar solo los números en la posición del cursor
      const newValue = currentValue.substring(0, start) + numericData + currentValue.substring(end);
      input.value = newValue;

      // Mover el cursor después del texto pegado
      const newPosition = start + numericData.length;
      input.setSelectionRange(newPosition, newPosition);

      // Disparar el evento input manualmente
      input.dispatchEvent(new Event('input'));
    }
  }
}
