<script setup lang="ts">
import UserForm from './UserForm.vue';
import type { User, UserRole } from '@/types/User';
import type { PropType } from 'vue';

// The modal receives all the necessary data and state from the parent view
defineProps({
  title: {
    type: String,
    required: true,
  },
  roleOptions: {
    type: Array as PropType<UserRole[]>,
    required: true,
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
  formError: {
    type: String as PropType<string | null>,
    default: null,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
});

// Use defineModel for two-way binding on the dialog's visibility and the user data
const dialog = defineModel<boolean>('dialog', { required: true });
const userData = defineModel<Partial<User>>('userData', { required: true });

const emit = defineEmits(['submit', 'cancel']);

</script>

<template>
  <v-dialog v-model="dialog" max-width="800" persistent>
    <v-card>
      <v-card-title class="text-h5 bg-primary text-white">{{ title }}</v-card-title>
      <v-card-text class="pt-4">
        <v-form @submit.prevent="emit('submit')">
          <!-- The reusable form component is placed here -->
          <UserForm
            v-model="userData"
            :role-options="roleOptions"
            :is-edit-mode="isEditMode"
          />

          <v-alert v-if="formError" type="error" density="compact" class="mt-4">
            {{ formError }}
          </v-alert>
        </v-form>
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="emit('cancel')" :disabled="isSubmitting">Cancelar</v-btn>
        <v-btn color="primary" variant="flat" @click="emit('submit')" :loading="isSubmitting" :disabled="isSubmitting">Guardar Cambios</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
