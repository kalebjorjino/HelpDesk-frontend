<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useUserForm } from '@/composables/Users/useUserForm';
import UserForm from '@/components/users/UserForm.vue';
import type { UserRole } from '@/types/User';

const route = useRoute();
const userId = parseInt(route.params.id as string);

// 1. Reutilizamos el mismo composable del formulario que usamos en la vista de lista
const {
  isEditMode,
  userData,
  isSubmitting,
  formError,
  openEditForm, // Usaremos esta función para cargar los datos del usuario
  handleSubmit, // Usaremos esta función para guardar los cambios
} = useUserForm(() => {
  // Callback opcional en caso de éxito
  alert('Usuario actualizado con éxito!');
});

// 2. Cuando el componente se monta, cargamos los datos del usuario
onMounted(() => {
  openEditForm(userId);
});

// 3. Opciones de roles (esto podría incluso moverse al composable si siempre son las mismas)
const roleOptions: UserRole[] = ['USER', 'TECHNICIAN', 'ADMIN'];

</script>

<template>
  <v-container fluid>
    <v-btn icon @click="$router.go(-1)" class="mb-4" title="Volver">
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>

    <h1 class="text-h4 mb-4">Detalles del Usuario #{{ userId }}</h1>

    <v-alert v-if="formError" type="error" closable class="mb-4">
      {{ formError }}
    </v-alert>

    <v-card v-if="!userData.id && isSubmitting" class="pa-6">
      <v-skeleton-loader type="article, actions"></v-skeleton-loader>
    </v-card>

    <v-card v-else-if="userData.id" class="pa-6">
      <v-card-title class="text-h5 mb-4">
        {{ userData.nombreCompleto || 'Detalles de Usuario' }}
        <v-chip
          v-if="userData.role"
          :color="userData.role === 'ADMIN' ? 'error' : userData.role === 'TECHNICIAN' ? 'info' : 'success'"
          size="small"
          class="ml-3"
        >
          {{ userData.role }}
        </v-chip>
      </v-card-title>

      <!-- 4. Usamos el componente de formulario reutilizable -->
      <v-form @submit.prevent="handleSubmit">
        <UserForm
          v-model="userData"
          :role-options="roleOptions"
          :is-edit-mode="isEditMode"
        />

        <v-divider class="my-4"></v-divider>

        <v-btn
          type="submit"
          color="success"
          size="large"
          :loading="isSubmitting"
          prepend-icon="mdi-content-save"
        >
          Guardar Cambios
        </v-btn>
      </v-form>
    </v-card>

    <v-alert v-else-if="!isSubmitting" type="info" class="mt-4">
      Usuario no encontrado o no existe.
    </v-alert>
  </v-container>
</template>
