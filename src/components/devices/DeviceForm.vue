<script setup lang="ts">
import type { Device } from '@/types/Device';

const model = defineModel<Partial<Device>>({ required: true });
</script>

<template>
  <v-row>
    <v-col cols="12" sm="6">
      <v-text-field v-model="model.codigoPatrimonial" label="Código de Patrimonio" variant="outlined" class="mb-2"></v-text-field>
      <v-text-field v-model="model.nombreComponente" label="Nombre Componente" variant="outlined" class="mb-2"></v-text-field>
      <v-text-field v-model="model.especificaciones" label="Especificaciones" variant="outlined" class="mb-2"></v-text-field>
    </v-col>
    <v-col cols="12" sm="6">
      <v-text-field v-model="model.marca" label="Marca" variant="outlined" class="mb-2"></v-text-field>
      <v-text-field v-model="model.modelo" label="Modelo" variant="outlined" class="mb-2"></v-text-field>
      <v-text-field v-model="model.serie" label="Serie" variant="outlined" class="mb-2"></v-text-field>
    </v-col>
  </v-row>
</template>
