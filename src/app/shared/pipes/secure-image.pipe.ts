import { Pipe, PipeTransform } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';

@Pipe({
  name: 'secureImage',
  standalone: true
})
export class SecureImagePipe implements PipeTransform {
  // Caché de imágenes para evitar descargas duplicadas
  private static imageCache = new Map<string, Observable<SafeUrl>>();

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  transform(url: string, isClient: boolean = false): Observable<SafeUrl> {
    if (!url) {
      return of('');
    }

    // Si la URL ya es un blob o data URL, retornarla directamente
    if (url.startsWith('blob:') || url.startsWith('data:')) {
      return of(this.sanitizer.bypassSecurityTrustUrl(url));
    }

    // La URL viene completa del backend (ej: https://backend.../api/v1/incidencias/images/{id})
    // Si es cliente y la URL no termina en /client, agregarlo
    let requestUrl = url;
    if (isClient && !url.endsWith('/client')) {
      requestUrl = `${url}/client`;
    }

    // Verificar si la imagen ya está en caché
    if (SecureImagePipe.imageCache.has(requestUrl)) {
      console.log('⚡ [SecureImagePipe] Usando imagen en caché:', requestUrl);
      return SecureImagePipe.imageCache.get(requestUrl)!;
    }

    console.log('🖼️ [SecureImagePipe] Descargando imagen:', requestUrl);

    // Crear el observable de la imagen
    const imageObservable = this.http.get(requestUrl, {
      responseType: 'blob',
      withCredentials: true // Importante para cookies
    }).pipe(
      map(blob => {
        console.log('✅ [SecureImagePipe] Imagen descargada:', requestUrl);
        const objectUrl = URL.createObjectURL(blob);
        return this.sanitizer.bypassSecurityTrustUrl(objectUrl);
      }),
      catchError((error) => {
        console.error('❌ [SecureImagePipe] Error cargando imagen:', requestUrl, error);
        // Remover del caché si hay error
        SecureImagePipe.imageCache.delete(requestUrl);
        return of('');
      }),
      shareReplay(1) // Compartir el resultado entre múltiples suscriptores
    );

    // Guardar en caché
    SecureImagePipe.imageCache.set(requestUrl, imageObservable);

    return imageObservable;
  }

  /**
   * Método estático para limpiar la caché si es necesario
   */
  static clearCache(): void {
    SecureImagePipe.imageCache.clear();
  }
}
