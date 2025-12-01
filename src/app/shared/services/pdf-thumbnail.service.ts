import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

@Injectable({
    providedIn: 'root'
})
export class PdfThumbnailService {

    /**
     * Generates a thumbnail image from a PDF blob URL
     * @param pdfUrl - Blob URL of the PDF
     * @param maxWidth - Maximum width of the thumbnail (default: 400)
     * @param maxHeight - Maximum height of the thumbnail (default: 300)
     * @returns Promise<string> - Data URL of the thumbnail image
     */
    async generateThumbnail(pdfUrl: string, maxWidth: number = 400, maxHeight: number = 300): Promise<string> {
        try {
            console.log('📄 Generating thumbnail for PDF:', pdfUrl);

            // Load the PDF document
            const loadingTask = pdfjsLib.getDocument(pdfUrl);
            const pdf = await loadingTask.promise;

            console.log(`✅ PDF loaded, has ${pdf.numPages} pages`);

            // Get the first page
            const page = await pdf.getPage(1);

            // Calculate scale to fit within max dimensions
            const viewport = page.getViewport({ scale: 1 });
            const scale = Math.min(
                maxWidth / viewport.width,
                maxHeight / viewport.height
            );

            const scaledViewport = page.getViewport({ scale });

            // Create canvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            if (!context) {
                throw new Error('Could not get canvas context');
            }

            canvas.width = scaledViewport.width;
            canvas.height = scaledViewport.height;

            // Render PDF page to canvas
            const renderContext = {
                canvasContext: context,
                viewport: scaledViewport
            };

            await page.render(renderContext).promise;

            console.log('✅ Thumbnail generated successfully');

            // Convert canvas to data URL
            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error('❌ Error generating PDF thumbnail:', error);
            throw error;
        }
    }

    /**
     * Generates a thumbnail from a file blob
     * @param blob - PDF file blob
     * @param maxWidth - Maximum width of the thumbnail
     * @param maxHeight - Maximum height of the thumbnail
     * @returns Promise<string> - Data URL of the thumbnail image
     */
    async generateThumbnailFromBlob(blob: Blob, maxWidth: number = 400, maxHeight: number = 300): Promise<string> {
        const blobUrl = URL.createObjectURL(blob);
        try {
            const thumbnail = await this.generateThumbnail(blobUrl, maxWidth, maxHeight);
            return thumbnail;
        } finally {
            // Clean up blob URL
            URL.revokeObjectURL(blobUrl);
        }
    }
}
