<script setup lang="ts">
import { computed } from 'vue';
import { useTicketsView } from '@/composables/Tickets/useTicketsView';
import { useTicketForm } from '@/composables/Tickets/useTicketForm';
import { useUserOptions } from '@/composables/Users/useUserOptions';
import { useDeviceOptions } from '@/composables/Devices/useDeviceOptions';
import { useAuthStore } from '@/stores/useAuthStore';
import { useExcelExport } from '@/composables/useExcelExport'; // <-- Importar
import TicketFilters from '@/components/tickets/TicketFilters.vue';
import TicketsTable from '@/components/tickets/TicketsTable.vue';
import TicketFormModal from '@/components/tickets/TicketFormModal.vue';

const authStore = useAuthStore();
const { exportToExcel } = useExcelExport(); // <-- Usar

const { tickets, headers, isLoading, fetchError, refreshTickets, filters, priorityOptions, statusOptions, deleteTicket } = useTicketsView();

const {
  dialog,
  isEditMode,
  isLocked,
  ticketData,
  isSubmitting,
  formError,
  openCreateForm,
  openEditForm,
  handleSubmit,
  handleCancel,
  filteredEquipos,
  isLoadingFilteredEquipos
} = useTicketForm(refreshTickets);

// CORRECCION: Desestructurar fetchUsers para asegurar la carga
const { clientUserOptions, agentUserOptions, isLoadingUsers, fetchUsers } = useUserOptions();
const { deviceSelectOptions, isLoadingDevices } = useDeviceOptions();

// CORRECCION: Asegurar que se carguen los usuarios al abrir el modal (o siempre)
const handleOpenCreateForm = () => {
  fetchUsers();
  openCreateForm();
};

const handleOpenEditForm = async (id: number) => {
  fetchUsers(); // Asegurar que tenemos la lista de agentes para mostrar el asignado
  await openEditForm(id);
};


const modalTitle = computed(() => {
  if (!isEditMode.value) return 'Crear Nuevo Ticket';
  if (isLocked.value) return `Detalles del Ticket #${ticketData.value.id}`;
  return `Editar Ticket #${ticketData.value.id}`;
});

// --- FUNCIÓN DE EXPORTACIÓN ---
const handleExport = () => {
  // Mapear los datos para que sean legibles en Excel
  const dataToExport = tickets.value.map(t => ({
    ID: t.id,
    Asunto: t.asunto,
    Prioridad: t.prioridad,
    Estado: t.estado,
    'Fecha Creación': new Date(t.fechaCreacion).toLocaleString(),
    'Reportado Por': t.nombreUsuarioReporta,
    'Técnico Asignado': t.nombreTecnicoAsignado,
    'Equipo': t.detallesEquipo,
    'Componente': t.detallesComponente
  }));

  exportToExcel(dataToExport, 'Reporte_Tickets');
};

</script>

<template>
  <v-container fluid>
    <v-card class="pa-4">
      <v-card-title class="d-flex justify-space-between align-center">
        <h1 class="text-h4">Gestión de Tickets</h1>
        <div>
          <!-- BOTÓN DE EXPORTAR -->
          <v-btn color="success" prepend-icon="mdi-microsoft-excel" class="mr-2" @click="handleExport">Exportar</v-btn>
          <!-- CORRECCION: Usar el nuevo handler -->
          <v-btn color="primary" prepend-icon="mdi-plus" @click="handleOpenCreateForm">Nuevo Ticket</v-btn>
        </div>
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
        @view-details="handleOpenEditForm"
        @delete="deleteTicket"
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
      :device-select-options="deviceSelectOptions"
      :is-loading-users="isLoadingUsers"
      :is-loading-devices="isLoadingDevices"
      @submit="handleSubmit"
      @cancel="handleCancel"
      :filtered-equipos="filteredEquipos"
      :is-loading-filtered-equipos="isLoadingFilteredEquipos"
    />
  </v-container>
</template>
