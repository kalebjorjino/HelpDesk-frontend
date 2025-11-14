// src/types/Device.ts (CORREGIDO)

export interface Device {
  id: number;
  codigoPatrimonial: string; // Coincide con el campo Java
  nombreComponente: string; // Coincide con el campo Java
  especificaciones: string;
  marca: string;
  modelo: string;
  serie: string;
}

// Interfaz para el objeto que se envía al crear/actualizar un componente
export interface DevicePayload {
  // Excluimos 'id' ya que el backend lo genera
  codigoPatrimonial: string; // Coincide con el campo Java
  nombreComponente: string; // Coincide con el campo Java
  especificaciones: string;
  marca: string;
  modelo: string;
  serie: string;
}
