import { onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useAssetStore } from '@/stores/useAssetStore';
import { useUserOptions } from '@/composables/Users/useUserOptions';
import { useDeviceOptions } from '@/composables/Devices/useDeviceOptions'; // <-- 1. Importar

export function useAssetsView() {
  const assetStore = useAssetStore();
  const { assets: rawAssets, loading, error } = storeToRefs(assetStore);

  const { allUserOptions, fetchUsers } = useUserOptions();
  const { deviceSelectOptions, fetchDevices } = useDeviceOptions(); // <-- 2. Obtener lista de dispositivos

  // 3. AÑADIR COLUMNA A HEADERS
  const headers = [
    { title: 'Código Patrimonial', key: 'codigoPatrimonial' },
    { title: 'Marca', key: 'marca' },
    { title: 'Modelo', key: 'modelo' },
    { title: 'Serie', key: 'serie' },
    { title: 'IP', key: 'ip' },
    { title: 'Usuario Asignado', key: 'nombreUsuarioAsignado' },
    { title: 'Componente Asignado', key: 'nombreDispositivoAsignado' }, // <-- Columna añadida
    { title: 'Acciones', key: 'actions', sortable: false, align: 'center' },
  ];

  // 4. AMPLIAR LÓGICA DE ENRIQUECIMIENTO
  const assets = computed(() => {
    if (allUserOptions.value.length === 0 || deviceSelectOptions.value.length === 0) {
      return rawAssets.value;
    }
    return rawAssets.value.map(asset => {
      const assignedUser = allUserOptions.value.find(u => u.value === asset.usuarioAsignadoId);
      const assignedDevice = deviceSelectOptions.value.find(d => d.value === asset.deviceAsignadoId);
      return {
        ...asset,
        nombreUsuarioAsignado: assignedUser ? assignedUser.title : 'Sin asignar',
        nombreDispositivoAsignado: assignedDevice ? assignedDevice.title : 'Sin asignar',
      };
    });
  });

  // 5. ORQUESTAR LA CARGA
  const loadData = () => {
    assetStore.fetchAssets();
    fetchUsers();
    fetchDevices(); // <-- Asegurarse de que los dispositivos también se carguen
  };

  onMounted(loadData);

  return {
    assets, // <-- Devolver la lista ENRIQUECIDA
    headers,
    loading,
    error,
    loadData,
  };
}
