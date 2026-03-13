<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTicketStore } from '@/stores/useTicketStore';
import type { Ticket } from '@/types/Ticket';

// Definir las props
const props = defineProps({
  assetId: {
    type: Number,
    required: true,
  },
});

const ticketStore = useTicketStore();
const tickets = ref<Ticket[]>([]);
const isLoading = ref(false);

// Función para cargar el historial
const loadHistory = async () => {
  if (!props.assetId) return;
  
  isLoading.value = true;
  try {
    // Asumimos que esta acción ya existe en tu ticketStore (la creamos antes)
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
      <v-timeline v-else-if="tickets.length > 0" density="compact" align="start" side="end">
        <v-timeline-item
          v-for="ticket in tickets"
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
              {{ ticket.nombreTecnicoAsignado || 'Sin técnico asignado' }}
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