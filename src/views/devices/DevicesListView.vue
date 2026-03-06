<script setup lang="ts">
import { ref } from 'vue';
import { useDevicesView } from '@/composables/Devices/useDevicesView';
import { useExcelExport } from '@/composables/useExcelExport'; // <-- Importar
import DeviceFormModal from '@/components/devices/DeviceFormModal.vue';
import DeviceFilters from '@/components/devices/DeviceFilters.vue';

const { devices, headers, isLoading, fetchError, refreshDevices, deleteDevice, filters } = useDevicesView();
const { exportToExcel } = useExcelExport(); // <-- Usar

const dialog = ref(false);
const isEditMode = ref(false);
const deviceData = ref({});

const openCreateForm = () => {
  isEditMode.value = false;
  deviceData.value = {};
  dialog.value = true;
};

const openEditForm = (device: any) => {
  isEditMode.value = true;
  deviceData.value = { ...device };
  dialog.value = true;
};

const onFormSuccess = () => {
  dialog.value = false;
  refreshDevices();
};

// --- FUNCIÓN DE EXPORTACIÓN ---
const handleExport = () => {
  const dataToExport = devices.value.map(d => ({
    'Nombre Componente': d.nombreComponente,
    'Cód. Patrimonial': d.codigoPatrimonial,
    Marca: d.marca,
    Modelo: d.modelo,
    Serie: d.serie,
    Especificaciones: d.especificaciones
  }));

  exportToExcel(dataToExport, 'Reporte_Componentes');
};

</script>

<template>
  <v-container fluid>
    <v-card class="pa-4">
      <v-card-title class="d-flex justify-space-between align-center mb-4">
        <h1 class="text-h4">Gestión de Componentes</h1>
        <div>
          <!-- BOTÓN DE EXPORTAR -->
          <v-btn color="success" prepend-icon="mdi-microsoft-excel" class="mr-2" @click="handleExport">Exportar</v-btn>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateForm">Registrar Componente</v-btn>
        </div>
      </v-card-title>

      <DeviceFilters v-model:filters="filters" />

      <v-alert v-if="fetchError" type="error" closable class="my-4">
        {{ fetchError }}
      </v-alert>

      <v-data-table
        :headers="headers"
        :items="devices"
        :loading="isLoading"
        item-key="id"
        class="elevation-1"
        no-data-text="No se encontraron componentes."
        loading-text="Cargando componentes..."
      >
        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-center">
            <v-btn icon size="small" color="secondary" class="mr-2" @click="openEditForm(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>

            <v-btn icon size="small" color="error" @click="deleteDevice(item.id)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <DeviceFormModal
      v-model:dialog="dialog"
      v-model:deviceData="deviceData"
      :is-edit-mode="isEditMode"
      @success="onFormSuccess"
    />
  </v-container>
</template>
