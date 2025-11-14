<script setup lang="ts">
import type { Asset } from '@/types/Asset';
import type { PropType } from 'vue';

// The form receives all options and their states for the autocomplete fields
defineProps({
  userSelectOptions: {
    type: Array as PropType<{ title: string; value: number }[]>,
    required: true,
  },
  deviceSelectOptions: {
    type: Array as PropType<{ title: string; value: number }[]>,
    required: true,
  },
  isLoadingUsers: Boolean,
  isLoadingDevices: Boolean,
  usersError: String as PropType<string | null>,
  devicesError: String as PropType<string | null>,
});

// Two-way binding for the asset data
const model = defineModel<Partial<Asset>>({ required: true });

</script>

<template>
  <v-row>
    <v-col cols="12" sm="6">
      <v-text-field v-model="model.codigoPatrimonial" label="Código Patrimonial" variant="outlined" class="mb-3" />
      <v-text-field v-model="model.marca" label="Marca" variant="outlined" class="mb-3" />
      <v-text-field v-model="model.modelo" label="Modelo" variant="outlined" class="mb-3" />
      <v-text-field v-model="model.ip" label="Dirección IP" variant="outlined" class="mb-3" />
    </v-col>
    <v-col cols="12" sm="6">
      <v-text-field v-model="model.serie" label="Número de Serie" variant="outlined" class="mb-3" />
      <v-text-field v-model="model.departamento" label="Departamento" variant="outlined" class="mb-3" />
      <v-text-field v-model="model.unidad" label="Unidad" variant="outlined" class="mb-3" />
      <v-autocomplete
        v-model="model.usuarioAsignadoId"
        :items="userSelectOptions"
        item-title="title"
        item-value="value"
        label="Usuario Asignado"
        variant="outlined"
        :loading="isLoadingUsers"
        :error-messages="usersError || undefined"
        clearable
        class="mb-3"
      ></v-autocomplete>
      <v-autocomplete
        v-model="model.deviceAsignadoId"
        :items="deviceSelectOptions"
        item-title="title"
        item-value="value"
        label="Dispositivo Asignado"
        variant="outlined"
        :loading="isLoadingDevices"
        :error-messages="devicesError || undefined"
        clearable
        class="mb-3"
      ></v-autocomplete>
    </v-col>
  </v-row>
</template>
