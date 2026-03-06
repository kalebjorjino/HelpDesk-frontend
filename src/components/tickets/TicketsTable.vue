<script setup lang="ts">
import { getStatusColor } from '@/utils/ticketUtils';
import type { Ticket } from '@/types/Ticket';
import type { PropType } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore'; // <-- Importar AuthStore

const authStore = useAuthStore(); // <-- Instanciar

defineProps({
  headers: {
    type: Array as PropType<any[]>,
    required: true,
  },
  tickets: {
    type: Array as PropType<Ticket[]>,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['view-details', 'delete']);

</script>

<template>
  <v-data-table
    :headers="headers"
    :items="tickets"
    :loading="isLoading"
    item-key="id"
    class="elevation-1"
    no-data-text="No se encontraron tickets."
    loading-text="Cargando tickets..."
  >
    <template v-slot:item.prioridad="{ item }">
      <v-chip
        size="small"
        :color="item.prioridad === 'ALTA' || item.prioridad === 'URGENTE' ? 'red' : item.prioridad === 'MEDIA' ? 'orange' : 'green'"
      >
        {{ item.prioridad }}
      </v-chip>
    </template>

    <template v-slot:item.estado="{ item }">
      <v-chip size="small" :color="getStatusColor(item.estado)">{{ item.estado }}</v-chip>
    </template>

    <template v-slot:item.fechaCreacion="{ item }">
      {{ new Date(item.fechaCreacion).toLocaleString() }}
    </template>

    <template v-slot:item.actions="{ item }">
      <div class="d-flex justify-center">
        <v-tooltip :text="item.estado === 'RESUELTO' || item.estado === 'CERRADO' ? 'Ver Detalles' : 'Editar'">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              size="small"
              :color="item.estado === 'RESUELTO' || item.estado === 'CERRADO' ? 'info' : 'secondary'"
              class="mr-2"
              @click="emit('view-details', item.id)"
            >
              <v-icon>{{ item.estado === 'RESUELTO' || item.estado === 'CERRADO' ? 'mdi-eye' : 'mdi-pencil' }}</v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <!-- CORRECCIÓN: Mostrar botón de eliminar SOLO si es ADMIN -->
        <v-btn
          v-if="authStore.isAdmin"
          icon
          size="small"
          color="error"
          @click="emit('delete', item.id)"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>
    </template>
  </v-data-table>
</template>
