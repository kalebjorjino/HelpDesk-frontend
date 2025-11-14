import { ref, computed, watch, type Ref } from 'vue';
import { useAssetStore } from '@/stores/useAssetStore';
import type { Asset } from '@/types/Asset';

interface AssetSelectOption {
    title: string;
    value: number;
}

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
        filteredAssets.value = await assetStore.fetchAssetsByUserId(userId);
        isLoadingAssets.value = false;
    };

    // Observar el cambio en usuarioReportaId para recargar los equipos
    watch(usuarioReportaId, (newId) => {
        fetchFilteredAssets(newId);
    }, { immediate: true }); // Cargar al inicio si ya hay un ID

    const assetSelectOptions = computed<AssetSelectOption[]>(() =>
        filteredAssets.value.map(asset => ({
            // Asumimos que el objeto Asset tiene estas propiedades
            title: `${asset.tipoEquipo} - ${asset.marca} (${asset.codigoPatrimonial})`,
            value: asset.id,
        }))
    );

    return {
        assetSelectOptions,
        isLoadingAssets,
    };
}

