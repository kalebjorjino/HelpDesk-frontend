<script lang="ts" setup>
import { ref } from 'vue';
import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useTicketForm } from '@/composables/Tickets/useTicketForm';
import { useUserOptions } from '@/composables/Users/useUserOptions';
import { useFilteredAssetOptions } from '@/composables/Tickets/useAssetOptions';
import { useDeviceOptions } from '@/composables/Devices/useDeviceOptions';
import TicketForm from '@/components/tickets/TicketForm.vue';
import type { PrioridadTicket, EstadoTicket } from '@/types/Ticket';

const route = useRoute();
const ticketId = parseInt(route.params.id as string);

const {
  isEditMode,
  ticketData,
  isSubmitting,
  formError,
  openEditForm,
  handleSubmit
} = useTicketForm(() => {
  alert('Ticket actualizado con éxito!');
});

const { userSelectOptions, isLoadingUsers } = useUserOptions();
// El usuario que reporta es el mismo que el usuario asignado al ticket
const usuarioReportaIdRef = computed(() => ticketData.value.usuarioReportaId);
const { assetSelectOptions, isLoadingAssets } = useFilteredAssetOptions(usuarioReportaIdRef);
const { deviceSelectOptions, isLoadingDevices } = useDeviceOptions();

const priorityOptions: PrioridadTicket[] = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'];
const statusOptions: EstadoTicket[] = ['PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'CERRADO'];

onMounted(() => {
  openEditForm(ticketId);
});

const isLocked = computed(() => {
  // CORRECCIÓN: Bloqueo solo si el estado es CERRADO
  return isEditMode.value && (ticketData.value.estado === 'CERRADO');
});

</script>

<template>
  <v-container fluid>
    <v-btn icon @click="$router.go(-1)" class="mb-4" title="Volver">
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>

    <h1 class="text-h4 mb-4">Detalles del Ticket #{{ ticketId }}</h1>

    <v-alert v-if="formError" type="error" closable class="mb-4">
      {{ formError }}
    </v-alert>

    <v-card v-if="!ticketData.id && isSubmitting" class="pa-6">
      <v-skeleton-loader type="article, actions"></v-skeleton-loader>
    </v-card>

    <v-card v-else-if="ticketData.id" class="pa-6">
      <v-card-title class="text-h5 mb-4">
        {{ ticketData.asunto }}
      </v-card-title>

      <v-form @submit.prevent="handleSubmit">
        <TicketForm v-model="ticketData" :is-edit-mode="isEditMode" :priority-options="priorityOptions"
          :status-options="statusOptions" :client-user-options="userSelectOptions"
          :agent-user-options="userSelectOptions" :asset-select-options="assetSelectOptions"
          :device-select-options="deviceSelectOptions" :is-loading-users="isLoadingUsers"
          :is-loading-assets="isLoadingAssets" :is-loading-devices="isLoadingDevices" />

        <v-divider class="my-4"></v-divider>

        <!-- CORRECCIÓN: Se eliminó la etiqueta de cierre inválida -->
        <v-btn v-if="!isLocked" type="submit" color="success" size="large" :loading="isSubmitting"
          prepend-icon="mdi-content-save">
          Guardar Cambios
        </v-btn>
      </v-form>
    </v-card>

    <v-alert v-else-if="!isSubmitting" type="info" class="mt-4">
      Ticket no encontrado o no existe.
    </v-alert>
  </v-container>
</template>
