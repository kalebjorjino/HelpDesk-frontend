<script setup lang="ts">
import type { Device } from '@/types/Device';
import type { PropType } from 'vue';

defineProps({
  headers: {
    type: Array as PropType<any[]>,
    required: true,
  },
  devices: {
    type: Array as PropType<Device[]>,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['edit-device', 'delete-device']);
</script>

<template>
  <v-data-table
    :headers="headers"
    :items="devices"
    :loading="isLoading"
    item-key="id"
    class="elevation-1"
    no-data-text="No hay componentes registrados."
    loading-text="Cargando componentes..."
  >
    <template v-slot:item.actions="{ item }">
      <div style="display: flex; gap: 8px;">
        <v-btn icon size="small" color="secondary" @click="emit('edit-device', item.id)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon size="small" color="red" @click="emit('delete-device', item.id)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>
    </template>
  </v-data-table>
</template>
