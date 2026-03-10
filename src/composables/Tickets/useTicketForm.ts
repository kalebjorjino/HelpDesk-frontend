import { ref, computed, watch } from 'vue';
import { useTicketStore } from '@/stores/useTicketStore';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Ticket, TicketUpdatePayload, EstadoTicket } from '@/types/Ticket';

export function useTicketForm(onSuccess?: () => void) {
  const ticketStore = useTicketStore();
  const authStore = useAuthStore();

  const dialog = ref(false);
  const isEditMode = ref(false);
  const ticketData = ref<Partial<Ticket & { tecnicoAsignadoId?: number | null, equipoAfectadoId?: number | null }>>({});
  const isSubmitting = ref(false);
  const formError = ref<string | null>(null);
  const originalStatus = ref<EstadoTicket | null>(null);

  // --- NUEVAS VARIABLES REACTIVAS (Inicializadas correctamente) ---
  const filteredEquipos = ref<any[]>([]); // <-- Inicializado como array vacío
  const isLoadingFilteredEquipos = ref(false);

  const isLocked = computed(() =>
    isEditMode.value && (originalStatus.value === 'RESUELTO' || originalStatus.value === 'CERRADO')
  );

  const fetchFilteredEquipos = async (usuarioId: number | undefined | null) => {
    filteredEquipos.value = [];
    if (!usuarioId) return;

    isLoadingFilteredEquipos.value = true;
    try {
      const response = await ticketStore.fetchEquiposByUsuarioId(usuarioId);
      filteredEquipos.value = response.map(eq => ({
        title: `${eq.marca} ${eq.modelo} (${eq.codigoPatrimonial})`,
        value: eq.id
      }));
    } catch (error) {
      console.error('Error fetching filtered equipos:', error);
    } finally {
      isLoadingFilteredEquipos.value = false;
    }
  };

  const openCreateForm = () => {
    isEditMode.value = false;
    originalStatus.value = null;
    formError.value = null;
    dialog.value = true;
    filteredEquipos.value = [];

    if (authStore.isClient) {
      ticketData.value = { prioridad: 'MEDIA', usuarioReportaId: authStore.userId };
      fetchFilteredEquipos(authStore.userId);
    } else {
      ticketData.value = { prioridad: 'MEDIA' };
    }
  };

  const openEditForm = async (ticketId: number) => {
    isEditMode.value = true;
    formError.value = null;
    try {
      const ticket = await ticketStore.fetchTicketById(ticketId);
      if (ticket) {
        ticketData.value = { ...ticket };
        originalStatus.value = ticket.estado;
        dialog.value = true;
        if (ticket.usuarioReportaId) {
          await fetchFilteredEquipos(ticket.usuarioReportaId);
        }
      } else {
        formError.value = `Ticket with ID ${ticketId} not found`;
      }
    } catch (error) {
      formError.value = 'Failed to load ticket data.';
      console.error(error);
    }
  };

  const handleCancel = () => {
    dialog.value = false;
  };

  const handleSubmit = async () => {
    isSubmitting.value = true;
    formError.value = null;
    try {
      if (isEditMode.value) {
        const payload: Partial<TicketUpdatePayload> = {
          asunto: ticketData.value.asunto,
          descripcion: ticketData.value.descripcion,
          prioridad: ticketData.value.prioridad,
          estado: ticketData.value.estado,
          tecnicoAsignadoId: ticketData.value.tecnicoAsignadoId,
          equipoAfectadoId: ticketData.value.equipoAfectadoId,
          componenteId: ticketData.value.componenteId,
          diagnostico: ticketData.value.diagnostico,
        };
        await ticketStore.updateTicket(ticketData.value.id!, payload);
      } else {
        await ticketStore.createTicket(ticketData.value as Omit<Ticket, 'id'>);
      }
      dialog.value = false;
      onSuccess?.();
    } catch (error: any) {
      formError.value = error.message || 'An error occurred while saving the ticket.';
    } finally {
      isSubmitting.value = false;
    }
  };

  watch(() => ticketData.value.usuarioReportaId, (newVal, oldVal) => {
    if (newVal !== oldVal) {
      fetchFilteredEquipos(newVal);
      ticketData.value.equipoAfectadoId = null;
    }
  });

  return {
    dialog,
    isEditMode,
    isLocked,
    ticketData,
    isSubmitting,
    formError,
    openCreateForm,
    openEditForm,
    handleSubmit,
    handleCancel,
    filteredEquipos, // <-- EXPORTAR CORRECTAMENTE
    isLoadingFilteredEquipos, // <-- EXPORTAR CORRECTAMENTE
  };
}
