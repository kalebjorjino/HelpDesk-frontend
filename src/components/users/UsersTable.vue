<script setup lang="ts">
import { getRoleColor } from '@/utils/userUtils';
import type { User } from '@/types/User';
import type { PropType } from 'vue';

defineProps({
  headers: {
    type: Array as PropType<any[]>,
    required: true,
  },
  users: {
    type: Array as PropType<User[]>,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['edit-user', 'delete-user']);
</script>

<template>
  <v-data-table
    :headers="headers"
    :items="users"
    :loading="isLoading"
    item-key="id"
    class="elevation-1"
    no-data-text="No hay usuarios registrados."
    loading-text="Cargando usuarios..."
  >
    <template v-slot:item.role="{ item }">
      <v-chip :color="getRoleColor(item.role)" size="small">{{ item.role }}</v-chip>
    </template>
    <template v-slot:item.actions="{ item }">
      <div style="display: flex; gap: 8px;">
        <v-btn v-if="isAdmin" icon size="small" color="secondary" @click="emit('edit-user', item.id)"><v-icon>mdi-pencil</v-icon></v-btn>
        <v-btn v-if="isAdmin" icon size="small" color="red" @click="emit('delete-user', item.id, item.nombreCompleto)"><v-icon>mdi-delete</v-icon></v-btn>
      </div>
    </template>
  </v-data-table>
</template>
