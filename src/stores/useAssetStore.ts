import { defineStore } from 'pinia';
import apiClient from '@/utils/apiClient';
import type { Asset, AssetPayload } from '@/types/Asset';
import { extractErrorMessage } from '@/utils/errorUtils';

const basePath = '/equipos';

export const useAssetStore = defineStore('asset', {
  state: () => ({
    assets: [] as Asset[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchAssets(userId?: number) {
      this.loading = true;
      this.error = null;
      try {
        let url = basePath;
        if (userId) {
          url += `?usuarioId=${userId}`;
        }
        const response = await apiClient.get<Asset[]>(url);
        this.assets = response.data;
      } catch (err: any) {
        this.error = 'Error al cargar equipos.';
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
    // --- ACCIÓN DE ELIMINAR AÑADIDA ---
    async deleteAsset(id: number): Promise<void> {
      try {
        await apiClient.delete(`${basePath}/${id}`);
        this.assets = this.assets.filter(a => a.id !== id);
      } catch (err: any) {
        throw new Error(extractErrorMessage(err, `Error al eliminar el equipo ${id}.`));
      }
    },
  },
});
