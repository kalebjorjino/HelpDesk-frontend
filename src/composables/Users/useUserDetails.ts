import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/useUserStore';
import type { User, UserPayload } from '@/types/User'; // Import User and UserPayload types

export function useUserDetails() {
    // Access route parameters and the user store
    const route = useRoute();
    const userStore = useUserStore();

    // Get the user ID from the URL and convert to number
    const userId = Number(route.params.id);

    // --- Reactive State ---
    const user = ref<User | null>(null); // Holds the full User object fetched from API
    const isLoading = ref(true); // Tracks loading state for fetching details
    const error = ref<string | null>(null); // Holds any error message
    const isEditing = ref(false); // Tracks if an update operation is in progress

    // --- Data Fetching ---
    const fetchUser = async () => {
        isLoading.value = true;
        error.value = null;
        user.value = null; // Reset previous data

        if (!userId || isNaN(userId)) {
            error.value = 'ID de usuario no válido.';
            isLoading.value = false;
            return;
        }

        try {
            // Call the store action to fetch user by ID
            const fetchedUser = await userStore.fetchUserById(userId);
            user.value = fetchedUser;
        } catch (fetchError: any) {
            error.value = fetchError.message || 'Error al cargar los detalles del usuario.';
            console.error("Error fetching user details:", fetchError);
        } finally {
            isLoading.value = false;
        }
    };

    // Load data when the composable is used in a component
    onMounted(fetchUser);

    // --- Helper Function ---
    // Converts the full User object to the UserPayload structure needed for updates
    const getUserPayload = (): UserPayload => {
        if (!user.value) {
            // Return an empty structure if user data isn't loaded
            return {} as UserPayload;
        }
        // Destructure to exclude 'id' and potentially other read-only fields
        const { id, ...payload } = user.value;
        // Password is not included when fetching, so it's naturally excluded here
        return payload as UserPayload;
    };

    // --- Update Logic ---
    // Handles the call to the store's updateUser action
    const handleUpdate = async (updatedUserData: UserPayload) => {
        if (!userId) {
            error.value = "ID de usuario inválido para actualizar.";
            return; // Should not happen if fetch worked, but good practice
        }

        isEditing.value = true;
        error.value = null; // Clear previous errors

        try {
            // Call the store action to update the user
            await userStore.updateUser(userId, updatedUserData);
            // Optionally, refresh the local 'user' ref with the response from updateUser
            // if the backend response might differ slightly from the payload sent
            // user.value = updatedUserResponse;
            // Or just refetch for simplicity if needed:
            await fetchUser(); // Refetch to ensure data consistency
        } catch (updateError: any) {
            error.value = updateError.message || 'Error al actualizar el usuario.';
            console.error("Error updating user:", updateError);
            throw updateError; // Re-throw the error so the component knows it failed
        } finally {
            isEditing.value = false;
        }
    };

    // --- Return Values ---
    // Expose reactive state and functions needed by the view
    return {
        user,          // The fetched user data (reactive)
        isLoading,     // Loading state for fetching
        error,         // Error message
        isEditing,     // Loading state for updating
        getUserPayload, // Helper to format data for the form
        handleUpdate,  // Function to save changes
        refreshUser: fetchUser // Function to manually reload data
    };
}