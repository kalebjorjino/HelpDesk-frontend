import { onMounted, computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useAssetStore } from '@/stores/useAssetStore';
import { useTicketStore } from '@/stores/useTicketStore'; // <-- IMPORTAR
import { useUserOptions } from '@/composables/Users/useUserOptions';
import { useDeviceOptions } from '@/composables/Devices/useDeviceOptions';
import { useSweetAlert } from '@/composables/useSweetAlert';

export function useAssetsView() {
  const assetStore = useAssetStore();
  const ticketStore = useTicketStore(); // <-- INSTANCIAR
  const { assets: rawAssets, loading, error } = storeToRefs(assetStore);
  const { showSuccess, showError, confirmDelete } = useSweetAlert();

  const { allUserOptions, fetchUsers } = useUserOptions();
  const { deviceSelectOptions, fetchDevices } = useDeviceOptions();

  // --- FILTROS ---
  const filters = ref({ search: '' });
  const ticketCounts = ref<Record<number, number>>({}); // <-- ESTADO PARA CONTEOS

  const headers = [
    { title: 'Código Patrimonial', key: 'codigoPatrimonial' },
    { title: 'Hostname', key: 'hostname' },
    { title: 'Marca', key: 'marca' },
    { title: 'Modelo', key: 'modelo' },
    { title: 'Serie', key: 'serie' },
    { title: 'IP', key: 'ip' },
    { title: 'Disco', key: 'disco' },
    { title: 'Memoria', key: 'memoria' },
    { title: 'Procesador', key: 'procesador' },
    { title: 'Componente Asignado', key: 'nombreDispositivoAsignado' },
    { title: 'Usuario Asignado', key: 'nombreUsuarioAsignado' },
    { title: 'Garantía', key: 'garantia', align: 'center' },
    { title: 'Intervenciones', key: 'totalTickets', align: 'center' }, // <-- NUEVA COLUMNA
    { title: 'Estado', key: 'estado' },
    { title: 'Acciones', key: 'actions', sortable: false, align: 'center' },
  ];

  const loadData = async () => {
    // Carga paralela para mayor velocidad
    await Promise.all([
      assetStore.fetchAssets(),
      fetchUsers(),
      fetchDevices(),
      (async () => {
        try {
          ticketCounts.value = await ticketStore.fetchTicketCountsByAsset();
        } catch (e) {
          console.error("Error cargando conteos de tickets", e);
        }
      })()
    ]);
  };

  const assets = computed(() => {
    // 1. Enriquecimiento
    let processedAssets: any[] = rawAssets.value.map(asset => {
      const assignedUser = allUserOptions.value.find(u => u.value === asset.usuarioAsignadoId);
      const assignedDevice = deviceSelectOptions.value.find(d => d.value === asset.deviceAsignadoId);
      
      return {
        ...asset,
        nombreUsuarioAsignado: assignedUser ? assignedUser.title : 'Sin asignar',
        nombreDispositivoAsignado: assignedDevice ? assignedDevice.title : 'Sin asignar',
        totalTickets: ticketCounts.value[asset.id!] || 0 // <-- CAMPO ENRIQUECIDO
      };
    });

    // 2. Filtrado (Frontend)
    if (filters.value.search) {
      const searchLower = filters.value.search.toLowerCase();
      processedAssets = processedAssets.filter(asset =>
        asset.codigoPatrimonial?.toLowerCase().includes(searchLower) ||
        asset.hostname?.toLowerCase().includes(searchLower) ||
        asset.marca?.toLowerCase().includes(searchLower) ||
        asset.modelo?.toLowerCase().includes(searchLower) ||
        asset.serie?.toLowerCase().includes(searchLower) ||
        asset.ip?.toLowerCase().includes(searchLower) ||
        asset.departamento?.toLowerCase().includes(searchLower) ||
        asset.unidad?.toLowerCase().includes(searchLower) ||
        asset.oficina?.toLowerCase().includes(searchLower) ||
        asset.servicio?.toLowerCase().includes(searchLower) ||
        asset.estado?.toLowerCase().includes(searchLower) ||
        asset.nombreUsuarioAsignado?.toLowerCase().includes(searchLower)
      );
    }

    return processedAssets;
  });

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
    filters,
    loadData,
    deleteAsset,
  };
}
