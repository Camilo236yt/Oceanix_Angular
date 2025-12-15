import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { LandingChatbotComponent } from './shared/components/landing-chatbot/landing-chatbot.component';
import { CrmChatbotComponent } from './shared/components/crm-chatbot/crm-chatbot.component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, CommonModule, LandingChatbotComponent, CrmChatbotComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Oceanix_F');
  showLayout = true;
  isInCRM = false;

  constructor(private router: Router, private titleService: Title) {
    // Escuchar cambios de ruta para mostrar/ocultar navbar y footer
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        // Rutas donde NO se debe mostrar el navbar y footer
        const hiddenLayoutRoutes = ['/admin', '/login', '/register', '/documentacion', '/terminos-y-condiciones'];
        const url = event.urlAfterRedirects;

        // Ocultar layout si la ruta está en hiddenLayoutRoutes o empieza con /crm o /portal
        this.showLayout = !hiddenLayoutRoutes.includes(url) && !url.startsWith('/crm') && !url.startsWith('/portal');

        // Detectar si el usuario está en el CRM
        this.isInCRM = url.startsWith('/crm');

        // Actualizar el título según la ruta
        this.updateTitle(url);
      });
  }

  private updateTitle(url: string): void {
    let pageTitle = 'Oceanix';

    if (url.startsWith('/crm')) {
      pageTitle = 'CRM';
    } else if (url.startsWith('/portal')) {
      pageTitle = 'Portal Clientes';
    } else if (url.startsWith('/documentacion')) {
      pageTitle = 'Documentación';
    } else if (url.startsWith('/terminos-y-condiciones')) {
      pageTitle = 'Términos y Condiciones';
    }

    this.titleService.setTitle(pageTitle);
  }
}
