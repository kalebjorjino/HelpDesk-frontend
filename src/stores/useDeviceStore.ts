import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/utils/apiClient';
import type { Device, DevicePayload } from '@/types/Device';
import { extractErrorMessage } from '@/utils/errorUtils';

const basePath = '/dispositivos';

export const useDeviceStore = defineStore('device', () => {
  // --- STATE ---
  const devices = ref<Device[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // --- ACTIONS ---

  async function fetchDevices() {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.get<Device[]>(basePath);
      devices.value = response.data;
    } catch (err: any) {
      error.value = extractErrorMessage(err, 'Error al cargar dispositivos.');
    } finally {
      loading.value = false;
    }
  }

  async function fetchDeviceById(id: number): Promise<Device> {
    try {
      const response = await apiClient.get<Device>(`${basePath}/${id}`);
      return response.data;
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Error al obtener el dispositivo.'));
    }
  }

  async function createDevice(payload: DevicePayload): Promise<Device> {
    try {
      const response = await apiClient.post<Device>(basePath, payload);
      devices.value.push(response.data);
      return response.data;
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, 'Fallo al crear el dispositivo.'));
    }
  }

  async function updateDevice(id: number, payload: Partial<DevicePayload>): Promise<Device> {
    try {
      const response = await apiClient.put<Device>(`${basePath}/${id}`, payload);
      const index = devices.value.findIndex(d => d.id === id);
      if (index !== -1) {
        devices.value[index] = response.data;
      }
      return response.data;
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, `Error al actualizar el dispositivo ${id}.`));
    }
  }

  // --- ACCIÓN DE ELIMINAR CORREGIDA ---
  async function deleteDevice(id: number): Promise<void> {
    try {
      // Llamada al endpoint DELETE /dispositivos/{id}
      await apiClient.delete(`${basePath}/${id}`);

      // Actualizar el estado local eliminando el dispositivo
      devices.value = devices.value.filter(d => d.id !== id);
    } catch (err: any) {
      throw new Error(extractErrorMessage(err, `Error al eliminar el dispositivo ${id}.`));
    }
  }

  // --- RETURN ---
  return {
    devices,
    loading,
    error,
    fetchDevices,
    fetchDeviceById,
    createDevice,
    updateDevice,
    deleteDevice, // <-- Asegurarse de exportar la acción
  };
});
