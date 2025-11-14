<script setup lang="ts">
import { getStatusColor } from '@/utils/assetUtils';
import type { Asset } from '@/types/Asset';
import type { PropType } from 'vue';

defineProps({
  headers: {
    type: Array as PropType<any[]>,
    required: true,
  },
  assets: {
    type: Array as PropType<Asset[]>,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['edit-asset', 'view-asset', 'delete-asset']);
</script>

<template>
  <v-data-table
    :headers="headers"
    :items="assets"
    :loading="isLoading"
    item-key="id"
    class="elevation-1"
    no-data-text="No hay equipos registrados."
    loading-text="Cargando inventario..."
  >
    <template v-slot:item.status="{ item }">
      <v-chip :color="getStatusColor(item.status)" dark size="small">
        {{ item.status }}
      </v-chip>
    </template>

    <template v-slot:item.actions="{ item }">
      <div style="display: flex; gap: 8px;">
        <v-btn icon size="small" color="secondary" @click="emit('edit-asset', item.id)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon size="small" color="primary" @click="emit('view-asset', item.id)">
          <v-icon>mdi-eye</v-icon>
        </v-btn>
        <v-btn icon size="small" color="red" @click="emit('delete-asset', item.id)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>
    </template>
  </v-data-table>
</template>
