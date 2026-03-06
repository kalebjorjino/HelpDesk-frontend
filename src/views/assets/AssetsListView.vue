<script setup lang="ts">
import { ref } from 'vue';
import { useAssetsView } from '@/composables/Assets/useAssetsView';
import { useUserOptions } from '@/composables/Users/useUserOptions';
import { useDeviceOptions } from '@/composables/Devices/useDeviceOptions';
import { useExcelExport } from '@/composables/useExcelExport'; // <-- Importar
import AssetFormModal from '@/components/assets/AssetFormModal.vue';
import AssetFilters from '@/components/assets/AssetFilters.vue';

const { assets, headers, loading, error, loadData, deleteAsset, filters } = useAssetsView();
const { exportToExcel } = useExcelExport(); // <-- Usar

const { allUserOptions, isLoadingUsers } = useUserOptions();
const { deviceSelectOptions, isLoadingDevices } = useDeviceOptions();

const dialog = ref(false);
const isEditMode = ref(false);
const assetData = ref({});

const openCreateForm = () => {
  isEditMode.value = false;
  assetData.value = {};
  dialog.value = true;
};

const openEditForm = (asset: any) => {
  isEditMode.value = true;
  assetData.value = { ...asset };
  dialog.value = true;
};

const onFormSuccess = () => {
  dialog.value = false;
  loadData();
};

// --- FUNCIÓN DE EXPORTACIÓN ---
const handleExport = () => {
  const dataToExport = assets.value.map(a => ({
    'Cód. Patrimonial': a.codigoPatrimonial,
    Marca: a.marca,
    Modelo: a.modelo,
    Serie: a.serie,
    IP: a.ip,
    Departamento: a.departamento,
    Unidad: a.unidad,
    Estado: a.estado,
    'Usuario Asignado': a.nombreUsuarioAsignado,
    'Componente Asignado': a.nombreDispositivoAsignado
  }));

  exportToExcel(dataToExport, 'Reporte_Patrimonio');
};

</script>

<template>
  <v-container fluid>
    <v-card class="pa-4">
      <v-card-title class="d-flex justify-space-between align-center">
        <h1 class="text-h4">Gestión de Patrimonio</h1>
        <div>
          <!-- BOTÓN DE EXPORTAR -->
          <v-btn color="success" prepend-icon="mdi-microsoft-excel" class="mr-2" @click="handleExport">Exportar</v-btn>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateForm">Registrar Equipo</v-btn>
        </div>
      </v-card-title>

      <AssetFilters v-model:filters="filters" />

      <v-alert v-if="error" type="error" closable class="my-4">
        {{ error }}
      </v-alert>

      <v-data-table
        :headers="headers"
        :items="assets"
        :loading="loading"
        item-key="id"
        class="elevation-1 mt-4"
        no-data-text="No se encontraron equipos."
        loading-text="Cargando equipos..."
      >
        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-center">
            <v-btn icon size="small" color="secondary" class="mr-2" @click="openEditForm(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon size="small" color="error" @click="deleteAsset(item.id)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <AssetFormModal
      v-model:dialog="dialog"
      v-model:assetData="assetData"
      :is-edit-mode="isEditMode"
      :user-select-options="allUserOptions"
      :is-loading-users="isLoadingUsers"
      :device-select-options="deviceSelectOptions"
      :is-loading-devices="isLoadingDevices"
      @success="onFormSuccess"
    />
  </v-container>
</template>
