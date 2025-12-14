import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';

    // Convertir markdown básico a HTML
    let html = value
      // Negritas: **texto** -> <strong>texto</strong>
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Itálicas: *texto* -> <em>texto</em>
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Saltos de línea
      .replace(/\n/g, '<br>');

    return this.sanitizer.sanitize(1, html) || '';
  }
}
