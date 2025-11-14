<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'; // Importa useRoute para obtener info de la ruta actual
import { ref, computed } from 'vue'; // Importa computed para lógica condicional
import { useAuthStore } from '@/stores/useAuthStore'; // Importa el store de autenticación

const route = useRoute(); // Obtiene la información de la ruta actual
const authStore = useAuthStore(); // Obtiene la instancia del store

// Estado local para controlar la visibilidad del sidebar
const drawer = ref(true);

// Título de la aplicación (puedes cambiarlo)
const appTitle = "Helpdesk";

// 1. Propiedad Calculada: ¿Estamos en la ruta de login?
const isLoginRoute = computed(() => route.name === 'login');

// 2. Propiedad Calculada: ¿Deberíamos mostrar la navegación principal?
// Se muestra si el usuario está autenticado Y NO está en la ruta de login.
const showNavigation = computed(() => authStore.isAuthenticated && !isLoginRoute.value);
</script>

<template>
  <v-app>
    <!-- 3. Sidebar (Navigation Drawer) - Se muestra condicionalmente -->
    <v-navigation-drawer v-if="showNavigation" v-model="drawer" app>
      <v-list-item
          :title="appTitle"
          subtitle="Gestión de Soporte"
          class="py-4"
      ></v-list-item>

      <v-divider></v-divider>

      <!-- Menú de Navegación -->
      <v-list density="compact" nav>
        <!-- Común para todos -->
        <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard" to="/" exact></v-list-item>

        <!-- Visible para Agentes/Admins -->
        <v-list-item v-if="authStore.isAgentOrAdmin" prepend-icon="mdi-lifebuoy" title="Tickets (Soporte)" to="/tickets"></v-list-item>
        <v-list-item v-if="authStore.isAgentOrAdmin" prepend-icon="mdi-monitor" title="Patrimonio" to="/assets"></v-list-item>
        <v-list-item v-if="authStore.isAgentOrAdmin" prepend-icon="mdi-chip" title="Componentes" to="/devices"></v-list-item>
        <v-list-item v-if="authStore.isAgentOrAdmin" prepend-icon="mdi-account-group" title="Usuarios" to="/users"></v-list-item>

        <!-- Visible solo para Clientes -->
        <v-list-item v-if="authStore.isClient" prepend-icon="mdi-ticket-account" title="Mis Tickets" to="/my-tickets"></v-list-item>
      </v-list>

      <!-- Botón de Logout al final del Sidebar -->
      <template v-slot:append>
        <div class="pa-2">
          <v-btn block color="red-darken-1" @click="authStore.logout" prepend-icon="mdi-logout">
            Cerrar Sesión
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- 4. Barra Superior (App Bar) - Se muestra condicionalmente -->
    <v-app-bar v-if="showNavigation" app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>{{ appTitle }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- Muestra el nombre del usuario si está disponible -->
      <span v-if="authStore.userName" class="mr-3">{{ authStore.userName }} ({{ authStore.userRole }})</span>
      <!-- Puedes añadir más botones aquí (ej: notificaciones, perfil) -->
    </v-app-bar>

    <!-- 5. Área Principal de Contenido -->
    <v-main>
      <!-- v-container añade padding por defecto. Lo quitamos en el login para que ocupe todo -->
      <v-container fluid :class="{ 'pa-0 ma-0': isLoginRoute }" style="height: 100%;">
        <!-- RouterView siempre muestra el componente de la ruta actual -->
        <RouterView />
      </v-container>
    </v-main>

  </v-app>
</template>

<style scoped>
/* Asegura que v-main pueda ocupar toda la altura si es necesario */
.v-main {
  min-height: 100vh;
}
</style>
