import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useTicketStore } from '@/stores/useTicketStore';
import { useUserStore } from '@/stores/useUserStore';
import { useAuthStore } from '@/stores/useAuthStore';

export function useDashboardData() {
    const ticketStore = useTicketStore();
    const userStore = useUserStore();
    const authStore = useAuthStore();

    const { tickets } = storeToRefs(ticketStore);
    const { users } = storeToRefs(userStore);

    const isLoading = ref(true);
    const error = ref<string | null>(null);

    const loadDashboardData = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            let fetchTicketPromise;
            if (authStore.isAdmin) {
                fetchTicketPromise = ticketStore.fetchTickets();
            } else if (authStore.isTechnician) {
                fetchTicketPromise = ticketStore.fetchAssignedTickets();
            } else {
                fetchTicketPromise = ticketStore.fetchMyTickets();
            }

            // CORRECCIÓN: Eliminar la llamada a fetchClosedTicketsLast24h
            await Promise.all([
                fetchTicketPromise,
                userStore.fetchUsers(),
            ]);

        } catch (err: any) {
            error.value = "Error al cargar datos del dashboard.";
            console.error("Dashboard data fetch error:", err);
        } finally {
            isLoading.value = false;
        }
    };

    onMounted(loadDashboardData);

    const openTicketsCount = computed(() =>
        tickets.value.filter(t => t.estado === 'PENDIENTE' || t.estado === 'EN_PROGRESO').length
    );

    const highPriorityTicketsCount = computed(() =>
        tickets.value.filter(
            t => (t.prioridad === 'ALTA' || t.prioridad === 'URGENTE') && (t.estado === 'PENDIENTE' || t.estado === 'EN_PROGRESO')
        ).length
    );

    const pendingTasks = computed(() => {
        const tasks = [];
        if (authStore.isAgentOrAdmin) {
            const unassignedTickets = tickets.value.filter(
                t => !t.tecnicoAsignadoId && (t.estado === 'PENDIENTE' || t.estado === 'EN_PROGRESO')
            ).length;

            if (unassignedTickets > 0) {
                tasks.push({
                    id: 1,
                    text: `Asignar ${unassignedTickets} ticket(s) sin técnico`,
                    icon: 'mdi-account-alert',
                    action: { name: 'tickets-list' }
                });
            }
        }
        return tasks;
    });

    const ticketStatusChartData = computed(() => {
        const statusCounts = tickets.value.reduce((acc, ticket) => {
            acc[ticket.estado] = (acc[ticket.estado] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const labels = ['PENDIENTE', 'EN_PROGRESO', 'RESUELTO', 'CERRADO'];
        const data = labels.map(status => statusCounts[status] || 0);
        const backgroundColors = ['#2196F3', '#FFC107', '#4CAF50', '#9E9E9E'];
        return { labels, datasets: [{ backgroundColor: backgroundColors, data }] };
    });

    // --- LÓGICA COMPUTADA PARA CERRADOS ---
    const closedLast24h = computed(() => {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

        return tickets.value.filter(ticket => {
            const isClosed = ticket.estado === 'CERRADO' || ticket.estado === 'RESUELTO';
            if (!isClosed) return false;

            // Si el backend no envía la fecha, no se puede calcular.
            if (!ticket.fechaActualizacion) return false;

            const updateDate = new Date(ticket.fechaActualizacion);
            return updateDate > twentyFourHoursAgo;
        }).length;
    });

    const averageResponseTime = ref('N/A');
    const totalUsersCount = computed(() => users.value.length);

    return {
        isLoading,
        error,
        openTicketsCount,
        highPriorityTicketsCount,
        averageResponseTime,
        closedLast24h, // <-- Ahora es reactivo y calculado
        pendingTasks,
        ticketStatusChartData,
        totalUsersCount,
        refreshDashboard: loadDashboardData,
    };
}
