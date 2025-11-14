<script setup lang="ts">
import { computed } from 'vue';
import { useDevicesView } from '@/composables/Devices/useDevicesView';
import { useDeviceForm } from '@/composables/Devices/useDeviceForm';
import DevicesTable from '@/components/devices/DevicesTable.vue';
import DeviceFormModal from '@/components/devices/DeviceFormModal.vue';

const { devices, isLoading, fetchError, refreshDevices } = useDevicesView();
const { dialog, isEditMode, deviceData, isSubmitting, formError, openCreateForm, openEditForm, handleSubmit, handleCancel } = useDeviceForm(refreshDevices);

const headers = [
  { title: 'ID', key: 'id', width: '50px' },
  { title: 'Cód. Patrimonial', key: 'codigoPatrimonial' },
  { title: 'Componente', key: 'nombreComponente' },
  { title: 'Especificaciones', key: 'especificaciones' },
  { title: 'Marca', key: 'marca' },
  { title: 'Modelo', key: 'modelo' },
  { title: 'Serie', key: 'serie' },
  { title: 'Acciones', key: 'actions', sortable: false, width: '100px' },
];

const modalTitle = computed(() => (isEditMode.value ? 'Editar Componente' : 'Nuevo Componente'));

</script>

<template>
  <v-container fluid>
    <h1 class="text-h4 mb-4">Gestión de Componentes</h1>
    <v-card class="pa-4">
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Total de Componentes ({{ devices.length }})</span>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateForm">Nuevo Componente</v-btn>
      </v-card-title>
      <v-alert v-if="fetchError" type="error" closable class="my-4">
        {{ fetchError }}
        <v-btn class="ml-4" color="white" variant="text" @click="refreshDevices">Reintentar</v-btn>
      </v-alert>
      <DevicesTable
        :headers="headers"
        :devices="devices"
        :is-loading="isLoading"
        @edit-device="openEditForm"
      />
    </v-card>
    <DeviceFormModal
      v-model:dialog="dialog"
      v-model:deviceData="deviceData"
      :title="modalTitle"
      :is-submitting="isSubmitting"
      :form-error="formError"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </v-container>
</template>
