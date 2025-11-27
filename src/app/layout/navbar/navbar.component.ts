import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  menuItems = [
    { label: 'Inicio', active: true, anchor: '' },
    { label: 'Características', active: false, anchor: 'caracteristicas' },
    { label: 'Empresas', active: false, anchor: 'empresas' },
    { label: 'Contacto', active: false, anchor: 'contacto' }
  ];

  private isScrollingProgrammatically = false;
  protected isMobileMenuOpen = false;
  protected isNavigating = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Detectar la sección actual al cargar
    this.updateActiveSection();
  }

  ngOnDestroy(): void {}

  @HostListener('window:scroll')
  onWindowScroll(): void {
    // Solo actualizar si no estamos haciendo scroll programáticamente
    if (!this.isScrollingProgrammatically) {
      this.updateActiveSection();
    }
  }

  private updateActiveSection(): void {
    const scrollPosition = window.pageYOffset + 150; // Offset para considerar el navbar

    // Si estamos cerca del inicio de la página
    if (window.pageYOffset < 100) {
      this.setActiveItem('');
      return;
    }

    // Revisar cada sección
    for (let i = this.menuItems.length - 1; i >= 0; i--) {
      const item = this.menuItems[i];
      if (item.anchor) {
        const element = document.getElementById(item.anchor);
        if (element) {
          const elementTop = element.offsetTop;
          if (scrollPosition >= elementTop) {
            this.setActiveItem(item.anchor);
            return;
          }
        }
      }
    }
  }

  private setActiveItem(anchor: string): void {
    this.menuItems.forEach(item => {
      item.active = item.anchor === anchor;
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  navigateToRegister(): void {
    this.isMobileMenuOpen = false;
    this.isNavigating = true;
    setTimeout(() => {
      this.router.navigate(['/register']);
    }, 800);
  }

  navigateToLogin(): void {
    this.isMobileMenuOpen = false;
    this.router.navigate(['/admin']);
  }

  scrollToSection(anchor: string): void {
    // Cerrar el menú móvil si está abierto
    this.isMobileMenuOpen = false;

    // Marcar que estamos haciendo scroll programático
    this.isScrollingProgrammatically = true;

    // Actualizar el estado activo de los items del menú
    this.setActiveItem(anchor);

    // Si estamos en otra ruta, primero navegamos al home
    if (this.router.url !== '/') {
      this.router.navigate(['/']).then(() => {
        this.performScroll(anchor);
      });
    } else {
      this.performScroll(anchor);
    }
  }

  private performScroll(anchor: string): void {
    if (!anchor) {
      this.smoothScrollTo(0, 600);
      return;
    }

    const element = document.getElementById(anchor);
    if (element) {
      const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - 100;
      this.smoothScrollTo(targetPosition, 600);
    }
  }

  private smoothScrollTo(targetPosition: number, duration: number): void {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      // Easing suave y consistente (ease-in-out-quad)
      const easing = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      window.scrollTo(0, startPosition + distance * easing);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        // Cuando termina la animación, permitir detección automática de nuevo
        setTimeout(() => {
          this.isScrollingProgrammatically = false;
        }, 100);
      }
    };

    requestAnimationFrame(animation);
  }
}
