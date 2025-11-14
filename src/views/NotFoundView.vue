<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/'); // Navigate to the dashboard
};
</script>

<template>
  <v-container fluid fill-height class="d-flex align-center justify-center bg-grey-lighten-4">
    <v-card class="pa-8 text-center elevation-4" max-width="500">
      <v-icon size="80" color="warning">mdi-alert-circle-outline</v-icon>
      <h1 class="text-h3 mt-4 mb-2 font-weight-bold">404</h1>
      <p class="text-h6 text-grey-darken-1 mb-6">Página No Encontrada</p>
      <p class="mb-8">Lo sentimos, la página que buscas no existe o ha sido movida.</p>
      <v-btn color="primary" size="large" @click="goHome" prepend-icon="mdi-home">
        Ir al Inicio
      </v-btn>
    </v-card>
  </v-container>
</template>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
