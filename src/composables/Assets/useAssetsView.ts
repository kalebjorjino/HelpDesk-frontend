import { onMounted, computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useAssetStore } from '@/stores/useAssetStore';
import { useUserOptions } from '@/composables/Users/useUserOptions';
import { useDeviceOptions } from '@/composables/Devices/useDeviceOptions';
import { useSweetAlert } from '@/composables/useSweetAlert';

export function useAssetsView() {
  const assetStore = useAssetStore();
  const { assets: rawAssets, loading, error } = storeToRefs(assetStore);
  const { showSuccess, showError, confirmDelete } = useSweetAlert();

  const { allUserOptions, fetchUsers } = useUserOptions();
  const { deviceSelectOptions, fetchDevices } = useDeviceOptions();

  // --- FILTROS ---
  const filters = ref({ search: '' });

  const headers = [
    { title: 'Código Patrimonial', key: 'codigoPatrimonial' },
    { title: 'Marca', key: 'marca' },
    { title: 'Modelo', key: 'modelo' },
    { title: 'Serie', key: 'serie' },
    { title: 'IP', key: 'ip' },
    { title: 'Usuario Asignado', key: 'nombreUsuarioAsignado' },
    { title: 'Componente Asignado', key: 'nombreDispositivoAsignado' },
    { title: 'Acciones', key: 'actions', sortable: false, align: 'center' },
  ];

  const assets = computed(() => {
    let processedAssets = rawAssets.value;

    // 1. Enriquecimiento
    if (allUserOptions.value.length > 0 || deviceSelectOptions.value.length > 0) {
      processedAssets = processedAssets.map(asset => {
        const assignedUser = allUserOptions.value.find(u => u.value === asset.usuarioAsignadoId);
        const assignedDevice = deviceSelectOptions.value.find(d => d.value === asset.deviceAsignadoId);
        return {
          ...asset,
          nombreUsuarioAsignado: assignedUser ? assignedUser.title : 'Sin asignar',
          nombreDispositivoAsignado: assignedDevice ? assignedDevice.title : 'Sin asignar',
        };
      });
    }

    // 2. Filtrado (Frontend)
    if (filters.value.search) {
      const searchLower = filters.value.search.toLowerCase();
      processedAssets = processedAssets.filter(asset =>
        asset.codigoPatrimonial?.toLowerCase().includes(searchLower) ||
        asset.marca?.toLowerCase().includes(searchLower) ||
        asset.modelo?.toLowerCase().includes(searchLower) ||
        asset.serie?.toLowerCase().includes(searchLower) ||
        (asset as any).nombreUsuarioAsignado?.toLowerCase().includes(searchLower)
      );
    }

    return processedAssets;
  });

  const loadData = () => {
    assetStore.fetchAssets();
    fetchUsers();
    fetchDevices();
  };

  const deleteAsset = async (id: number) => {
    const confirmed = await confirmDelete('¿Eliminar equipo?', 'Esta acción eliminará el equipo permanentemente.');
    if (confirmed) {
      try {
        await assetStore.deleteAsset(id);
        showSuccess('Equipo eliminado correctamente');
      } catch (err) {
        showError('Error', 'No se pudo eliminar el equipo.');
      }
    }
  };

  onMounted(loadData);

  return {
    assets,
    headers,
    loading,
    error,
    filters, // <-- Exportar filtros
    loadData,
    deleteAsset,
  };
}
