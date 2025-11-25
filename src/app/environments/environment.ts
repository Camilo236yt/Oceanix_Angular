/**
 * Environment configuration for production
 */
export const environment = {
  production: true,
  apiUrl: '/api/v1', // Usar proxy de nginx para evitar problemas CORS
  appDomain: 'oceanix.space',
  enableSubdomainRedirect: true // Habilitar redirección a subdominios en producción
};
