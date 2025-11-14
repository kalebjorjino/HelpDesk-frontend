// src/composables/useDevicesView.ts
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useDeviceStore } from '@/stores/useDeviceStore';

export function useDevicesView() {
    // 1. Obtener la instancia del Store de Pinia
    const deviceStore = useDeviceStore();

    // 2. Extraer el estado con Reactividad
    // storeToRefs es VITAL para desestructurar las propiedades reactivas del Store
    // (devices, loading, error) sin perder su reactividad.
    const { devices, loading, error } = storeToRefs(deviceStore);

    // 3. Lógica del Ciclo de Vida: Cargar datos al montar la vista
    onMounted(() => {
        // Buena práctica: Solo cargar si la lista está vacía para evitar peticiones redundantes
        if (devices.value.length === 0 && !loading.value) {
            console.log('🚀 useDevicesView: Iniciando carga de componentes.');
            deviceStore.fetchDevices();
        }
    });

    // 4. Devolver solo lo que el componente de vista necesita
    return {
        devices,           // Lista de componentes (reactiva y tipada)
        isLoading: loading, // Estado de carga (reactivo)
        fetchError: error,   // Mensaje de error (reactivo)
        refreshDevices: deviceStore.fetchDevices, // Función para forzar la recarga
    };
}
