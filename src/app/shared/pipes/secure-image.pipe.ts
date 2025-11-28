import { Pipe, PipeTransform } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { map, catchError, startWith } from 'rxjs/operators';

@Pipe({
  name: 'secureImage',
  standalone: true
})
export class SecureImagePipe implements PipeTransform {
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

    // Si es cliente, modificar la URL para usar el endpoint /client
    let requestUrl = url;
    if (isClient && url.includes('/incidencias/images/') && !url.includes('/client')) {
      requestUrl = url.replace('/incidencias/images/', '/incidencias/images/') + '/client';
      // Mejor forma: insertar /client antes del ID
      const parts = url.split('/images/');
      if (parts.length === 2) {
        requestUrl = `${parts[0]}/images/${parts[1]}/client`;
      }
    }

    console.log('🖼️ [SecureImagePipe] Loading image:', { original: url, request: requestUrl, isClient });

    // Hacer la petición con credenciales para que envíe cookies o JWT
    return this.http.get(requestUrl, {
      responseType: 'blob',
      withCredentials: true // Importante para cookies
    }).pipe(
      map(blob => {
        console.log('✅ [SecureImagePipe] Image loaded successfully:', requestUrl);
        const objectUrl = URL.createObjectURL(blob);
        return this.sanitizer.bypassSecurityTrustUrl(objectUrl);
      }),
      startWith(null as any), // Emitir null primero para mostrar skeleton
      catchError((error) => {
        // En caso de error, retornar una imagen placeholder
        console.error('❌ [SecureImagePipe] Error loading image:', requestUrl, error);
        return of('');
      })
    );
  }
}
