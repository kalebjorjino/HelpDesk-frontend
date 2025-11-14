<script setup lang="ts">
import { computed, watch } from 'vue';
import type { Ticket } from '@/types/Ticket';
import type { PropType } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';

const authStore = useAuthStore();

const props = defineProps({
  isEditMode: { type: Boolean, default: false },
  priorityOptions: { type: Array as PropType<any[]>, required: true },
  statusOptions: { type: Array as PropType<any[]>, required: true },
  // CORRECCIÓN: Nuevas props para las listas filtradas
  clientUserOptions: { type: Array as PropType<any[]>, required: true },
  agentUserOptions: { type: Array as PropType<any[]>, required: true },
  assetSelectOptions: { type: Array as PropType<any[]>, required: true },
  deviceSelectOptions: { type: Array as PropType<any[]>, required: true },
  isLoadingUsers: Boolean,
  isLoadingAssets: Boolean,
  isLoadingDevices: Boolean,
});

const model = defineModel<Partial<Ticket & { tecnicoAsignadoId?: number | null }>>({ required: true });

// Lógica para el select anidado
watch(() => model.value.usuarioReportaId, (newId, oldId) => {
  // Limpiar el equipo afectado si el usuario cambia
  if (newId !== oldId) {
    model.value.equipoAfectadoId = undefined;
  }
});

// Si es modo creación y es cliente, el usuarioReportaId es el propio ID del usuario
const shouldShowDiagnostico = computed(() => {
  // 1. Si está en modo edición
  if (props.isEditMode) {
    // 2. Si es Agente/Admin, siempre lo ve (para editar o ver)
    if (authStore.isAgentOrAdmin) {
      return true;
    }
    // 3. Si es Cliente (USER), solo lo ve si existe un diagnóstico
    if (authStore.isClient) {
      return !!model.value.diagnostico;
    }
  }
  // 4. En cualquier otro caso (modo creación, o no cumple las condiciones), no se muestra
  return false;
});
if (!props.isEditMode && authStore.isClient) {
  model.value.usuarioReportaId = authStore.userId;
}

const isLocked = computed(() => {
  // CORRECCIÓN: Bloqueo solo si el estado es CERRADO
  return props.isEditMode && (model.value.estado === 'CERRADO');
});

</script>

<template>
  <v-row>
    <v-col cols="12" md="6">
      <v-alert v-if="isLocked" type="info" variant="tonal" density="compact" class="mb-4">Este ticket está {{
        model.estado }} y no puede ser modificado.</v-alert>
      <v-text-field v-model="model.asunto" label="Asunto" variant="outlined" required class="mb-3"
        :readonly="isLocked || (isEditMode && authStore.isClient)" />
      <v-textarea v-model="model.descripcion" label="Descripción Detallada" variant="outlined" required rows="8"
        class="mb-3" :readonly="isLocked || (isEditMode && authStore.isClient)" />
    </v-col>

    <v-col cols="12" md="6">
      <v-select v-model="model.prioridad" :items="props.priorityOptions" label="Prioridad" variant="outlined" required
        class="mb-3" :readonly="isLocked || (isEditMode && authStore.isClient)" />

      <template v-if="isEditMode && authStore.isAgentOrAdmin">
        <v-select v-model="model.estado" :items="props.statusOptions" label="Estado" variant="outlined" required
          class="mb-3" :readonly="isLocked || authStore.isClient" />
        <v-autocomplete v-model="model.tecnicoAsignadoId" :items="props.agentUserOptions" item-title="title"
          item-value="value" label="Asignar a Técnico" variant="outlined" clearable class="mb-3"
          :loading="props.isLoadingUsers" :readonly="isLocked || authStore.isClient" />
      </template>

      <v-autocomplete v-if="!isEditMode && authStore.isAgentOrAdmin" v-model="model.usuarioReportaId"
        :items="props.clientUserOptions" item-title="title" item-value="value" label="Usuario que Reporta"
        variant="outlined" required class="mb-3" :loading="props.isLoadingUsers" />

      <v-alert v-if="!isEditMode && authStore.isClient" type="info" density="compact" class="mb-3">Reportando como:
        <strong>{{
          authStore.userName }}</strong></v-alert>

      <v-autocomplete v-model="model.equipoAfectadoId" :items="props.assetSelectOptions" item-title="title"
        item-value="value" label="Asociar a Equipo (Opcional)" variant="outlined" clearable class="mb-3"
        :loading="props.isLoadingAssets" :readonly="isLocked || (isEditMode && authStore.isClient)" />

      <v-autocomplete v-if="isEditMode && authStore.isAgentOrAdmin" v-model="model.componenteId"
        :items="props.deviceSelectOptions" item-title="title" item-value="value" label="Asociar a Componente (Opcional)"
        variant="outlined" clearable class="mb-3" :loading="props.isLoadingDevices" :readonly="isLocked || authStore.isClient" />
    </v-col>
  </v-row>

  <v-row v-if="shouldShowDiagnostico">
    <v-col cols="12">
      <v-textarea v-model="model.diagnostico" label="Diagnóstico del Técnico" variant="outlined" rows="4"
        class="mb-3" :readonly="isLocked || authStore.isClient" />
    </v-col>
  </v-row>
</template>
