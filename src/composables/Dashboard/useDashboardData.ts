import { ref, onMounted, computed } from 'vue';
import { useTicketStore } from '@/stores/useTicketStore';
import { useUserStore } from '@/stores/useUserStore';
import type { Ticket } from '@/types/Ticket'; // Make sure this path is correct

export function useDashboardData() {
    const ticketStore = useTicketStore();
    const userStore = useUserStore(); // Assuming you need user counts or info

    const isLoading = ref(true); // Tracks loading state
    const error = ref<string | null>(null); // Stores potential errors

    // --- Data Fetching ---
    const loadDashboardData = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            // Fetch tickets if the store is empty (or force refresh if needed)
            // A dedicated backend endpoint for stats would be more efficient later
            if (ticketStore.tickets.length === 0) {
                console.log("Dashboard: Fetching tickets...");
                await ticketStore.fetchTickets();
            }

            // Fetch closed tickets count for the last 24h
            closedLast24h.value = await ticketStore.fetchClosedTicketsLast24h();
            // Fetch users if needed (e.g., for agent counts)
             if (userStore.users.length === 0) {
                console.log("Dashboard: Fetching users...");
                await userStore.fetchUsers();
             }
             console.log("Dashboard: Data loading complete.");

        } catch (err: any) {
            error.value = "Error al cargar datos del dashboard. Verifique los servicios.";
            console.error("Dashboard data fetch error:", err);
        } finally {
            isLoading.value = false;
        }
    };

    // Load data when the composable is first used in a component
    onMounted(loadDashboardData);

    // --- Calculated Metrics (Computed Properties) ---

    // Count tickets that are 'PENDIENTE' or 'EN_PROCESO'
    const openTicketsCount = computed(() => {
        return ticketStore.tickets.filter(
            t => t.estado === 'PENDIENTE' || t.estado === 'EN_PROCESO'
        ).length;
    });

    // Count open tickets with high priority
    const highPriorityTicketsCount = computed(() => {
        return ticketStore.tickets.filter(
            t => (t.prioridad === 'ALTA' || t.prioridad === 'URGENTE') &&
                 (t.estado === 'PENDIENTE' || t.estado === 'EN_PROCESO')
        ).length;
    });

    // Placeholder: Average response time needs backend calculation
    const averageResponseTime = ref('N/A'); // Use 'N/A' until calculated

    // Closed tickets in last 24h
    const closedLast24h = ref(0);

    // Placeholder: Pending tasks would likely come from specific backend logic or calculated rules
    const pendingTasks = ref([
        { id: 1, text: 'Asignar tickets sin agente', icon: 'mdi-account-alert' },
        { id: 2, text: 'Revisar tickets antiguos (> 7 días)', icon: 'mdi-clock-alert' },
    ]);

    // Example: Total number of users registered (if userStore is used)
    const totalUsersCount = computed(() => userStore.users.length);

    // --- Return values ---
    // Expose reactive state and functions to the component
    return {
        isLoading,
        error,
        openTicketsCount,
        highPriorityTicketsCount,
        averageResponseTime, // Placeholder
        closedLast24h,       // Placeholder
        pendingTasks,      // Placeholder
        totalUsersCount,     // Example
        refreshDashboard: loadDashboardData, // Function to manually reload data
    };
}
