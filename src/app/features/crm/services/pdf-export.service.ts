import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root',
})
export class PdfExportService {
  constructor() {}

  /**
   * Genera un PDF desde un elemento HTML
   * @param elementId - ID del elemento HTML a convertir
   * @param filename - Nombre del archivo PDF
   */
  async generatePdfFromHtml(elementId: string, filename: string = 'reporte-incidencias.pdf'): Promise<void> {
    const element = document.getElementById(elementId);

    if (!element) {
      console.error('Element not found:', elementId);
      return;
    }

    try {
      // Capturar el elemento HTML como canvas - escala reducida para velocidad
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        imageTimeout: 0,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // Calcular dimensiones basadas en el contenido real
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Crear el PDF con el tamaño exacto del contenido
      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [imgWidth, imgHeight],
        compress: true
      });

      // Añadir la imagen sin espacio en blanco
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');

      // Guardar el PDF
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  /**
   * Genera un PDF personalizado con datos de incidencias
   * @param data - Datos de las incidencias
   */
  async generateIncidenciasReport(data: any): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');

    // Aquí puedes personalizar el PDF sin depender de HTML
    // Esta es una alternativa manual si no quieres usar html2canvas

    pdf.setFontSize(20);
    pdf.text('Reporte de Incidencias', 105, 20, { align: 'center' });

    pdf.setFontSize(12);
    pdf.text(`Total: ${data.total}`, 20, 40);

    pdf.save('reporte-incidencias.pdf');
  }
}
