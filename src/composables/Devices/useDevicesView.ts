import { onMounted, computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useDeviceStore } from '@/stores/useDeviceStore';
import { useSweetAlert } from '@/composables/useSweetAlert';

export function useDevicesView() {
    const deviceStore = useDeviceStore();
    const { showSuccess, showError, confirmDelete } = useSweetAlert();

    const { devices: rawDevices, loading, error } = storeToRefs(deviceStore);

    // --- FILTROS ---
    const filters = ref({ search: '' });

    const headers = [
        { title: 'Nombre Componente', key: 'nombreComponente' },
        { title: 'Marca', key: 'marca' },
        { title: 'Modelo', key: 'modelo' },
        { title: 'Serie', key: 'serie' },
        { title: 'Código Patrimonial', key: 'codigoPatrimonial' },
        { title: 'Especificaciones', key: 'especificaciones' },
        { title: 'Acciones', key: 'actions', sortable: false, align: 'center' },
    ];

    const devices = computed(() => {
        let processedDevices = rawDevices.value;

        if (filters.value.search) {
            const searchLower = filters.value.search.toLowerCase();
            processedDevices = processedDevices.filter(device =>
                device.nombreComponente?.toLowerCase().includes(searchLower) ||
                device.marca?.toLowerCase().includes(searchLower) ||
                device.modelo?.toLowerCase().includes(searchLower) ||
                device.serie?.toLowerCase().includes(searchLower) ||
                device.codigoPatrimonial?.toLowerCase().includes(searchLower)
            );
        }
        return processedDevices;
    });

    const loadData = () => {
        deviceStore.fetchDevices();
    };

    const deleteDevice = async (id: number) => {
        const confirmed = await confirmDelete('¿Eliminar componente?', 'Esta acción eliminará el componente permanentemente.');
        if (confirmed) {
            try {
                await deviceStore.deleteDevice(id);
                showSuccess('Componente eliminado correctamente');
            } catch (err) {
                console.error('Error al eliminar el componente:', err);
                showError('Error', 'No se pudo eliminar el componente.');
            }
        }
    };

    onMounted(() => {
        if (rawDevices.value.length === 0 && !loading.value) {
            deviceStore.fetchDevices();
        }
    });

    return {
        devices,
        headers,
        isLoading: loading,
        fetchError: error,
        filters, // <-- Exportar filtros
        refreshDevices: deviceStore.fetchDevices,
        deleteDevice,
    };
}
