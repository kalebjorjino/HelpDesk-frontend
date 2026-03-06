import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/utils/apiClient';
import type { User, UserPayload, UserRole } from '@/types/User';
import { extractErrorMessage } from '@/utils/errorUtils';

export interface UserFilters {
    search?: string;
    role?: UserRole;
}

export const useUserStore = defineStore('user', () => {
    const users = ref<User[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    async function fetchUsers(filters: UserFilters = {}) {
        loading.value = true;
        error.value = null;
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.role) params.append('role', filters.role);

            const queryString = params.toString();
            const url = `/usuarios${queryString ? '?' + queryString : ''}`;

            const response = await apiClient.get<User[]>(url);
            users.value = response.data;
        } catch (err: any) {
            error.value = extractErrorMessage(err, 'Error al cargar usuarios.');
        } finally {
            loading.value = false;
        }
    }

    async function fetchUserById(id: number): Promise<User> {
        try {
            const response = await apiClient.get<User>(`/usuarios/${id}`);
            return response.data;
        } catch (err: any) {
            throw new Error(extractErrorMessage(err, `Error al obtener el usuario ${id}.`));
        }
    }

    async function createUser(payload: UserPayload): Promise<User> {
        try {
            const response = await apiClient.post<User>('/auth/register', payload);
            users.value.push(response.data);
            return response.data;
        } catch (err: any) {
            throw new Error(extractErrorMessage(err, 'Fallo al crear el usuario.'));
        }
    }

    async function updateUser(id: number, payload: Partial<UserPayload>): Promise<User> {
        try {
            const response = await apiClient.put<User>(`/usuarios/${id}`, payload);
            const index = users.value.findIndex(u => u.id === id);
            if (index !== -1) {
                users.value[index] = response.data;
            }
            return response.data;
        } catch (err: any) {
            throw new Error(extractErrorMessage(err, `Error al actualizar el usuario ${id}.`));
        }
    }

    // --- ACCIÓN DE ELIMINAR AÑADIDA ---
    async function deleteUser(id: number): Promise<void> {
        try {
            await apiClient.delete(`/usuarios/${id}`);
            users.value = users.value.filter(u => u.id !== id);
        } catch (err: any) {
            throw new Error(extractErrorMessage(err, `Error al eliminar el usuario ${id}.`));
        }
    }

    return {
        users,
        loading,
        error,
        fetchUsers,
        fetchUserById,
        createUser,
        updateUser,
        deleteUser, // <-- EXPORTAR
    };
});
