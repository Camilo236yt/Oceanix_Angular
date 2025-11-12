import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_STORAGE_KEY = 'theme-preference';

  // Signal para el tema actual
  public theme = signal<Theme>(this.getInitialTheme());

  // Signal computado para el tema efectivo (resuelve 'system' a 'light' o 'dark')
  public effectiveTheme = signal<'light' | 'dark'>('light');

  constructor() {
    // Efecto para aplicar el tema cuando cambie
    effect(() => {
      this.applyTheme(this.theme());
    });

    // Listener para cambios en la preferencia del sistema
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (this.theme() === 'system') {
          this.applyTheme('system');
        }
      });
    }
  }

  /**
   * Obtiene el tema inicial desde localStorage o del sistema
   */
  private getInitialTheme(): Theme {
    const stored = localStorage.getItem(this.THEME_STORAGE_KEY) as Theme;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored;
    }
    return 'system';
  }

  /**
   * Establece el tema y lo persiste
   */
  public setTheme(theme: Theme): void {
    this.theme.set(theme);
    localStorage.setItem(this.THEME_STORAGE_KEY, theme);
  }

  /**
   * Alterna entre light y dark (no incluye system)
   */
  public toggleTheme(): void {
    const current = this.effectiveTheme();
    this.setTheme(current === 'light' ? 'dark' : 'light');
  }

  /**
   * Aplica el tema al document root
   */
  private applyTheme(theme: Theme): void {
    const root = document.documentElement;

    // Determinar el tema efectivo
    let effectiveTheme: 'light' | 'dark';

    if (theme === 'system') {
      effectiveTheme = this.getSystemTheme();
    } else {
      effectiveTheme = theme;
    }

    // Actualizar el signal del tema efectivo
    this.effectiveTheme.set(effectiveTheme);

    // Aplicar/remover la clase dark
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  /**
   * Obtiene la preferencia de tema del sistema
   */
  private getSystemTheme(): 'light' | 'dark' {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Verifica si el tema actual es oscuro
   */
  public isDark(): boolean {
    return this.effectiveTheme() === 'dark';
  }

  /**
   * Verifica si el tema actual es claro
   */
  public isLight(): boolean {
    return this.effectiveTheme() === 'light';
  }
}
