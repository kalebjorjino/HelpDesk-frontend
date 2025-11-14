<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useMyTicketsView } from '@/composables/Tickets/useMyTicketsView';
import TicketFilters from '@/components/tickets/TicketFilters.vue'; // Import the new component
import TicketsTable from '@/components/tickets/TicketsTable.vue';   // Import the new component

const router = useRouter();

// The composable remains the source of truth for logic and data
const { tickets, isLoading, fetchError, refreshTickets, filters, priorityOptions, statusOptions } = useMyTicketsView();

// Headers are still defined here as they are specific to this view
const headers = [
  { title: 'Asunto', align: 'start', key: 'asunto' },
  { title: 'Prioridad', key: 'prioridad', width: '120px' },
  { title: 'Estado', key: 'estado', width: '120px' },
  { title: 'Fecha Creación', key: 'fechaCreacion' },
  { title: 'Acciones', key: 'actions', sortable: false, width: '100px' },
];

// Event handlers that orchestrate actions based on component events
const handleViewDetails = (ticketId: number) => {
  router.push({ name: 'my-ticket-details', params: { id: ticketId } });
};

const handleAddComment = (ticketId: number) => {
  // Implement your logic, e.g., open a dialog
  alert(`Implementar modal para añadir comentario - Ticket ID: ${ticketId}`);
};

</script>

<template>
  <v-container fluid>
    <h1 class="text-h4 mb-4">Mis Tickets Reportados</h1>

    <v-card class="pa-4">
      <!-- Use the reusable filters component -->
      <TicketFilters
        v-model:filters="filters"
        :status-options="statusOptions"
        :priority-options="priorityOptions"
      />

      <v-alert v-if="fetchError" type="error" closable class="my-4">
        {{ fetchError }}
        <v-btn class="ml-4" color="white" variant="text" @click="refreshTickets">Reintentar</v-btn>
      </v-alert>

      <!-- Use the reusable table component -->
      <TicketsTable
        :headers="headers"
        :tickets="tickets"
        :is-loading="isLoading"
        @view-details="handleViewDetails"
        @add-comment="handleAddComment"
      />
    </v-card>
  </v-container>
</template>
