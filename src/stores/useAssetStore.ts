import { defineStore } from 'pinia';
import apiClient from '@/utils/apiClient';
import type { Asset, AssetPayload } from '@/types/Asset'; // Asume que tienes un AssetPayload
import { extractErrorMessage } from '@/utils/errorUtils';

const basePath = '/equipos';

export const useAssetStore = defineStore('asset', {
  state: () => ({
    assets: [] as Asset[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchAssets() {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get<Asset[]>(basePath);
        this.assets = response.data;
      } catch (err: any) {
        this.error = 'Error al cargar equipos.';
      } finally {
        this.loading = false;
      }
    },

    async fetchAssetsByUserId(userId: number): Promise<Asset[]> {
      this.loading = true;
      this.error = null;
      try {
        // La llamada se hace al servicio de tickets, que a su vez llama al servicio de assets
        const response = await apiClient.get<Asset[]>(`/tickets/equipos-por-usuario/${userId}`);
        return response.data;
      } catch (err: any) {
        this.error = 'Error al cargar equipos filtrados.';
        return [];
      } finally {
        this.loading = false;
      }
    },
    async fetchAssetById(id: number): Promise<Asset> {
      try {
        const response = await apiClient.get<Asset>(`${basePath}/${id}`);
        return response.data;
      } catch (err: any) {
        throw new Error('Error al obtener el equipo.');
      }
    },
    // --- ACCIONES CRUD COMPLETAS ---
    async createAsset(payload: AssetPayload): Promise<Asset> {
      try {
        const response = await apiClient.post<Asset>(basePath, payload);
        this.assets.push(response.data);
        return response.data;
      } catch (err: any) {
        throw new Error(extractErrorMessage(err, 'Fallo al crear el equipo.'));
      }
    },
    async updateAsset(id: number, payload: Partial<AssetPayload>): Promise<Asset> {
      try {
        const response = await apiClient.put<Asset>(`${basePath}/${id}`, payload);
        const index = this.assets.findIndex(a => a.id === id);
        if (index !== -1) {
          this.assets[index] = response.data;
        }
        return response.data;
      } catch (err: any) {
        throw new Error(extractErrorMessage(err, `Error al actualizar el equipo ${id}.`));
      }
    },
  },
});
