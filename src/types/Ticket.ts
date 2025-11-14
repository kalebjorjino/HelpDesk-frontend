// src/types/Ticket.ts

// Tipos auxiliares para los datos enriquecidos
interface BasicAssetInfo {
  id: number;
  // Añade otros campos que envíe el backend, como 'nombre' o 'codigoPatrimonial'
  nombre?: string;
}

interface BasicComponentInfo {
  id: number;
  nombreComponente?: string;
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
export interface TicketPayload { /* ... sin cambios ... */ }
export interface TicketUpdatePayload { /* ... sin cambios ... */ }
export interface TicketFilters { /* ... sin cambios ... */ }
