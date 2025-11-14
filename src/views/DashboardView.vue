<script setup lang="ts">
// Import the composable that handles data fetching and calculations
import TicketsByPriorityChart from '@/components/charts/TicketsByPriorityChart.vue';
import { useDashboardData } from '@/composables/Dashboard/useDashboardData';
import { useRouter } from 'vue-router'; // To navigate on card click

// Use the composable to get reactive data and functions
const {
  isLoading,
  error,
  openTicketsCount,
  highPriorityTicketsCount,
  averageResponseTime, // Still simulated in the composable for now
  closedLast24h,       // Still simulated in the composable for now
  pendingTasks,      // Simulated task list from composable
  // totalActiveUsers, // Uncomment if you use this in the composable
  refreshDashboard   // Function to reload data
} = useDashboardData();

const router = useRouter();

// Function to navigate to the tickets list with pre-applied filters
const goToTickets = (filterParams = {}) => {
  // Pass filters as query parameters to the tickets list view
  router.push({ name: 'tickets-list', query: filterParams });
};

</script>

<template>
  <v-container fluid>
    <h1 class="text-h4 mb-6">Dashboard de Operaciones</h1>

    <v-row v-if="isLoading">
      <v-col v-for="n in 4" :key="`skel-${n}`" cols="12" sm="6" lg="3">
        <v-skeleton-loader type="card"></v-skeleton-loader>
      </v-col>
    </v-row>

    <v-alert v-else-if="error" type="error" closable class="mb-6">
      {{ error }}
      <v-btn class="ml-4" color="white" variant="text" @click="refreshDashboard">Reintentar</v-btn>
    </v-alert>

    <v-row v-else>
      <v-col cols="12" sm="6" lg="3">
        <v-card color="blue-lighten-5" class="pa-4 text-center elevation-2" hover
          @click="goToTickets({ estado: ['PENDIENTE', 'EN_PROCESO'] })">
          <v-card-title class="text-h4 font-weight-bold text-blue-darken-3">{{ openTicketsCount }}</v-card-title>
          <v-card-subtitle class="mt-1">Tickets Abiertos</v-card-subtitle>
          <v-icon size="50" color="blue-darken-3" class="mt-2">mdi-lifebuoy</v-icon>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card color="red-lighten-5" class="pa-4 text-center elevation-2" hover
          @click="goToTickets({ prioridad: ['ALTA', 'URGENTE'], estado: ['PENDIENTE', 'EN_PROCESO'] })">
          <v-card-title class="text-h4 font-weight-bold text-red-darken-3">{{ highPriorityTicketsCount }}</v-card-title>
          <v-card-subtitle class="mt-1">Alta Prioridad (Abiertos)</v-card-subtitle>
          <v-icon size="50" color="red-darken-3" class="mt-2">mdi-alert-octagon</v-icon>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card color="yellow-lighten-5" class="pa-4 text-center elevation-2">
          <v-card-title class="text-h4 font-weight-bold text-yellow-darken-3">{{ averageResponseTime }}</v-card-title>
          <v-card-subtitle class="mt-1">Tiempo Promedio Respuesta</v-card-subtitle>
          <v-icon size="50" color="yellow-darken-3" class="mt-2">mdi-timer-sand</v-icon>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card color="green-lighten-5" class="pa-4 text-center elevation-2">
          <v-card-title class="text-h4 font-weight-bold text-green-darken-3">{{ closedLast24h }}</v-card-title>
          <v-card-subtitle class="mt-1">Cerrados (Últimas 24h)</v-card-subtitle>
          <v-icon size="50" color="green-darken-3" class="mt-2">mdi-check-circle</v-icon>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4" v-if="!isLoading && !error">
      <v-col cols="12" lg="8">
        <v-card class="pa-4 elevation-2">
          <v-card-title class="text-h6">Análisis de Tickets</v-card-title>
          <v-card-text>
            <TicketsByPriorityChart />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card class="pa-4 elevation-2">
          <v-card-title class="text-h6">Tareas Pendientes</v-card-title>
          <v-list density="compact" lines="one">
            <v-list-item v-for="task in pendingTasks" :key="task.id" :prepend-icon="task.icon"
              :title="task.text"></v-list-item>
            <v-list-item v-if="!pendingTasks.length" title="No hay tareas pendientes." />
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
