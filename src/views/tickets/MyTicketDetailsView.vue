<script lang="ts" setup>
import { onMounted, computed, watch } from 'vue'; // Import watch
import { useRoute } from 'vue-router';
import { useTicketForm } from '@/composables/Tickets/useTicketForm';
import { useUserOptions } from '@/composables/Users/useUserOptions';
import { getStatusColor } from '@/utils/ticketUtils'; // Asegúrate de tener este util o defínelo aquí
import type { Ticket } from '@/types/Ticket';

const route = useRoute();
const ticketId = parseInt(route.params.id as string);

// Reutilizamos la lógica de carga, pero no el formulario en sí
const {
  ticketData,
  openEditForm,
  filteredEquipos,
  isLoadingFilteredEquipos
} = useTicketForm();

const { agentUserOptions, fetchUsers } = useUserOptions();

onMounted(async () => {
  await fetchUsers();
  await openEditForm(ticketId);
});

// Helpers para visualización
const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const getPriorityColor = (prioridad?: string) => {
  switch (prioridad) {
    case 'URGENTE': return 'red-darken-4';
    case 'ALTA': return 'red';
    case 'MEDIA': return 'orange';
    case 'BAJA': return 'green';
    default: return 'grey';
  }
};

// Computed para obtener nombres legibles
const nombreTecnico = computed(() => {
  if (ticketData.value.nombreTecnicoAsignado) return ticketData.value.nombreTecnicoAsignado;
  if (ticketData.value.tecnicoAsignadoId) {
    const tech = agentUserOptions.value.find(u => u.value === ticketData.value.tecnicoAsignadoId);
    return tech ? tech.title : 'Cargando...';
  }
  return 'Pendiente de asignación';
});

const nombreEquipo = computed(() => {
  // 1. Si el backend ya devolvió el objeto detallesEquipo (Ideal)
  if (ticketData.value.detallesEquipo) {
    const eq = ticketData.value.detallesEquipo;
    // CORRECCION: Manejar propiedades opcionales con strings por defecto para evitar undefined
    return `${eq.tipoEquipo || 'Equipo'} - ${eq.marca || ''} ${eq.modelo || ''} (${eq.codigoPatrimonial || 'S/N'})`;
  }

  // 2. Si tenemos el ID y la lista cargada (Fallback)
  // NOTA: filteredEquipos depende de que se haya llamado a fetchFilteredEquipos en openEditForm
  // Pero openEditForm del composable llama a fetchFilteredEquipos usando el usuarioReportaId
  if (ticketData.value.equipoAfectadoId && filteredEquipos.value.length > 0) {
    const eq = filteredEquipos.value.find((e: any) => e.value === ticketData.value.equipoAfectadoId);
    return eq ? eq.title : 'Cargando información del equipo...';
  }

  // 3. Si tiene ID pero no data
  if (ticketData.value.equipoAfectadoId) return 'Cargando...';

  return 'No especificado';
});

const nombreComponente = computed(() => {
  if (ticketData.value.detallesComponente) {
      return `${ticketData.value.detallesComponente.nombreComponente} (${ticketData.value.detallesComponente.codigoPatrimonial})`;
  }
  return ticketData.value.componenteId ? 'Componente asociado (Ver detalles técnicos)' : 'N/A';
});

</script>

<template>
  <v-container fluid>
    <div class="d-flex align-center mb-6">
      <v-btn icon variant="text" @click="$router.go(-1)" class="mr-2">
        <v-icon size="large">mdi-arrow-left</v-icon>
      </v-btn>
      <h1 class="text-h4 font-weight-bold">Ticket #{{ ticketId }}</h1>
    </div>

    <v-card v-if="ticketData.id" class="pa-2" elevation="2" border>
      <!-- Cabecera del Ticket -->
      <v-card-item>
        <div class="d-flex flex-wrap justify-space-between align-start">
            <div class="mb-2">
                <div class="text-overline text-medium-emphasis">Asunto</div>
                <div class="text-h5 font-weight-medium">{{ ticketData.asunto }}</div>
            </div>
            <div class="d-flex gap-2">
                 <v-chip :color="getStatusColor(ticketData.estado!)" class="text-uppercase font-weight-bold mr-2" label>
                    {{ ticketData.estado }}
                </v-chip>
                <v-chip :color="getPriorityColor(ticketData.prioridad!)" variant="outlined" class="font-weight-bold">
                    {{ ticketData.prioridad }}
                </v-chip>
            </div>
        </div>
        <div class="text-caption text-grey mt-1">
            Creado el: {{ formatDate(ticketData.fechaCreacion) }}
        </div>
      </v-card-item>

      <v-divider></v-divider>

      <v-card-text>
        <v-row>
            <!-- Columna Izquierda: Detalles Principales -->
            <v-col cols="12" md="8">
                <div class="mb-6">
                    <h3 class="text-subtitle-1 font-weight-bold text-primary mb-2">
                        <v-icon start size="small">mdi-text-box-outline</v-icon>
                        Descripción
                    </h3>
                    <v-sheet rounded="lg" color="grey-lighten-5" class="pa-4 border">
                        <p class="text-body-1" style="white-space: pre-wrap;">{{ ticketData.descripcion }}</p>
                    </v-sheet>
                </div>

                <div v-if="ticketData.diagnostico" class="mb-6">
                    <h3 class="text-subtitle-1 font-weight-bold text-success mb-2">
                        <v-icon start size="small">mdi-medical-bag</v-icon>
                        Diagnóstico / Solución
                    </h3>
                    <v-sheet rounded="lg" color="green-lighten-5" class="pa-4 border text-green-darken-4">
                        <p class="text-body-1" style="white-space: pre-wrap;">{{ ticketData.diagnostico }}</p>
                    </v-sheet>
                </div>
            </v-col>

            <!-- Columna Derecha: Metadatos y Asignaciones -->
            <v-col cols="12" md="4">
                <v-card variant="outlined" class="mb-4">
                    <v-card-title class="text-subtitle-2 bg-grey-lighten-4 py-2">
                        Información de Asignación
                    </v-card-title>
                    <v-list density="compact">
                        <v-list-item>
                            <template v-slot:prepend>
                                <v-icon color="primary">mdi-account-wrench</v-icon>
                            </template>
                            <v-list-item-title class="font-weight-bold">Técnico Asignado</v-list-item-title>
                            <v-list-item-subtitle class="text-body-2 mt-1">
                                {{ nombreTecnico }}
                            </v-list-item-subtitle>
                        </v-list-item>
                    </v-list>
                </v-card>

                <v-card variant="outlined">
                    <v-card-title class="text-subtitle-2 bg-grey-lighten-4 py-2">
                        Activos Relacionados
                    </v-card-title>
                    <v-list density="compact" lines="two">
                        <v-list-item>
                            <template v-slot:prepend>
                                <v-icon color="secondary">mdi-laptop</v-icon>
                            </template>
                            <v-list-item-title class="font-weight-bold">Equipo Afectado</v-list-item-title>
                            <v-list-item-subtitle class="text-body-2 mt-1 text-wrap">
                                {{ nombreEquipo }}
                            </v-list-item-subtitle>
                        </v-list-item>

                        <v-divider v-if="ticketData.componenteId" inset></v-divider>

                        <v-list-item v-if="ticketData.componenteId">
                            <template v-slot:prepend>
                                <v-icon color="grey-darken-1">mdi-chip</v-icon>
                            </template>
                            <v-list-item-title class="font-weight-bold">Componente</v-list-item-title>
                            <v-list-item-subtitle class="text-body-2 mt-1">
                                {{ nombreComponente }}
                            </v-list-item-subtitle>
                        </v-list-item>
                    </v-list>
                </v-card>
            </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Estado de Carga -->
    <v-skeleton-loader v-else type="article, list-item-two-line" class="mt-4"></v-skeleton-loader>

  </v-container>
</template>