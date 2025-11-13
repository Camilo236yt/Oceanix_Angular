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
  token: string;
  cliente: Cliente;
}
