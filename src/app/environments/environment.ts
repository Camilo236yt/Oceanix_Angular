/**
 * Environment configuration for production
 */
export const environment = {
  production: true,
  apiUrl: '/api/v1', // Usar proxy de nginx para evitar problemas CORS
  backendUrl: 'https://oceanix.space', // URL del backend para callbacks de OAuth
  appDomain: 'oceanix.space',
  enableSubdomainRedirect: true // Habilitar redirección a subdominios en producción
};
