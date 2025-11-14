<script setup lang="ts">
import { computed } from 'vue';
import { useTicketsView } from '@/composables/Tickets/useTicketsView';
import { useTicketForm } from '@/composables/Tickets/useTicketForm';
import { useUserOptions } from '@/composables/Users/useUserOptions';
import { useFilteredAssetOptions } from '@/composables/Tickets/useAssetOptions';
import { useDeviceOptions } from '@/composables/Devices/useDeviceOptions';
import { useAuthStore } from '@/stores/useAuthStore';
import TicketFilters from '@/components/tickets/TicketFilters.vue';
import TicketsTable from '@/components/tickets/TicketsTable.vue';
import TicketFormModal from '@/components/tickets/TicketFormModal.vue';

const authStore = useAuthStore();

// --- Obtención de Datos y Lógica de la Vista ---
const { tickets, headers, isLoading, fetchError, refreshTickets, filters, priorityOptions, statusOptions } = useTicketsView();
const { dialog, isEditMode, isLocked, ticketData, isSubmitting, formError, openCreateForm, openEditForm, handleSubmit, handleCancel } = useTicketForm(refreshTickets);

// --- Opciones para los Selectores ---
const { clientUserOptions, agentUserOptions, isLoadingUsers } = useUserOptions();
// Se inicializa con un valor reactivo, pero el valor real se obtendrá del useTicketForm
const usuarioReportaIdRef = computed(() => ticketData.value.usuarioReportaId);
const { assetSelectOptions, isLoadingAssets } = useFilteredAssetOptions(usuarioReportaIdRef);
const { deviceSelectOptions, isLoadingDevices } = useDeviceOptions();

// --- Propiedades Computadas para la UI (RESTAURADAS) ---

// Define el título del modal dinámicamente
const modalTitle = computed(() => {
  if (!isEditMode.value) return 'Crear Nuevo Ticket';
  if (isLocked.value) return `Detalles del Ticket #${ticketData.value.id}`;
  return `Editar Ticket #${ticketData.value.id}`;
});

</script>

<template>
  <v-container fluid>
    <v-card class="pa-4">
      <v-card-title class="d-flex justify-space-between align-center">
        <h1 class="text-h4">Gestión de Tickets</h1>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateForm">Nuevo Ticket</v-btn>
      </v-card-title>

      <TicketFilters
        v-model:filters="filters"
        :status-options="statusOptions"
        :priority-options="priorityOptions"
        :user-select-options="clientUserOptions"
        :is-loading-users="isLoadingUsers"
        :show-user-filter="authStore.isAdmin"
      />

      <v-alert v-if="fetchError" type="error" closable class="my-4">
        {{ fetchError }}
        <v-btn class="ml-4" color="white" variant="text" @click="refreshTickets">Reintentar</v-btn>
      </v-alert>

      <TicketsTable
        :headers="headers"
        :tickets="tickets"
        :is-loading="isLoading"
        @view-details="openEditForm"
      />
    </v-card>

    <TicketFormModal
      v-model:dialog="dialog"
      v-model:ticketData="ticketData"
      :title="modalTitle"
      :is-edit-mode="isEditMode"
      :is-locked="isLocked"
      :is-submitting="isSubmitting"
      :form-error="formError"
      :priority-options="priorityOptions"
      :status-options="statusOptions"
      :client-user-options="clientUserOptions"
      :agent-user-options="agentUserOptions"
      :asset-select-options="assetSelectOptions"
      :device-select-options="deviceSelectOptions"
      :is-loading-users="isLoadingUsers"
      :is-loading-assets="isLoadingAssets"
      :is-loading-devices="isLoadingDevices"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </v-container>
</template>
