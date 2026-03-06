<script setup lang="ts">
const filters = defineModel<{ search: string }>('filters', { required: true });
</script>

<template>
  <v-row class="mb-4 mt-2">
    <v-col cols="12" md="6">
      <v-text-field
        v-model="filters.search"
        label="Buscar por código, marca o modelo..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
        clearable
      ></v-text-field>
    </v-col>
  </v-row>
</template>
