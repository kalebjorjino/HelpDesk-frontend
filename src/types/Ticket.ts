// src/types/Ticket.ts

// Tipos auxiliares para los datos enriquecidos
export interface BasicAssetInfo {
  id: number;
  nombre?: string;
  tipoEquipo?: string;
  marca?: string;
  modelo?: string;
  codigoPatrimonial?: string;
  ip?: string;
}

export interface BasicComponentInfo {
  id: number;
  nombreComponente?: string;
  codigoPatrimonial?: string;
}

// Tipo para respuesta de equipos filtrados
export interface EquipoResponseDTO {
  id: number;
  codigoPatrimonial: string;
  marca: string;
  modelo: string;
  ip?: string;
}

// Tipos literales
export type EstadoTicket = 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO' | 'CERRADO';
export type PrioridadTicket = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';

// Interfaz principal para el objeto Ticket
export interface Ticket {
  id: number;
  asunto: string;
  descripcion: string;
  estado: EstadoTicket;
  prioridad: PrioridadTicket;
  fechaCreacion: string;
  diagnostico?: string;

  // IDs
  usuarioReportaId: number;
  usuarioAsignadoId: number | null;
  tecnicoAsignadoId?: number | null;
  equipoAfectadoId: number | null;
  componenteId: number | null;

  // --- DATOS ENRIQUECIDOS DEL BACKEND ---
  detallesEquipo?: BasicAssetInfo;
  detallesComponente?: BasicComponentInfo;
  nombreTecnicoAsignado?: string;

  // Propiedades añadidas en el frontend
  usuarioReportaNombre?: string;
}

// Payloads para crear y actualizar
export interface TicketPayload {
  asunto: string;
  descripcion: string;
  estado: EstadoTicket;
  prioridad: PrioridadTicket;
  usuarioReportaId: number;
  usuarioAsignadoId?: number | null;
  tecnicoAsignadoId?: number | null;
  equipoAfectadoId?: number | null;
  componenteId?: number | null;
  diagnostico?: string;
}

export interface TicketUpdatePayload {
  asunto?: string;
  descripcion?: string;
  estado?: EstadoTicket;
  prioridad?: PrioridadTicket;
  usuarioReportaId?: number;
  usuarioAsignadoId?: number | null;
  tecnicoAsignadoId?: number | null;
  equipoAfectadoId?: number | null;
  componenteId?: number | null;
  diagnostico?: string;
}

export interface TicketFilters {
  search?: string;
  estado?: EstadoTicket;
  prioridad?: PrioridadTicket;
  usuarioReportaId?: number;
}
