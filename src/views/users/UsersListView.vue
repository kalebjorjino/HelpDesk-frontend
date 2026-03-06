<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUsersView } from '@/composables/Users/useUsersView';
import { useUserForm } from '@/composables/Users/useUserForm';
import UserFormModal from '@/components/users/UserFormModal.vue';
import UserFilters from '@/components/users/UserFilters.vue';
import UsersTable from '@/components/users/UsersTable.vue';

// Obtener las refs individuales
const { users, isLoading, fetchError, searchQuery, roleFilter, refreshUsers, roleOptions, deleteUser } = useUsersView();

const {
  dialog,
  isEditMode,
  userData,
  isSubmitting,
  formError,
  openCreateForm,
  openEditForm,
  handleSubmit,
  handleCancel
} = useUserForm(refreshUsers);

const headers = [
  { title: 'Código', key: 'codigoEmpleado', width: '100px' },
  { title: 'Usuario', key: 'username' },
  { title: 'Nombre Completo', align: 'start', key: 'nombreCompleto' },
  { title: 'Correo Electrónico', key: 'email' },
  { title: 'Rol', key: 'role', width: '120px' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center', width: '100px' },
];

const modalTitle = computed(() => {
  return isEditMode.value ? `Editar Usuario: ${userData.value.username}` : 'Crear Nuevo Usuario';
});

</script>

<template>
  <v-container fluid>
    <v-card class="pa-4">
      <v-card-title class="d-flex justify-space-between align-center">
        <h1 class="text-h4">Gestión de Usuarios</h1>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateForm">Nuevo Usuario</v-btn>
      </v-card-title>

      <!-- CONEXIÓN DE FILTROS SIMPLIFICADA -->
      <UserFilters
        v-model:search="searchQuery"
        v-model:role="roleFilter"
        :role-options="roleOptions"
      />

      <v-alert v-if="fetchError" type="error" closable class="my-4">
        {{ fetchError }}
        <v-btn class="ml-4" color="white" variant="text" @click="refreshUsers">Reintentar</v-btn>
      </v-alert>

      <UsersTable
        :headers="headers"
        :users="users"
        :is-loading="isLoading"
        @edit="openEditForm"
        @delete="deleteUser"
      />
    </v-card>

    <UserFormModal
      v-model:dialog="dialog"
      v-model:userData="userData"
      :title="modalTitle"
      :role-options="roleOptions"
      :is-edit-mode="isEditMode"
      :is-submitting="isSubmitting"
      :form-error="formError"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </v-container>
</template>
