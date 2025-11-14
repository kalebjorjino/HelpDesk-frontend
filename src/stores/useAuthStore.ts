import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiClient from '@/utils/apiClient';
import { extractErrorMessage } from '@/utils/errorUtils';

// Tipos de datos
export type UserRole = 'USER' | 'TECHNICIAN' | 'ADMIN';
export interface UserProfile { id: number; nombreCompleto: string; email: string; role: UserRole; }
export interface LoginResponse { token: string; user: UserProfile; }

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('authToken'));
  const currentUser = ref<UserProfile | null>(null);

  const isAuthenticated = computed(() => !!token.value && !!currentUser.value);
  const userName = computed(() => currentUser.value?.nombreCompleto);
  const userRole = computed(() => currentUser.value?.role);
  const userId = computed(() => currentUser.value?.id);

  // --- GETTERS DE ROL ESPECÍFICOS ---
  const isAdmin = computed(() => userRole.value === 'ADMIN');
  const isTechnician = computed(() => userRole.value === 'TECHNICIAN'); // <-- GETTER AÑADIDO
  const isAgentOrAdmin = computed(() => isAdmin.value || isTechnician.value);
  const isClient = computed(() => userRole.value === 'USER');

  async function login(credentials: { email: string; password: string }): Promise<void> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      const { token: newToken, user } = response.data;
      localStorage.setItem('authToken', newToken);
      token.value = newToken;
      currentUser.value = user;
    } catch (err) {
      throw new Error(extractErrorMessage(err, 'Credenciales incorrectas.'));
    }
  }

  function logout(): void {
    token.value = null;
    currentUser.value = null;
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  }

  async function fetchUserProfile(): Promise<void> {
    if (!token.value) return;
    try {
      const response = await apiClient.get<UserProfile>('/auth/profile');
      currentUser.value = response.data;
    } catch (err) {
      console.error('Failed to fetch profile. Interceptor will handle logout if needed.', err);
      throw err;
    }
  }

  return {
    token,
    currentUser,
    isAuthenticated,
    userId,
    userName,
    userRole,
    isAdmin,
    isTechnician, // <-- EXPUESTO AQUÍ
    isAgentOrAdmin,
    isClient,
    login,
    logout,
    fetchUserProfile,
  };
});
