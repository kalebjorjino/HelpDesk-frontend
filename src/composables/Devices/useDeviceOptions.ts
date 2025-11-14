import { onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDeviceStore } from '@/stores/useDeviceStore';

interface DeviceSelectOption {
    title: string;
    value: number;
}

export function useDeviceOptions() {
    const deviceStore = useDeviceStore();
    const { devices, loading: isLoadingDevices } = storeToRefs(deviceStore);

    const fetchDevices = () => {
        if (devices.value.length === 0) {
            deviceStore.fetchDevices();
        }
    };

    onMounted(fetchDevices);

    const deviceSelectOptions = computed<DeviceSelectOption[]>(() =>
        devices.value.map(device => ({
            // Asumimos que el objeto Device tiene estas propiedades
            title: `${device.nombreComponente} (${device.serie})`,
            value: device.id,
        }))
    );

    return {
        deviceSelectOptions,
        isLoadingDevices,
        fetchDevices,
    };
}
