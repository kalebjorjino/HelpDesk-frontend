import { ref, onMounted, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useTicketStore, type TicketFilters } from '@/stores/useTicketStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUserOptions } from '@/composables/Users/useUserOptions';
// La importación de useAssetOptions se elimina, ya que la lógica de carga de equipos ahora reside en TicketsListView.vue
import { useDeviceOptions } from '@/composables/Devices/useDeviceOptions';
import type { EstadoTicket, PrioridadTicket } from '@/types/Ticket';

export function useTicketsView() {
    const ticketStore = useTicketStore();
    const authStore = useAuthStore();

    const { allUserOptions, fetchUsers } = useUserOptions();
    // La lógica de obtención de opciones de equipos se ha movido a TicketsListView.vue
    const { deviceSelectOptions } = useDeviceOptions(); // fetchDevices se llama desde TicketsListView

    const { tickets: rawTickets, loading, error } = storeToRefs(ticketStore);
    const { isAdmin, isTechnician } = storeToRefs(authStore);

    const filters = ref<TicketFilters>({ /* ... */ });

    // --- LÓGICA DE HEADERS RESTAURADA ---
    const headers = computed(() => {
        const base = [
            { title: 'Asunto', align: 'start', key: 'asunto' },
            { title: 'Prioridad', key: 'prioridad', width: '120px' },
            { title: 'Estado', key: 'estado', width: '120px' },
            { title: 'Fecha Creación', key: 'fechaCreacion' },
            { title: 'Acciones', key: 'actions', sortable: false, align: 'center', width: '100px' },
        ];

        if (authStore.isAgentOrAdmin) {
            base.splice(3, 0, { title: 'Reportado por', key: 'nombreUsuarioReporta' });
        }

        return base;
    });

    const tickets = computed(() => {
        if (allUserOptions.value.length === 0) {
            return rawTickets.value;
        }

        return rawTickets.value.map(ticket => {
            const reportingUser = allUserOptions.value.find(u => u.value === ticket.usuarioReportaId);
            const assignedTechnician = allUserOptions.value.find(u => u.value === ticket.tecnicoAsignadoId);
            const affectedAsset = ticket.detallesEquipo ? { title: `${ticket.detallesEquipo.tipoEquipo} - ${ticket.detallesEquipo.marca} (${ticket.detallesEquipo.codigoPatrimonial})` } : { title: 'N/A' };
            const affectedDevice = ticket.detallesComponente ? { title: `${ticket.detallesComponente.nombreComponente} (${ticket.detallesComponente.codigoPatrimonial})` } : { title: 'N/A' };

            return {
                ...ticket,
                nombreUsuarioReporta: reportingUser ? reportingUser.title : 'N/A',
                nombreTecnicoAsignado: assignedTechnician ? assignedTechnician.title : 'Sin asignar',
                detallesEquipo: affectedAsset.title,
                detallesComponente: affectedDevice.title,
            };
        });
    });

    const loadTicketsByRole = () => {
        if (isTechnician.value) {
            ticketStore.fetchAssignedTickets();
        } else if (isAdmin.value) {
            ticketStore.fetchTickets(filters.value);
        } else {
            ticketStore.tickets = [];
        }
    };

    onMounted(() => {
        fetchUsers();
        // fetchAssets(); // Llamada eliminada, se gestiona en TicketsListView
        // fetchDevices(); // Llamada eliminada, se gestiona en TicketsListView
        loadTicketsByRole();
    });

    const refreshTickets = () => {
        fetchUsers();
        // fetchAssets(); // Llamada eliminada, se gestiona en TicketsListView
        // fetchDevices(); // Llamada eliminada, se gestiona en TicketsListView
        loadTicketsByRole();
    };

    watch(filters, () => {
        if (isAdmin.value) {
            loadTicketsByRole();
        }
    }, { deep: true });

    const priorityOptions: PrioridadTicket[] = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'];
    const statusOptions: EstadoTicket[] = ['PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'CERRADO'];

    return {
        tickets,
        headers, // <-- Ahora se devuelve la propiedad
        isLoading: loading,
        fetchError: error,
        filters,
        refreshTickets,
        priorityOptions,
        statusOptions,
    };
}
