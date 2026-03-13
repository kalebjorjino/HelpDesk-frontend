import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/utils/apiClient';
import type { Ticket, TicketPayload, TicketUpdatePayload, EstadoTicket, PrioridadTicket, EquipoResponseDTO } from '@/types/Ticket';
import { extractErrorMessage } from '@/utils/errorUtils';

export interface TicketFilters {
  search?: string;
  estado?: EstadoTicket;
  prioridad?: PrioridadTicket;
  usuarioReportaId?: number;
}

export const useTicketStore = defineStore('ticket', () => {
  const tickets = ref<Ticket[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

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

  async function createTicket(payload: Omit<Ticket, 'id'>): Promise<Ticket> {
    try {
      const response = await apiClient.post<Ticket>('/tickets', payload);
      return response.data;
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Fallo al crear el ticket.'));
    }
  }

  async function fetchTicketById(id: number): Promise<Ticket> {
    try {
      const response = await apiClient.get<Ticket>(`/tickets/${id}`);
      return response.data;
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, `Error al obtener el ticket ${id}.`));
    }
  }

  async function updateTicket(id: number, payload: Partial<TicketUpdatePayload>): Promise<Ticket> {
    try {
      await apiClient.put<Ticket>(`/tickets/${id}`, payload);
      const updatedTicket = await fetchTicketById(id);
      const index = tickets.value.findIndex(t => t.id === id);
      if (index !== -1) {
        tickets.value[index] = updatedTicket;
      }
      return updatedTicket;
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, `Error al actualizar el ticket ${id}.`));
    }
  }

  async function fetchEquiposByUsuarioId(usuarioId: number): Promise<EquipoResponseDTO[]> {
    try {
      const response = await apiClient.get<EquipoResponseDTO[]>(`/equipos?usuarioId=${usuarioId}`);
      return response.data;
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, `Error al cargar equipos para el usuario ${usuarioId}.`));
    }
  }

  // --- ACCIÓN DE ELIMINAR AÑADIDA ---
  async function deleteTicket(id: number): Promise<void> {
    try {
      await apiClient.delete(`/tickets/${id}`);
      tickets.value = tickets.value.filter(t => t.id !== id);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, `Error al eliminar el ticket ${id}.`));
    }
  }


  async function fetchTicketsByAssetId(assetId: number) {
    const response = await apiClient.get(`/tickets/equipo/${assetId}/historial`);
    return response.data;
  }

  async function fetchTicketCountsByAsset() {
    const response = await apiClient.get<Record<number, number>>('/tickets/estadisticas/conteo-por-equipo');
    return response.data; 
  }

  return {
    tickets,
    loading,
    error,
    fetchTickets,
    fetchMyTickets,
    fetchAssignedTickets,
    createTicket,
    fetchTicketById,
    updateTicket,
    fetchEquiposByUsuarioId,
    deleteTicket,
    fetchTicketsByAssetId,
    fetchTicketCountsByAsset,
  };
});
