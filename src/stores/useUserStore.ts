import { defineStore } from 'pinia';
import apiClient from '@/utils/apiClient'; // <-- CORRECCIÓN: Importar el cliente único
import type { User, UserPayload } from '@/types/User';
import { extractErrorMessage } from '@/utils/errorUtils';

interface UserState {
    users: User[];
    loading: boolean;
    error: string | null;
}

const basePath = '/usuarios'; // La baseURL ya contiene /api

export interface UserFilters {
    search?: string;
    role?: string;
}

export const useUserStore = defineStore('user', {
    state: (): UserState => ({
        users: [],
        loading: false,
        error: null,
    }),

    actions: {
        async fetchUsers(filters: UserFilters = {}) {
            this.loading = true;
            this.error = null;
            try {
                const params = new URLSearchParams(
                    Object.entries(filters)
                        .filter(([, value]) => value != null && value !== '')
                        .reduce((acc, [key, value]) => ({ ...acc, [key]: String(value) }), {})
                ).toString();

                const url = `${basePath}${params ? '?' + params : ''}`;
                const response = await apiClient.get<User[]>(url); // <-- CORRECCIÓN: Usar apiClient
                this.users = response.data;
            } catch (err: any) {
                this.error = extractErrorMessage(err, 'Error al cargar usuarios.');
            } finally {
                this.loading = false;
            }
        },

        async createUser(payload: UserPayload): Promise<User> {
            try {
                const response = await apiClient.post<User>(basePath, payload); // <-- CORRECCIÓN: Usar apiClient
                this.users.push(response.data);
                return response.data;
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, 'Fallo al crear el usuario.');
                this.error = errorMessage;
                throw new Error(errorMessage);
            }
        },

        async fetchUserById(id: number): Promise<User> {
            try {
                const response = await apiClient.get<User>(`${basePath}/${id}`); // <-- CORRECCIÓN: Usar apiClient
                return response.data;
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, `Error al obtener el usuario ${id}.`);
                this.error = errorMessage;
                throw new Error(errorMessage);
            }
        },

        async updateUser(id: number, payload: UserPayload): Promise<User> {
            try {
                const response = await apiClient.put<User>(`${basePath}/${id}`, payload); // <-- CORRECCIÓN: Usar apiClient
                const index = this.users.findIndex(u => u.id === id);
                if (index !== -1) {
                    this.users[index] = response.data;
                }
                return response.data;
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, `Error al actualizar el usuario ${id}.`);
                this.error = errorMessage;
                throw new Error(errorMessage);
            }
        },

        async deleteUser(id: number): Promise<void> {
            try {
                await apiClient.delete(`${basePath}/${id}`); // <-- CORRECCIÓN: Usar apiClient
                this.users = this.users.filter(u => u.id !== id);
            } catch (err: any) {
                const errorMessage = extractErrorMessage(err, `Error al eliminar el usuario ${id}.`);
                this.error = errorMessage;
                throw new Error(errorMessage);
            }
        }
    }
});
