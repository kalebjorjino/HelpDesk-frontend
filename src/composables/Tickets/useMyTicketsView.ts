import { ref, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useTicketStore } from '@/stores/useTicketStore';
import type { EstadoTicket, PrioridadTicket } from '@/types/Ticket';

// Este composable ahora es mucho más simple y seguro.
export function useMyTicketsView() {
    const ticketStore = useTicketStore();
    const { tickets, loading, error } = storeToRefs(ticketStore);

    // Los filtros de UI ya no necesitan preocuparse por el ID de usuario.
    const filters = ref({
        search: '',
        estado: undefined,
        prioridad: undefined,
    });

    // La función ahora simplemente llama a la acción segura del store.
    const fetchMyTickets = () => {
        // CORRECCIÓN: Llama a la nueva acción `fetchMyTickets`.
        ticketStore.fetchMyTickets();
    };

    // Carga inicial de datos.
    onMounted(fetchMyTickets);

    // El observador para los filtros de la UI ya no es necesario aquí,
    // porque la nueva acción `fetchMyTickets` no acepta filtros de UI.
    // Si se quisiera filtrar del lado del cliente, se haría con un `computed`.
    // Por simplicidad, lo eliminamos por ahora.

    // Función de refresco manual.
    const refreshTickets = () => {
        fetchMyTickets();
    };

    const priorityOptions: PrioridadTicket[] = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'];
    const statusOptions: EstadoTicket[] = ['PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'CERRADO'];

    return {
        tickets,
        isLoading: loading,
        fetchError: error,
        filters, // Se mantiene para la UI, aunque no se usen para la llamada a la API.
        refreshTickets,
        priorityOptions,
        statusOptions,
    };
}
