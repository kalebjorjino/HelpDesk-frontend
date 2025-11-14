import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';

export function useLogin() {
  const authStore = useAuthStore();
  const router = useRouter();

  const credentials = ref({
    email: '',
    password: '',
  });

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const handleLogin = async () => {
    isLoading.value = true;
    error.value = null;

    if (!credentials.value.email || !credentials.value.password) {
        error.value = 'Por favor, ingresa tu email y contraseña.';
        isLoading.value = false;
        return;
    }

    try {
      await authStore.login(credentials.value);
      // Redirigir al dashboard en caso de éxito
      router.push({ name: 'dashboard' }); // Asume que tienes una ruta llamada 'dashboard'
    } catch (err: any) {
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    credentials,
    isLoading,
    error,
    handleLogin,
  };
}
