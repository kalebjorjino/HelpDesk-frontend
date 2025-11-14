
export type UserRole = 'USER' | 'TECHNICIAN' | 'ADMIN';

export interface User {
  id: number;
  codigoEmpleado: string; // Coincide con el campo Java
  nombreCompleto: string; // Coincide con el campo Java
  dni: string;
  email: string;
  role: UserRole;
  cargo: string;
  departamento: string;
  unidad: string;
  area: string;
  // Nota: Hemos quitado campos no existentes en tu dominio, como email y role.
  // Si los necesitas, deben ser añadidos a tu entidad Java primero.
}

// Interfaz para el objeto que se envía al crear/actualizar un usuario
export interface UserPayload {
  // Excluimos 'id' ya que el backend lo genera
  codigoEmpleado: string;
  nombreCompleto: string;
  dni: string;
  email: string;
  password?: string;
  role: UserRole;
  cargo: string;
  departamento: string;
  unidad: string;
  area: string;
}
