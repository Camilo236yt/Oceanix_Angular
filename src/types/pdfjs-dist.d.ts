// Type definitions for pdfjs-dist 3.x
declare module 'pdfjs-dist' {
    export interface PDFDocumentProxy {
        numPages: number;
        getPage(pageNumber: number): Promise<PDFPageProxy>;
    }

    export interface PDFPageProxy {
        getViewport(params: { scale: number }): PageViewport;
        render(params: RenderParameters): RenderTask;
    }

    export interface PageViewport {
        width: number;
        height: number;
    }

    export interface RenderParameters {
        canvasContext: CanvasRenderingContext2D;
        viewport: PageViewport;
    }

    export interface RenderTask {
        promise: Promise<void>;
    }

    export interface PDFDocumentLoadingTask {
        promise: Promise<PDFDocumentProxy>;
    }

    export function getDocument(src: string | ArrayBuffer): PDFDocumentLoadingTask;

    export namespace GlobalWorkerOptions {
        let workerSrc: string;
    }
}
