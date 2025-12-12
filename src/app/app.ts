import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Oceanix_F');
  showLayout = true;

  constructor(private router: Router) {
    // Escuchar cambios de ruta para mostrar/ocultar navbar y footer
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        // Rutas donde NO se debe mostrar el navbar y footer
        const hiddenLayoutRoutes = ['/admin', '/login', '/register', '/documentacion'];
        const url = event.urlAfterRedirects;

        // Ocultar layout si la ruta está en hiddenLayoutRoutes o empieza con /crm o /portal
        this.showLayout = !hiddenLayoutRoutes.includes(url) && !url.startsWith('/crm') && !url.startsWith('/portal');
      });
  }
}
