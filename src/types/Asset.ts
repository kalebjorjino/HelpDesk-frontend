export type EstadoEquipo = 'NUEVO' | 'OPERATIVO' | 'EN_REPARACION' | 'DE_BAJA';

// Interfaz que refleja la entidad Equipo.java
export interface Asset {
  id: number;
  codigoPatrimonial: string;
  serie: string;
  marca: string;
  modelo: string;
  ip: string;
  departamento: string;
  unidad: string;
  estado: EstadoEquipo;
  usuarioAsignadoId: number | null;
  deviceAsignadoId: number | null; // <-- Nombre corregido
}

// Payload para crear o actualizar un activo
export interface AssetPayload {
  codigoPatrimonial: string;
  serie: string;
  marca: string;
  modelo: string;
  ip: string;
  departamento: string;
  unidad: string;
  estado: EstadoEquipo;
  usuarioAsignadoId?: number | null;
  deviceAsignadoId?: number | null; // <-- Nombre corregido
}
