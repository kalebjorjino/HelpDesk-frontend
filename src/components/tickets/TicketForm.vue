<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Ticket } from '@/types/Ticket';
import type { PropType } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';

const authStore = useAuthStore();
const form = ref<any>(null); // Referencia al formulario

// Exponer la referencia del formulario al padre
defineExpose({ form });

const props = defineProps({
  isEditMode: { type: Boolean, default: false },
  priorityOptions: { type: Array as PropType<any[]>, required: true },
  statusOptions: { type: Array as PropType<any[]>, required: true },
  clientUserOptions: { type: Array as PropType<any[]>, required: true },
  agentUserOptions: { type: Array as PropType<any[]>, required: true },
  filteredEquipos: { type: Array as PropType<any[]>, required: true },
  isLoadingFilteredEquipos: { type: Boolean, default: false },
  deviceSelectOptions: { type: Array as PropType<any[]>, required: true },
  isLoadingUsers: Boolean,
  isLoadingDevices: Boolean,
});

const model = defineModel<Partial<Ticket & { tecnicoAsignadoId?: number | null, equipoAfectadoId?: number | null }>>({ required: true });

const isLocked = computed(() => {
  return props.isEditMode && (model.value.estado === 'RESUELTO' || model.value.estado === 'CERRADO');
});

// Computed property to determine if the technician can edit fields
const canTechnicianEdit = computed(() => {
    // Technician can only edit tickets assigned to them
    if (authStore.isTechnician) {
        return model.value.tecnicoAsignadoId === authStore.userId;
    }
    return true; // Admin and others can edit
});


const rules = {
  required: (value: any) => !!value || 'Este campo es requerido.',
};
</script>

<template>
  <v-form ref="form">
    <v-row>
      <v-col cols="12" md="6">
        <v-alert v-if="isLocked" type="info" variant="tonal" density="compact" class="mb-4">
          Este ticket está {{ model.estado }}.
          <span v-if="authStore.isAdmin">Puede cambiar el estado para reabrirlo.</span>
          <span v-else>No puede ser modificado.</span>
        </v-alert>
         <v-alert v-if="!canTechnicianEdit && isEditMode && authStore.isTechnician" type="warning" variant="tonal" density="compact" class="mb-4">
          No tienes permisos para editar este ticket porque no está asignado a ti.
        </v-alert>

        <v-text-field
          v-model="model.asunto"
          label="Asunto"
          variant="outlined"
          :rules="[rules.required]"
          class="mb-3"
          :readonly="isLocked || (isEditMode && authStore.isClient) || (isEditMode && authStore.isTechnician)"
        />
        <v-textarea
          v-model="model.descripcion"
          label="Descripción Detallada"
          variant="outlined"
          :rules="[rules.required]"
          rows="8"
          class="mb-3"
          :readonly="isLocked || (isEditMode && authStore.isClient) || (isEditMode && authStore.isTechnician)"
        />

        <!-- CAMPO DE DIAGNÓSTICO PARA TÉCNICOS -->
        <v-textarea
          v-if="isEditMode && authStore.isAgentOrAdmin"
          v-model="model.diagnostico"
          label="Diagnóstico / Notas de Resolución"
          variant="outlined"
          rows="5"
          class="mb-3 bg-grey-lighten-5"
          :readonly="(isLocked && !authStore.isAdmin) || (authStore.isTechnician && !canTechnicianEdit)"
          placeholder="Describa el diagnóstico y las acciones tomadas para resolver el ticket."
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-select
          v-model="model.prioridad"
          :items="props.priorityOptions"
          label="Prioridad"
          variant="outlined"
          :rules="[rules.required]"
          class="mb-3"
          :readonly="isLocked || (isEditMode && authStore.isClient) || (isEditMode && authStore.isTechnician)"
        />

        <template v-if="isEditMode && authStore.isAgentOrAdmin">
          <!-- Estado: Admin puede editar incluso si está locked (para reabrir) -->
          <v-select
            v-model="model.estado"
            :items="props.statusOptions"
            label="Estado"
            variant="outlined"
            :rules="[rules.required]"
            class="mb-3"
            :readonly="(isLocked && !authStore.isAdmin) || (authStore.isTechnician && !canTechnicianEdit)"
          />
          <!-- Asignación: Admin siempre puede editar si no está locked (o si cambia estado). Técnico nunca. -->
          <v-autocomplete
            v-model="model.tecnicoAsignadoId"
            :items="props.agentUserOptions"
            item-title="title"
            item-value="value"
            label="Asignar a Técnico"
            variant="outlined"
            clearable
            class="mb-3"
            :loading="props.isLoadingUsers"
            :readonly="isLocked || authStore.isTechnician"
          />
        </template>

        <v-autocomplete
          v-if="!isEditMode && authStore.isAgentOrAdmin"
          v-model="model.usuarioReportaId"
          :items="props.clientUserOptions"
          item-title="title"
          item-value="value"
          label="Usuario que Reporta"
          variant="outlined"
          :rules="[rules.required]"
          class="mb-3"
          :loading="props.isLoadingUsers"
        />

        <v-alert v-if="!isEditMode && authStore.isClient" type="info" density="compact" class="mb-3">
          Reportando como: <strong>{{ authStore.userName }}</strong>
        </v-alert>

        <v-autocomplete
          v-model="model.equipoAfectadoId"
          :items="props.filteredEquipos"
          item-title="title"
          item-value="value"
          label="Asociar a Equipo (Opcional)"
          variant="outlined"
          clearable
          class="mb-3"
          :loading="props.isLoadingFilteredEquipos"
          :readonly="isLocked || (!isEditMode && !model.usuarioReportaId) || (isEditMode && authStore.isTechnician)"
          no-data-text="Seleccione un usuario para ver sus equipos"
        ></v-autocomplete>

        <v-autocomplete
          v-if="isEditMode && authStore.isAgentOrAdmin"
          v-model="model.componenteId"
          :items="props.deviceSelectOptions"
          item-title="title"
          item-value="value"
          label="Asociar a Componente (Opcional)"
          variant="outlined"
          clearable
          class="mb-3"
          :loading="props.isLoadingDevices"
          :readonly="isLocked || (authStore.isTechnician)"
        />
      </v-col>
    </v-row>
  </v-form>
</template>
