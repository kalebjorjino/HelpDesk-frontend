<script setup lang="ts">
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
});

const emit = defineEmits(['edit', 'delete']); // <-- Evento delete añadido

const getRoleColor = (role: string) => {
  switch (role) {
    case 'ADMIN': return 'red';
    case 'TECHNICIAN': return 'blue';
    default: return 'green';
  }
};
</script>

<template>
  <v-data-table
    :headers="headers"
    :items="users"
    :loading="isLoading"
    item-key="id"
    class="elevation-1 mt-4"
    no-data-text="No se encontraron usuarios."
    loading-text="Cargando usuarios..."
  >
    <template v-slot:item.role="{ item }">
      <v-chip size="small" :color="getRoleColor(item.role)">
        {{ item.role }}
      </v-chip>
    </template>

    <template v-slot:item.actions="{ item }">
      <div class="d-flex justify-center">
        <v-btn icon size="small" color="secondary" class="mr-2" @click="emit('edit', item.id)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <!-- BOTÓN DE ELIMINAR -->
        <v-btn icon size="small" color="error" @click="emit('delete', item.id)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>
    </template>
  </v-data-table>
</template>
