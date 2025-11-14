<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUsersView } from '@/composables/Users/useUsersView';
import { useAuthStore } from '@/stores/useAuthStore';
import type { User, UserRole } from '@/types/User';
import UsersTable from '@/components/users/UsersTable.vue';
import UserFormModal from '@/components/users/UserFormModal.vue';
import { useUserForm } from '@/composables/Users/useUserForm'; // Import the new composable

// --- State Management ---
const { users, isLoading, fetchError, refreshUsers, deleteUser } = useUsersView();
const authStore = useAuthStore();
const isAdmin = authStore.isAdmin;

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

// --- UI Configuration ---
const headers = [
  { title: 'ID', align: 'start', key: 'id', width: '50px' },
  { title: 'Cód. Empleado', key: 'codigoEmpleado' },
  { title: 'Nombre Completo', key: 'nombreCompleto' },
  { title: 'Email', key: 'email' },
  { title: 'Rol', key: 'role' },
  { title: 'DNI', key: 'dni' },
  { title: 'Cargo', key: 'cargo' },
  { title: 'Acciones', key: 'actions', sortable: false, width: '100px' },
];

const roleOptions: UserRole[] = ['USER', 'TECHNICIAN', 'ADMIN'];

const modalTitle = computed(() => (isEditMode.value ? 'Editar Usuario' : 'Registrar Nuevo Usuario'));

// --- Event Handlers ---
const handleDelete = async (id: number, name: string) => {
  if (confirm(`¿Está seguro de que desea eliminar al usuario ${name} (ID: ${id})?`)) {
    try {
      await deleteUser(id);
      // The list should refresh automatically via the store
    } catch (err) {
      console.error('Error deleting user:', err);
      // Optionally show a notification to the user
    }
  }
};

</script>

<template>
  <v-container fluid>
    <h1 class="text-h4 mb-4">Gestión de Usuarios</h1>
    <v-card class="pa-4">
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Inventario Total ({{ users.length }})</span>
        <v-btn v-if="isAdmin" color="primary" prepend-icon="mdi-plus" @click="openCreateForm">
          Registrar Usuario
        </v-btn>
      </v-card-title>

      <v-alert v-if="fetchError" type="error" closable class="my-4">
        {{ fetchError }}
      </v-alert>

      <UsersTable
        :headers="headers"
        :users="users"
        :is-loading="isLoading"
        :is-admin="isAdmin"
        @edit-user="openEditForm"
        @delete-user="handleDelete"
      />
    </v-card>

    <!-- Unified User Form Modal -->
    <UserFormModal
      v-model:dialog="dialog"
      v-model:userData="userData"
      :title="modalTitle"
      :role-options="roleOptions"
      :is-submitting="isSubmitting"
      :form-error="formError"
      :is-edit-mode="isEditMode"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </v-container>
</template>
