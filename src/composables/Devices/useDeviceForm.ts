import { ref } from 'vue';
import { useDeviceStore } from '@/stores/useDeviceStore';
import type { Device } from '@/types/Device';

export function useDeviceForm(onSuccess?: () => void) {
  const deviceStore = useDeviceStore();
  const dialog = ref(false);
  const isEditMode = ref(false);
  const deviceData = ref<Partial<Device>>({});
  const isSubmitting = ref(false);
  const formError = ref<string | null>(null);

  const openCreateForm = () => {
    isEditMode.value = false;
    deviceData.value = {};
    formError.value = null;
    dialog.value = true;
  };

  const openEditForm = async (deviceId: number) => {
    isEditMode.value = true;
    formError.value = null;
    try {
      const device = await deviceStore.fetchDeviceById(deviceId);
      if (device) {
        deviceData.value = { ...device };
        dialog.value = true;
      } else {
        formError.value = `Device with ID ${deviceId} not found`;
      }
    } catch (error) {
      formError.value = 'Failed to load device data.';
      console.error(error);
    }
  };

  const handleCancel = () => {
    dialog.value = false;
  };

  const handleSubmit = async () => {
    isSubmitting.value = true;
    formError.value = null;
    try {
      if (isEditMode.value) {
        await deviceStore.updateDevice(deviceData.value.id!, deviceData.value);
      } else {
        await deviceStore.createDevice(deviceData.value as Device);
      }
      dialog.value = false;
      onSuccess?.();
    } catch (error: any) {
      formError.value = error.message || 'An error occurred.';
    } finally {
      isSubmitting.value = false;
    }
  };

  return {
    dialog,
    isEditMode,
    deviceData,
    isSubmitting,
    formError,
    openCreateForm,
    openEditForm,
    handleSubmit,
    handleCancel,
  };
}
