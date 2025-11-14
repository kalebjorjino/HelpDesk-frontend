// src/composables/Tickets/useMyTicketDetails.ts
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useTicketStore } from '@/stores/useTicketStore';
import { useAuthStore } from '@/stores/useAuthStore'; // To check client ID
import type { Ticket } from '@/types/Ticket';

export function useMyTicketDetails() {
    const route = useRoute();
    const ticketStore = useTicketStore();
    const authStore = useAuthStore();

    // Get the ticket ID from the URL parameter and convert it to a number
    const ticketId = Number(route.params.id);

    // Reactive state variables
    const ticket = ref<Ticket | null>(null); // Holds the fetched ticket data
    const isLoading = ref(true); // Tracks if data is being loaded
    const error = ref<string | null>(null); // Stores any error message

    // Function to fetch the ticket details from the store
    const fetchMyTicketDetails = async () => {
        isLoading.value = true;
        error.value = null;
        ticket.value = null; // Reset ticket data before fetching

        // Validate ticketId
        if (!ticketId || isNaN(ticketId)) {
            error.value = 'ID de ticket inválido.';
            isLoading.value = false;
            return;
        }

        // Validate if user ID is available
        if (!authStore.userId) {
             error.value = 'No se pudo verificar la identidad del usuario.';
             isLoading.value = false;
             return;
        }

        try {
            // Call the store action to get the ticket by ID
            const fetchedTicket = await ticketStore.fetchTicketById(ticketId);

            // **Security Check:** Verify the ticket belongs to the logged-in client
            if (fetchedTicket.usuarioReportaId !== authStore.userId) {
                // Set error if the client doesn't own this ticket
                error.value = 'No tienes permiso para ver este ticket.';
                console.warn(`Client ${authStore.userId} attempted to access ticket ${ticketId} owned by ${fetchedTicket.usuarioReportaId}`);
            } else {
                // Store the fetched ticket data if authorized
                ticket.value = fetchedTicket;
            }
        } catch (err: any) {
            // Store error message if fetching fails
            error.value = err.message || 'Error al cargar los detalles del ticket.';
            console.error("Error fetching ticket details:", err);
        } finally {
            // Always set loading to false when fetching finishes (success or error)
            isLoading.value = false;
        }
    };

    // Placeholder function for adding a comment
    // In a real app, this would call a store action which calls the backend API
    const addComment = async (commentText: string) => {
        if (!ticket.value || !commentText.trim()) {
            console.warn("Cannot add empty comment or no ticket loaded.");
            return; // Don't proceed if no ticket or empty comment
        }
        console.log(`Simulating adding comment: "${commentText}" to Ticket ID: ${ticket.value.id}`);
        alert(`Implementar API para añadir comentario: "${commentText}" al Ticket ID: ${ticket.value.id}`);
        // Example of real implementation:
        // try {
        //   await ticketStore.addCommentToTicket(ticket.value.id, commentText);
        //   await fetchMyTicketDetails(); // Refresh details to show the new comment
        // } catch(err: any) {
        //   console.error("Failed to add comment via store:", err);
        //   // Optionally set an error state to show in the UI
        //   error.value = "No se pudo añadir el comentario.";
        // }
    };

    // Fetch the ticket details when the component using this composable mounts
    onMounted(fetchMyTicketDetails);

    // Expose the reactive state and actions to the component
    return {
        ticket,             // The fetched ticket data (or null)
        isLoading,          // Loading state flag
        error,              // Error message (or null)
        addComment,         // Function to add a comment
        refreshDetails: fetchMyTicketDetails, // Function to manually reload details
    };
}
