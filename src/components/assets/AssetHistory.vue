<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useTicketStore } from '@/stores/useTicketStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUserOptions } from '@/composables/Users/useUserOptions';
import type { Ticket } from '@/types/Ticket';

// Definir las props
const props = defineProps({
  assetId: {
    type: Number,
    required: true,
  },
});

const ticketStore = useTicketStore();
const authStore = useAuthStore();
const { allUserOptions, fetchUsers } = useUserOptions(); // Importar opciones de usuario

const tickets = ref<Ticket[]>([]);
const isLoading = ref(false);

// Computed para procesar tickets y mapear nombres de técnicos
const processedTickets = computed(() => {
    return tickets.value.map(ticket => {
        // Intentar obtener el nombre del técnico de allUserOptions
        const technician = allUserOptions.value.find(u => u.value === ticket.tecnicoAsignadoId);

        // Prioridad:
        // 1. Nombre encontrado en la lista de usuarios (frontend)
        // 2. Nombre que ya venía del backend (ticket.nombreTecnicoAsignado)
        // 3. Fallback 'Sin técnico asignado'
        const technicianName = technician
            ? technician.title
            : (ticket.nombreTecnicoAsignado || 'Sin técnico asignado');

        return {
            ...ticket,
            displayTechnicianName: technicianName
        };
    });
});

// Función para cargar el historial
const loadHistory = async () => {
  if (!props.assetId) return;

  // Validar si el usuario tiene rol TECHNICIAN o ADMIN
  if (!authStore.isAgentOrAdmin) {
      return;
  }

  isLoading.value = true;
  try {
    // Cargar usuarios si no están cargados para asegurar el mapeo correcto
    if (allUserOptions.value.length === 0) {
        await fetchUsers();
    }

    tickets.value = await ticketStore.fetchTicketsByAssetId(props.assetId);
  } catch (error) {
    console.error('Error cargando historial:', error);
  } finally {
    isLoading.value = false;
  }
};

// Helpers visuales
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusColor = (estado: string) => {
  switch (estado) {
    case 'PENDIENTE': return 'orange';
    case 'EN_PROGRESO': return 'blue';
    case 'RESUELTO': return 'green';
    case 'CERRADO': return 'grey';
    default: return 'primary';
  }
};

onMounted(() => {
  loadHistory();
});
</script>

<template>
  <v-card>
    <v-card-title class="text-h6 bg-grey-lighten-4">
      Historial de Soporte
    </v-card-title>

    <v-card-text class="pt-4" style="max-height: 400px; overflow-y: auto;">

      <!-- Loading State -->
      <div v-if="isLoading" class="d-flex justify-center py-4">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>

      <!-- Timeline -->
      <v-timeline v-else-if="processedTickets.length > 0" density="compact" align="start" side="end">
        <v-timeline-item
          v-for="ticket in processedTickets"
          :key="ticket.id"
          :dot-color="getStatusColor(ticket.estado)"
          size="small"
        >
          <div class="mb-2">
            <div class="d-flex justify-space-between align-center">
              <span class="font-weight-bold text-subtitle-2">{{ ticket.asunto }}</span>
              <span class="text-caption text-grey">{{ formatDate(ticket.fechaCreacion) }}</span>
            </div>

            <div class="text-body-2 my-1">{{ ticket.descripcion }}</div>

            <div class="text-caption text-medium-emphasis d-flex align-center mt-1">
              <v-icon size="x-small" start>mdi-account-wrench</v-icon>
              {{ ticket.displayTechnicianName }}
            </div>
          </div>
        </v-timeline-item>
      </v-timeline>

      <!-- Empty State -->
      <div v-else class="text-center text-grey py-4">
        <v-icon size="large" class="mb-2">mdi-history</v-icon>
        <p>Este equipo no tiene tickets registrados.</p>
      </div>

    </v-card-text>
  </v-card>
</template>