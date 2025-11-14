import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/utils/apiClient';
import type {
  Ticket,
  TicketPayload,
  TicketUpdatePayload,
  EstadoTicket,
  PrioridadTicket,
} from '@/types/Ticket';
import { extractErrorMessage } from '@/utils/errorUtils';

export interface TicketFilters {
  search?: string;
  estado?: EstadoTicket;
  prioridad?: PrioridadTicket;
  usuarioReportaId?: number;
}

export const useTicketStore = defineStore('ticket', () => {
  // --- STATE ---
  const tickets = ref<Ticket[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // --- ACTIONS ---

  // 🔹 Obtiene todos los tickets con filtros (para administradores)
  async function fetchTickets(filters: TicketFilters = {}) {
    loading.value = true;
    error.value = null;
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value != null && value !== '') {
          params.append(key, String(value));
        }
      });
      const queryString = params.toString();
      const url = `/tickets${queryString ? '?' + queryString : ''}`;
      const response = await apiClient.get<Ticket[]>(url);
      tickets.value = response.data;
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Error al cargar los tickets.');
    } finally {
      loading.value = false;
    }
  }

  // 🔹 Obtiene los tickets del usuario logueado (para clientes)
  async function fetchMyTickets() {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.get<Ticket[]>('/tickets/my-tickets');
      tickets.value = response.data;
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Error al cargar mis tickets.');
    } finally {
      loading.value = false;
    }
  }

  // 🔹 Obtiene los tickets asignados al técnico logueado
  async function fetchAssignedTickets() {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.get<Ticket[]>('/tickets/assigned-to-me');
      tickets.value = response.data;
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Error al cargar los tickets asignados.');
    } finally {
      loading.value = false;
    }
  }

  // ✅ CORREGIDO: Obtiene el conteo de tickets cerrados en las últimas 24h (para dashboard)
  async function fetchClosedTicketsLast24h(): Promise<number> {
    try {
      // El backend ya cuenta los tickets cerrados en las últimas 24 horas.
      const response = await apiClient.get<number>('/tickets/estadisticas/cerrados-24h');
      return response.data;
    } catch (err: any) {
      console.error('Error al obtener tickets cerrados de las últimas 24h:', err);
      return 0; // Retorna 0 en caso de error para no bloquear el dashboard
    }
  }

  // 🔹 Crea un nuevo ticket
  async function createTicket(payload: Omit<Ticket, 'id'>): Promise<Ticket> {
    try {
      const response = await apiClient.post<Ticket>('/tickets', payload);
      return response.data;
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Fallo al crear el ticket.'));
    }
  }

  // 🔹 Obtiene los detalles de un solo ticket por su ID
  async function fetchTicketById(id: number): Promise<Ticket> {
    try {
      const response = await apiClient.get<Ticket>(`/tickets/${id}`);
      return response.data;
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, `Error al obtener el ticket ${id}.`));
    }
  }

  // 🔹 Actualiza un ticket existente
  async function updateTicket(id: number, payload: Partial<TicketUpdatePayload>): Promise<Ticket> {
    try {
      const response = await apiClient.put<Ticket>(`/tickets/${id}`, payload);
      const index = tickets.value.findIndex(t => t.id === id);
      if (index !== -1) {
        tickets.value[index] = response.data;
      }
      return response.data;
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, `Error al actualizar el ticket ${id}.`));
    }
  }

  // --- RETURN ---
  return {
    tickets,
    loading,
    error,
    fetchTickets,
    fetchMyTickets,
    fetchAssignedTickets,
    fetchClosedTicketsLast24h,
    createTicket,
    fetchTicketById,
    updateTicket,
  };
});
