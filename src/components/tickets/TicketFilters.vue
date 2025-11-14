<script setup lang="ts">
import type { PropType } from 'vue';

defineProps({
  statusOptions: { type: Array as PropType<any[]>, required: true },
  priorityOptions: { type: Array as PropType<any[]>, required: true },
  // --- CORRECCIÓN ---
  // La lista de usuarios ahora es opcional, con un array vacío como valor por defecto.
  userSelectOptions: {
    type: Array as PropType<any[]>,
    default: () => [], // Ya no es requerida
  },
  isLoadingUsers: Boolean,
  showUserFilter: { type: Boolean, default: false },
});

const filters = defineModel('filters', { required: true });

</script>

<template>
  <v-row class="mb-4 mt-2">
    <v-col cols="12" sm="6" :md="showUserFilter ? 4 : 6">
      <v-text-field
        v-model="filters.search"
        label="Buscar por asunto o descripción..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        clearable
        density="compact"
        hide-details
      ></v-text-field>
    </v-col>
    <v-col cols="12" sm="6" md="2">
      <v-select
        v-model="filters.estado"
        :items="statusOptions"
        label="Estado"
        variant="outlined"
        clearable
        density="compact"
        hide-details
      ></v-select>
    </v-col>
    <v-col cols="12" sm="6" md="2">
      <v-select
        v-model="filters.prioridad"
        :items="priorityOptions"
        label="Prioridad"
        variant="outlined"
        clearable
        density="compact"
        hide-details
      ></v-select>
    </v-col>
    <v-col v-if="showUserFilter" cols="12" sm="6" md="4">
      <v-select
        v-model="filters.usuarioReportaId"
        :items="userSelectOptions"
        item-title="title"
        item-value="value"
        label="Filtrar por Usuario Reporta"
        variant="outlined"
        clearable
        density="compact"
        hide-details
        :loading="isLoadingUsers"
      ></v-select>
    </v-col>
  </v-row>
</template>
