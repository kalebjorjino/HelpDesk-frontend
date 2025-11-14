import { ref, computed } from 'vue';
import { useTicketStore } from '@/stores/useTicketStore';
import { useAssetStore } from '@/stores/useAssetStore';
import { useDeviceStore } from '@/stores/useDeviceStore';
import type { Ticket, TicketUpdatePayload, EstadoTicket } from '@/types/Ticket';

export function useTicketForm(onSuccess?: () => void) {
  const ticketStore = useTicketStore();
  const assetStore = useAssetStore();
  const deviceStore = useDeviceStore();

  const dialog = ref(false);
  const isEditMode = ref(false);
  const ticketData = ref<Partial<Ticket & { tecnicoAsignadoId?: number | null }>>({});
  const isSubmitting = ref(false);
  const formError = ref<string | null>(null);
  const originalStatus = ref<EstadoTicket | null>(null);

  // CORRECCIÓN: Bloqueo solo si el estado original es CERRADO
  const isLocked = computed(() =>
    isEditMode.value && (originalStatus.value === 'CERRADO')
  );

  const openCreateForm = () => {
    isEditMode.value = false;
    originalStatus.value = null;
    ticketData.value = { prioridad: 'MEDIA' };
    formError.value = null;
    dialog.value = true;
  };

  const openEditForm = async (ticketId: number) => {
    isEditMode.value = true;
    formError.value = null;
    try {
      const ticket = await ticketStore.fetchTicketById(ticketId);

      if (ticket.equipoAfectadoId && !ticket.detallesEquipo) {
        const assetDetails = await assetStore.fetchAssetById(ticket.equipoAfectadoId);
        ticket.detallesEquipo = assetDetails;
      }

      if (ticket.componenteId && !ticket.detallesComponente) {
        const deviceDetails = await deviceStore.fetchDeviceById(ticket.componenteId);
        ticket.detallesComponente = deviceDetails;
      }

      if (ticket) {
        ticketData.value = { ...ticket };
        originalStatus.value = ticket.estado;
        dialog.value = true;
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
    // ELIMINADO: Se quitó la validación de isLocked.value aquí, ya que el backend la maneja.

    isSubmitting.value = true;
    formError.value = null;
    try {
      if (isEditMode.value) {
        // CORRECCIÓN: Se incluye el campo diagnostico en el payload
        const payload: Partial<TicketUpdatePayload> = {
          asunto: ticketData.value.asunto,
          descripcion: ticketData.value.descripcion,
          prioridad: ticketData.value.prioridad,
          estado: ticketData.value.estado,
          tecnicoAsignadoId: ticketData.value.tecnicoAsignadoId,
          equipoAfectadoId: ticketData.value.equipoAfectadoId,
          componenteId: ticketData.value.componenteId,
          diagnostico: ticketData.value.diagnostico, // <-- AÑADIDO
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
  };
}
