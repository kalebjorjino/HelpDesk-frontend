<script setup lang="ts">
import type { User, UserRole } from '@/types/User';
import type { PropType } from 'vue';

// The form will receive the role options and a flag to know if it's in edit mode
defineProps({
  roleOptions: {
    type: Array as PropType<UserRole[]>,
    required: true,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
});

// Use defineModel for a clean two-way binding with the parent component's data object
const model = defineModel<Partial<User>>({ required: true });

</script>

<template>
  <v-row>
    <v-col cols="12" sm="6">
      <v-text-field v-model="model.codigoEmpleado" label="Código de Empleado" variant="outlined" class="mb-2" />
      <v-text-field v-model="model.nombreCompleto" label="Nombre Completo" variant="outlined" class="mb-2" />
      <v-text-field v-model="model.dni" label="DNI" variant="outlined" class="mb-2" />
      <v-text-field v-model="model.cargo" label="Cargo" variant="outlined" class="mb-2" />
      <v-text-field v-model="model.email" label="Email" type="email" variant="outlined" class="mb-2" />
    </v-col>
    <v-col cols="12" sm="6">
      <v-text-field v-model="model.departamento" label="Departamento" variant="outlined" class="mb-2" />
      <v-text-field v-model="model.unidad" label="Unidad" variant="outlined" class="mb-2" />
      <v-text-field v-model="model.area" label="Área" variant="outlined" class="mb-2" />
      <v-select v-model="model.role" :items="roleOptions" label="Rol" variant="outlined" class="mb-2" />
      <v-text-field
        v-model="model.password"
        :label="isEditMode ? 'Nueva Contraseña (Opcional)' : 'Contraseña'"
        type="password"
        variant="outlined"
        clearable
        :hint="isEditMode ? 'Dejar en blanco para no cambiar' : ''"
        persistent-hint
      ></v-text-field>
    </v-col>
  </v-row>
</template>
