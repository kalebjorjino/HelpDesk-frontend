import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/useUserStore';
import type { User } from '@/types/User';

export function useUserForm(onSuccess?: () => void) {
  const userStore = useUserStore();

  const dialog = ref(false);
  const isEditMode = ref(false);
  const userData = ref<Partial<User>>({});
  const isSubmitting = ref(false);
  const formError = ref<string | null>(null);

  const openCreateForm = () => {
    isEditMode.value = false;
    userData.value = {}; // Reset to empty for creation
    formError.value = null;
    dialog.value = true;
  };

  const openEditForm = async (userId: number) => {
    isEditMode.value = true;
    formError.value = null;
    try {
      const user = await userStore.fetchUserById(userId); // Assumes store has this action
      if (user) {
        userData.value = { ...user }; // Populate form with existing data
        dialog.value = true;
      } else {
        formError.value = `No se pudo encontrar el usuario con ID ${userId}`;
      }
    } catch (error) {
      formError.value = 'Error al cargar los datos del usuario.';
      console.error(error);
    }
  };

  const handleCancel = () => {
    dialog.value = false;
    userData.value = {};
    formError.value = null;
  };

  const handleSubmit = async () => {
    isSubmitting.value = true;
    formError.value = null;

    try {
      if (isEditMode.value) {
        // Update existing user
        const payload = { ...userData.value };
        if (!payload.password || payload.password.trim() === '') {
          delete payload.password; // Don't send empty password
        }
        await userStore.updateUser(payload.id!, payload);
      } else {
        // Create new user
        await userStore.createUser(userData.value as User);
      }

      dialog.value = false;
      onSuccess?.(); // Call the success callback (e.g., refresh the list)

    } catch (error: any) {
      formError.value = error.message || 'Ocurrió un error al guardar el usuario.';
      console.error(error);
    } finally {
      isSubmitting.value = false;
    }
  };

  return {
    dialog,
    isEditMode,
    userData,
    isSubmitting,
    formError,
    openCreateForm,
    openEditForm,
    handleSubmit,
    handleCancel,
  };
}
