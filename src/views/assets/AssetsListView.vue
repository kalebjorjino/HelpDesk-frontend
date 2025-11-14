<script setup lang="ts">
import { ref } from 'vue';
import { useAssetsView } from '@/composables/Assets/useAssetsView';
import { useUserOptions } from '@/composables/Users/useUserOptions';
import { useDeviceOptions } from '@/composables/Devices/useDeviceOptions';
import AssetFormModal from '@/components/assets/AssetFormModal.vue';

const { assets, headers, loading, error, loadData } = useAssetsView();

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
  loadData(); // Refrescar la lista de activos
};

</script>

<template>
  <v-container fluid>
    <v-card class="pa-4">
      <v-card-title class="d-flex justify-space-between align-center">
        <h1 class="text-h4">Gestión de Patrimonio</h1>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateForm">Registrar Equipo</v-btn>
      </v-card-title>

      <v-alert v-if="error" type="error" closable class="my-4">
        {{ error }}
      </v-alert>

      <!-- TABLA DE DATOS RESTAURADA -->
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
          <v-btn icon size="small" color="secondary" @click="openEditForm(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
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
