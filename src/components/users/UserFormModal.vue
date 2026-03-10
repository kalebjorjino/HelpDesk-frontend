<script setup lang="ts">
import { ref, watch } from 'vue';
import type { PropType } from 'vue';
import type { User, UserRole } from '@/types/User';

const props = defineProps({
  title: { type: String, required: true },
  roleOptions: {
    type: Array as PropType<{ title: string, value: UserRole | undefined }[]>,
    required: true,
  },
  isEditMode: { type: Boolean, default: false },
  isSubmitting: { type: Boolean, default: false },
  formError: { type: String as PropType<string | null>, default: null },
});

const dialog = defineModel<boolean>('dialog', { required: true });
const userData = defineModel<Partial<User>>('userData', { required: true });

const emit = defineEmits(['submit', 'cancel']);
const form = ref<any>(null);

const rules = {
  required: (value: any) => !!value || 'Este campo es requerido.',
  email: (value: string) => /.+@.+\..+/.test(value) || 'Debe ser un correo válido.',
};

const handleSubmit = async () => {
  const { valid } = await form.value.validate();
  if (valid) {
    emit('submit');
  }
};

</script>

<template>
  <v-dialog v-model="dialog" max-width="600px" persistent>
    <v-card>
      <v-card-title class="text-h5 bg-primary text-white">{{ title }}</v-card-title>
      <v-card-text class="pt-4">
        <v-form ref="form" @submit.prevent="handleSubmit">
          <v-text-field
            v-model="userData.nombreCompleto"
            label="Nombre Completo"
            variant="outlined"
            :rules="[rules.required]"
            class="mb-3"
          ></v-text-field>

          <v-text-field
            v-model="userData.codigoEmpleado"
            label="Código de Empleado"
            variant="outlined"
            class="mb-3"
          ></v-text-field>

          <v-text-field
            v-model="userData.dni"
            label="DNI"
            variant="outlined"
            class="mb-3"
          ></v-text-field>

          <v-text-field
            v-model="userData.email"
            label="Correo Electrónico"
            variant="outlined"
            :rules="[rules.required, rules.email]"
            class="mb-3"
          ></v-text-field>

          <v-select
            v-model="userData.role"
            :items="roleOptions.filter(r => r.value !== undefined)"
            label="Rol"
            variant="outlined"
            :rules="[rules.required]"
            class="mb-3"
            item-title="title"
            item-value="value"
          ></v-select>

          <v-text-field
            v-model="userData.cargo"
            label="Cargo"
            variant="outlined"
            class="mb-3"
          ></v-text-field>

          <v-text-field
            v-model="userData.departamento"
            label="Departamento"
            variant="outlined"
            class="mb-3"
          ></v-text-field>

          <v-text-field
            v-model="userData.unidad"
            label="Unidad"
            variant="outlined"
            class="mb-3"
          ></v-text-field>

          <v-text-field
            v-model="userData.area"
            label="Área"
            variant="outlined"
            class="mb-3"
          ></v-text-field>

          <v-text-field
            v-if="!isEditMode"
            v-model="userData.password"
            label="Contraseña"
            type="password"
            variant="outlined"
            :rules="[rules.required]"
            class="mb-3"
          ></v-text-field>

          <v-text-field
            v-if="isEditMode"
            v-model="userData.password"
            label="Nueva Contraseña"
            type="password"
            variant="outlined"
            class="mb-3"
            hint="Dejar en blanco para no cambiar la contraseña"
            persistent-hint
            clearable
          ></v-text-field>

          <v-alert v-if="formError" type="error" density="compact" class="mt-4">
            {{ formError }}
          </v-alert>
        </v-form>
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="emit('cancel')">Cancelar</v-btn>
        <v-btn color="primary" variant="flat" @click="handleSubmit" :loading="isSubmitting">
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
