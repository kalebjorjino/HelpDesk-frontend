import type { EstadoTicket } from '@/types/Ticket';

export const getStatusColor = (estado: EstadoTicket) => {
  if (estado === 'PENDIENTE') return 'red-darken-1';
  if (estado === 'EN_PROCESO') return 'orange-darken-1';
  if (estado === 'RESUELTO') return 'blue-darken-1';
  if (estado === 'CERRADO') return 'green-darken-1';
  return 'grey';
};
