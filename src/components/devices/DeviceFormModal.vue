<script setup lang="ts">
import { ref, watch } from 'vue';
import { useDeviceStore } from '@/stores/useDeviceStore';

const props = defineProps({
  isEditMode: { type: Boolean, default: false },
});

const dialog = defineModel<boolean>('dialog', { required: true });
const deviceData = defineModel<any>('deviceData', { required: true });

const emit = defineEmits(['success']);

const deviceStore = useDeviceStore();
const isSubmitting = ref(false);
const formError = ref<string | null>(null);
const form = ref<any>(null); // Referencia al formulario

// Reglas de validación
const rules = {
  required: (value: any) => !!value || 'Este campo es requerido.',
};

const handleSubmit = async () => {
  // Validar el formulario antes de enviar
  const { valid } = await form.value.validate();
  if (!valid) return;

  isSubmitting.value = true;
  formError.value = null;
  try {
    if (props.isEditMode) {
      await deviceStore.updateDevice(deviceData.value.id, deviceData.value);
    } else {
      await deviceStore.createDevice(deviceData.value);
    }
    emit('success');
  } catch (error: any) {
    formError.value = error.message;
  } finally {
    isSubmitting.value = false;
  }
};

const closeDialog = () => {
  dialog.value = false;
  formError.value = null;
};

watch(dialog, (newValue) => {
  if (!newValue) {
    formError.value = null;
  }
});
</script>

<template>
  <v-dialog v-model="dialog" max-width="600px" persistent>
    <v-card>
      <v-card-title class="text-h5 bg-primary text-white">
        {{ isEditMode ? 'Editar Componente' : 'Registrar Nuevo Componente' }}
      </v-card-title>

      <v-card-text class="pt-4">
        <v-form ref="form" @submit.prevent="handleSubmit">
          <v-text-field v-model="deviceData.nombreComponente" label="Nombre del Componente" variant="outlined" :rules="[rules.required]" class="mb-3"></v-text-field>
          <v-text-field v-model="deviceData.codigoPatrimonial" label="Código Patrimonial" variant="outlined" :rules="[rules.required]" class="mb-3"></v-text-field>
          <v-text-field v-model="deviceData.marca" label="Marca" variant="outlined" :rules="[rules.required]" class="mb-3"></v-text-field>
          <v-text-field v-model="deviceData.modelo" label="Modelo" variant="outlined" :rules="[rules.required]" class="mb-3"></v-text-field>
          <v-text-field v-model="deviceData.serie" label="Número de Serie" variant="outlined" :rules="[rules.required]" class="mb-3"></v-text-field>
          <v-textarea v-model="deviceData.especificaciones" label="Especificaciones" variant="outlined" rows="3" class="mb-3"></v-textarea>
        </v-form>
        <v-alert v-if="formError" type="error" density="compact" class="mt-4">{{ formError }}</v-alert>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="closeDialog">Cancelar</v-btn>
        <v-btn color="primary" variant="flat" @click="handleSubmit" :loading="isSubmitting">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
