import { ref } from 'vue';
import { useAssetStore } from '@/stores/useAssetStore';
import type { Asset } from '@/types/Asset';

export function useAssetForm(onSuccess?: () => void) {
  const assetStore = useAssetStore();
  const dialog = ref(false);
  const isEditMode = ref(false);
  const assetData = ref<Partial<Asset>>({});
  const isSubmitting = ref(false);
  const formError = ref<string | null>(null);

  const openCreateForm = () => {
    isEditMode.value = false;
    assetData.value = {};
    formError.value = null;
    dialog.value = true;
  };

  const openEditForm = async (assetId: number) => {
    isEditMode.value = true;
    formError.value = null;
    try {
      const asset = await assetStore.fetchAssetById(assetId);
      if (asset) {
        assetData.value = { ...asset };
        dialog.value = true;
      } else {
        formError.value = `Asset with ID ${assetId} not found`;
      }
    } catch (error) {
      formError.value = 'Failed to load asset data.';
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
        await assetStore.updateAsset(assetData.value.id!, assetData.value);
      } else {
        await assetStore.createAsset(assetData.value as Asset);
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
    assetData,
    isSubmitting,
    formError,
    openCreateForm,
    openEditForm,
    handleSubmit,
    handleCancel,
  };
}
