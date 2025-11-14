<script setup lang="ts">
import DeviceForm from './DeviceForm.vue';
import type { Device } from '@/types/Device';
import type { PropType } from 'vue';

defineProps({
  title: { type: String, required: true },
  isSubmitting: Boolean,
  formError: String as PropType<string | null>,
});

const dialog = defineModel<boolean>('dialog', { required: true });
const deviceData = defineModel<Partial<Device>>('deviceData', { required: true });

const emit = defineEmits(['submit', 'cancel']);
</script>

<template>
  <v-dialog v-model="dialog" max-width="800" persistent>
    <v-card>
      <v-card-title class="text-h5 bg-primary text-white">{{ title }}</v-card-title>
      <v-card-text class="pt-4">
        <v-form @submit.prevent="emit('submit')">
          <DeviceForm v-model="deviceData" />
          <v-alert v-if="formError" type="error" density="compact" class="mt-4">
            {{ formError }}
          </v-alert>
        </v-form>
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="emit('cancel')" :disabled="isSubmitting">Cancelar</v-btn>
        <v-btn color="primary" variant="flat" @click="emit('submit')" :loading="isSubmitting">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
