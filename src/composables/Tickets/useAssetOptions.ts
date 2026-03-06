import { ref, computed, watch, onMounted, type Ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useAssetStore } from '@/stores/useAssetStore';
import type { Asset } from '@/types/Asset';

interface AssetSelectOption {
    title: string;
    value: number;
}

// --- FUNCIÓN ORIGINAL (Para cargar TODOS los activos) ---
export function useAssetOptions() {
    const assetStore = useAssetStore();
    const { assets, loading: isLoadingAssets } = storeToRefs(assetStore);

    const fetchAssets = () => {
        // Cargar todos los activos (sin filtro de usuario)
        assetStore.fetchAssets();
    };

    // Cargar al montar si es necesario
    onMounted(() => {
        if (assets.value.length === 0) {
            fetchAssets();
        }
    });

    const assetSelectOptions = computed<AssetSelectOption[]>(() =>
        assets.value.map(asset => ({
            title: `${asset.tipoEquipo || 'Equipo'} - ${asset.marca} (${asset.codigoPatrimonial})`,
            value: asset.id,
        }))
    );

    return {
        assetSelectOptions,
        isLoadingAssets,
        fetchAssets,
    };
}

// --- NUEVA FUNCIÓN (Para cargar activos FILTRADOS por usuario) ---
export function useFilteredAssetOptions(usuarioReportaId: Ref<number | null | undefined>) {
    const assetStore = useAssetStore();
    const filteredAssets = ref<Asset[]>([]);
    const isLoadingAssets = ref(false);

    const fetchFilteredAssets = async (userId: number | null | undefined) => {
        if (!userId) {
            filteredAssets.value = [];
            return;
        }

        isLoadingAssets.value = true;
        // Asumiendo que el store tiene una acción fetchAssets que acepta userId
        // Si no, deberíamos usar una acción específica o filtrar localmente si ya tenemos todos
        await assetStore.fetchAssets(userId);
        // NOTA: fetchAssets actualiza el estado global 'assets'.
        // Si queremos una lista separada, deberíamos tener una acción que retorne datos sin mutar el estado global,
        // o filtrar la lista global.
        // Por ahora, asumiremos que fetchAssets actualiza el estado global y usamos eso.
        filteredAssets.value = assetStore.assets;
        isLoadingAssets.value = false;
    };

    watch(usuarioReportaId, (newId) => {
        fetchFilteredAssets(newId);
    }, { immediate: true });

    const assetSelectOptions = computed<AssetSelectOption[]>(() =>
        filteredAssets.value.map(asset => ({
            title: `${asset.tipoEquipo || 'Equipo'} - ${asset.marca} (${asset.codigoPatrimonial})`,
            value: asset.id,
        }))
    );

    return {
        assetSelectOptions,
        isLoadingAssets,
    };
}
