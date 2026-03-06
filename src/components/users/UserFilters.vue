<script setup lang="ts">
import type { PropType } from 'vue';
import type { UserRole } from '@/types/User';

const props = defineProps({
  roleOptions: {
    type: Array as PropType<{ title: string, value: UserRole | undefined }[]>,
    required: true,
  },
});

// Definir modelos separados para mayor claridad y reactividad
const search = defineModel<string>('search');
const role = defineModel<UserRole | undefined>('role');
</script>

<template>
  <v-row class="mb-4">
    <v-col cols="12" md="4">
      <v-text-field
        v-model="search"
        label="Buscar usuario..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
        clearable
      ></v-text-field>
    </v-col>
    <v-col cols="12" md="4">
      <v-select
        v-model="role"
        :items="roleOptions"
        label="Filtrar por Rol"
        variant="outlined"
        density="compact"
        hide-details
        item-title="title"
        item-value="value"
        clearable
      ></v-select>
    </v-col>
  </v-row>
</template>
