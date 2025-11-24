export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  empresa?: string;
}

export interface LoginClienteRequest {
  googleToken: string;
}

export interface LoginClienteResponse {
  id: string;
  email: string;
  name: string;
  lastName: string;
  token: string;
  userType?: string;
  message?: string;
}
