/**
 * Configuración centralizada de íconos SVG
 *
 * Este archivo contiene todos los íconos en formato SVG que se utilizan en la aplicación.
 * Cada ícono está almacenado como un string con el código SVG completo.
 *
 * Para agregar un nuevo ícono:
 * 1. Agrega una nueva propiedad al objeto ICONS
 * 2. El valor debe ser el código SVG completo (sin la etiqueta <svg> externa)
 * 3. El viewBox debe estar en el formato "0 0 24 24" (estándar)
 */

export interface IconConfig {
  viewBox: string;
  path: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: string;
  strokeLinecap?: string;
  strokeLinejoin?: string;
}

export const ICONS: Record<string, IconConfig> = {
  // Redes Sociales
  'facebook': {
    viewBox: '0 0 24 24',
    path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
    fill: 'currentColor'
  },

  'twitter': {
    viewBox: '0 0 24 24',
    path: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z',
    fill: 'currentColor'
  },

  'linkedin': {
    viewBox: '0 0 24 24',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    fill: 'currentColor'
  },

  // Autenticación y Formularios
  'email': {
    viewBox: '0 0 24 24',
    path: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  'lock': {
    viewBox: '0 0 24 24',
    path: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  'eye': {
    viewBox: '0 0 24 24',
    path: 'M11.5 18c4 0 7.46-2.22 9.24-5.5C18.96 9.22 15.5 7 11.5 7s-7.46 2.22-9.24 5.5C4.04 15.78 7.5 18 11.5 18m0-12c4.56 0 8.5 2.65 10.36 6.5C20 16.35 16.06 19 11.5 19S3 16.35 1.14 12.5C3 8.65 6.94 6 11.5 6m0 2C14 8 16 10 16 12.5S14 17 11.5 17S7 15 7 12.5S9 8 11.5 8m0 1A3.5 3.5 0 0 0 8 12.5a3.5 3.5 0 0 0 3.5 3.5a3.5 3.5 0 0 0 3.5-3.5A3.5 3.5 0 0 0 11.5 9',
    fill: 'currentColor'
  },

  'eye-off': {
    viewBox: '0 0 24 24',
    path: 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  // Navegación
  'arrow-left': {
    viewBox: '0 0 24 24',
    path: 'M15 19l-7-7 7-7',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  // Google
  'google': {
    viewBox: '0 0 24 24',
    path: '',
    fill: 'none',
    // Google requiere múltiples paths, se manejará como caso especial
  },

  // Loading
  'spinner': {
    viewBox: '0 0 24 24',
    path: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z',
    fill: 'currentColor'
  },

  // Acciones
  'pencil': {
    viewBox: '0 0 24 24',
    path: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  'trash-2': {
    viewBox: '0 0 24 24',
    path: 'M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M10 11v6 M14 11v6',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  'plus': {
    viewBox: '0 0 24 24',
    path: 'M12 5v14 M5 12h14',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  'calendar': {
    viewBox: '0 0 24 24',
    path: 'M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  'search': {
    viewBox: '0 0 24 24',
    path: 'M21 21l-4.35-4.35 M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0z',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  'bell': {
    viewBox: '0 0 24 24',
    path: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  'user': {
    viewBox: '0 0 24 24',
    path: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  'shield': {
    viewBox: '0 0 24 24',
    path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  'download': {
    viewBox: '0 0 24 24',
    path: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  'file-text': {
    viewBox: '0 0 24 24',
    path: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  'chevron-down': {
    viewBox: '0 0 1024 1024',
    path: 'M104.704 338.752a64 64 0 0 1 90.496 0l316.8 316.8l316.8-316.8a64 64 0 0 1 90.496 90.496L557.248 791.296a64 64 0 0 1-90.496 0L104.704 429.248a64 64 0 0 1 0-90.496',
    fill: 'currentColor'
  },

  'chevron-up': {
    viewBox: '0 0 1024 1024',
    path: 'M104.704 685.248a64 64 0 0 0 90.496 0l316.8-316.8l316.8 316.8a64 64 0 0 0 90.496-90.496L557.248 232.704a64 64 0 0 0-90.496 0L104.704 594.752a64 64 0 0 0 0 90.496',
    fill: 'currentColor'
  },

  'chevron-left': {
    viewBox: '0 0 24 24',
    path: 'M15 18l-6-6 6-6',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  'chevron-right': {
    viewBox: '0 0 24 24',
    path: 'M9 18l6-6-6-6',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  'x': {
    viewBox: '0 0 24 24',
    path: 'M18 6L6 18 M6 6l12 12',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  'layout-dashboard': {
    viewBox: '0 0 24 24',
    path: 'M3 3h7v9H3z M14 3h7v5h-7z M14 12h7v9h-7z M3 16h7v5H3z',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  'alert-circle': {
    viewBox: '0 0 24 24',
    path: 'M12 8v4 M12 16h.01 M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  'folder': {
    viewBox: '0 0 24 24',
    path: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  'flag': {
    viewBox: '0 0 24 24',
    path: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  'check-circle': {
    viewBox: '0 0 24 24',
    path: 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  'message-circle': {
    viewBox: '0 0 24 24',
    path: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  'file': {
    viewBox: '0 0 24 24',
    path: 'M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z M13 2v7h7',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  'users': {
    viewBox: '0 0 24 24',
    path: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  'database': {
    viewBox: '0 0 24 24',
    path: 'M12 8c-4.97 0-9-1.343-9-3s4.03-3 9-3 9 1.343 9 3-4.03 3-9 3z M21 12c0 1.66-4 3-9 3s-9-1.34-9-3 M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  'settings': {
    viewBox: '0 0 24 24',
    path: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  'check-square': {
    viewBox: '0 0 24 24',
    path: 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  'list': {
    viewBox: '0 0 24 24',
    path: 'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  'mail': {
    viewBox: '0 0 24 24',
    path: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },

  'shield-off': {
    viewBox: '0 0 24 24',
    path: 'M19.69 14a6.9 6.9 0 0 0 .31-2V5l-8-3-3.16 1.18 M4.73 4.73L4 5v7c0 6 8 10 8 10a20.29 20.29 0 0 0 5.62-4.38 M1 1l22 22',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  }
};

/**
 * Íconos especiales que requieren múltiples paths o estructura compleja
 */
export const SPECIAL_ICONS: Record<string, string> = {
  'google': `
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path>
  `,

  'oceanix-logo': `
    <path fill="#28A2C9" opacity="1.000000" stroke="none" d="M231.229584,524.019897 C217.085098,500.388641 214.914291,476.363159 230.153198,452.510590 C245.988235,427.724976 268.297363,412.737885 298.364105,412.172150 C313.381744,411.889587 326.610474,417.683258 336.757751,429.384277 C320.846130,421.679810 304.332275,419.078430 286.935730,421.982941 C274.392517,424.077118 262.855438,428.595917 252.337067,435.662689 C258.113068,440.272583 263.612885,444.662079 268.931976,449.339691 C268.106171,450.127472 267.465088,450.632294 266.815521,451.125946 C258.214935,457.661926 250.056244,464.532166 247.669373,476.228271 C243.509033,487.062714 243.955933,497.827911 246.404892,508.598511 C247.354874,512.776550 248.810837,516.839539 249.649689,520.926880 C243.673798,518.429932 238.428528,517.874756 234.006699,523.278320 C233.514267,523.880066 232.175735,523.789429 231.229584,524.019897 z"/>
    <path fill="#243E7E" opacity="1.000000" stroke="none" d="M500.936584,544.928589 C489.724335,557.402161 474.944153,561.356689 459.988068,556.126221 C446.988800,551.579956 438.037628,539.854309 437.121399,526.171814 C436.052185,510.204102 444.859406,495.768219 458.974609,490.352386 C473.904694,484.623901 491.866760,489.357056 501.006317,501.428101 C510.805695,514.370544 510.856567,531.141296 500.936584,544.928589 M460.410675,541.196716 C473.245361,549.387512 487.800140,544.751404 492.509216,530.972412 C495.958435,520.879761 491.873047,509.190796 483.040497,503.881042 C474.735107,498.888153 464.536591,500.214355 457.884308,507.152344 C449.195129,516.214722 450.062256,531.176636 460.410675,541.196716 z"/>
    <path fill="#2A7FB1" opacity="1.000000" stroke="none" d="M231.311951,524.349304 C232.175735,523.789429 233.514267,523.880066 234.006699,523.278320 C238.428528,517.874756 243.673798,518.429932 249.911346,521.145325 C255.442322,531.090881 261.315277,540.218750 269.777557,547.051636 C277.424164,553.225891 285.894928,558.379395 294.203522,564.266724 C313.273285,574.138489 333.239990,579.678650 354.437866,579.914551 C367.355896,580.058411 380.283264,579.364441 393.206421,579.046875 C385.820740,585.381348 378.467804,591.755066 370.998901,597.989868 C370.248199,598.616516 368.773346,598.642761 367.671204,598.542847 C322.559937,594.456543 282.513153,578.432739 249.356796,547.108215 C242.460876,540.593262 237.335587,532.204102 231.311951,524.349304 z"/>
    <path fill="#243775" opacity="1.000000" stroke="none" d="M344.008728,603.262390 C348.267670,603.859985 352.526581,604.457520 357.964203,605.220520 C332.800049,615.548889 308.268311,616.779297 283.802307,608.348145 C245.673004,595.208557 222.978821,568.184204 215.080841,528.692566 C214.564850,526.112549 214.332321,523.475830 214.380310,520.467163 C215.802475,521.296814 217.021530,522.407104 217.788574,523.771484 C223.388489,533.732544 228.245132,544.190491 234.664917,553.583679 C238.942108,559.841919 245.407501,564.604675 250.964325,570.377625 C251.853165,571.721680 252.480469,573.029297 253.519287,573.680115 C262.306305,579.185059 271.168365,584.570129 280.217346,590.271362 C289.619385,593.709290 298.811920,596.867065 308.248230,600.303223 C317.420593,602.056458 326.337524,603.607727 335.284119,604.963379 C338.307648,605.421570 341.785095,607.282410 344.008728,603.262390 z"/>
  `
};
