
export type UserRole = 'USER' | 'TECHNICIAN' | 'ADMIN';

export interface User {
  id: number;
  codigoEmpleado?: string;
  nombreCompleto: string;
  dni?: string;
  email: string;
  password?: string;
  role: UserRole;
  cargo?: string;
  departamento?: string;
  unidad?: string;
  area?: string;
}

// Interfaz para el objeto que se envía al crear/actualizar un usuario
export interface UserPayload {
  // Requeridos por el backend
  email: string;
  password: string;
  role: UserRole;
  nombreCompleto: string;
  
  // Opcionales
  codigoEmpleado?: string;
  dni?: string;
  cargo?: string;
  departamento?: string;
  unidad?: string;
  area?: string;
}
