export type EstadoEquipo = 'BUENO' | 'REGULAR' | 'MALO' | 'BAJA_PATRIMONIAL';

// Interfaz que refleja la entidad Equipo.java
export interface Asset {
  id: number;
  codigoPatrimonial: string;
  serie: string;
  marca: string;
  modelo: string;
  tipoEquipo?: string;
  ip: string;
  disco: string;
  memoria: string;
  procesador: string;
  departamento: string;
  unidad: string;
  oficina?: string;
  servicio?: string;
  estado: EstadoEquipo;
  usuarioAsignadoId: number | null;
  deviceAsignadoId: number | null; // <-- Nombre corregido
  status?: EstadoEquipo; // Alias para compatibilidad
}

// Payload para crear o actualizar un activo
export interface AssetPayload {
  codigoPatrimonial: string;
  hostname: string;
  serie: string;
  marca: string;
  modelo: string;
  tipoEquipo?: string;
  ip: string;
  disco: string;
  memoria: string;
  procesador: string;

  departamento: string;
  unidad: string;
  oficina?: string;
  servicio?: string;
  estado: EstadoEquipo;

  fechaCompra?: string;      // Formato YYYY-MM-DD
  fechaFinGarantia?: string; // Formato YYYY-MM-DD

  usuarioAsignadoId?: number | null;
  deviceAsignadoId?: number | null; // <-- Nombre corregido
}
