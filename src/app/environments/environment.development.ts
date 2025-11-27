/**
 * Environment configuration for development
 */
export const environment = {
  production: false,
  apiUrl: '/api/v1', // Usando proxy para evitar CORS en desarrollo
  backendUrl: 'https://oceanix.space', // URL del backend para callbacks de OAuth (Usamos PROD porque no corres backend local)
  appDomain: 'oceanix.space',
  enableSubdomainRedirect: false // Desactivar redirección a subdominios en desarrollo
};
