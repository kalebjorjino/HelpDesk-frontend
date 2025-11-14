<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAssetStore } from '@/stores/useAssetStore';
import type { PropType } from 'vue';

const props = defineProps({
  isEditMode: { type: Boolean, default: false },
  userSelectOptions: {
    type: Array as PropType<any[]>,
    required: true,
  },
  deviceSelectOptions: {
    type: Array as PropType<any[]>,
    required: true,
  },
  isLoadingUsers: { type: Boolean, default: false },
  isLoadingDevices: { type: Boolean, default: false },
});

const dialog = defineModel<boolean>('dialog', { required: true });
const assetData = defineModel<any>('assetData', { required: true });

const emit = defineEmits(['success']);

const assetStore = useAssetStore();
const isSubmitting = ref(false);
const formError = ref<string | null>(null);

const handleSubmit = async () => {
  isSubmitting.value = true;
  formError.value = null;
  try {
    if (props.isEditMode) {
      await assetStore.updateAsset(assetData.value.id, assetData.value);
    } else {
      await assetStore.createAsset(assetData.value);
    }
    emit('success');
  } catch (error: any) {
    formError.value = error.message;
  } finally {
    isSubmitting.value = false;
  }
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
      <v-card-title class="text-h5 bg-primary text-white">{{ isEditMode ? 'Editar Equipo' : 'Registrar Nuevo Equipo' }}</v-card-title>
      <v-card-text class="pt-4">
        <v-form @submit.prevent="handleSubmit">
          <v-text-field v-model="assetData.codigoPatrimonial" label="Código Patrimonial" variant="outlined" required class="mb-3"></v-text-field>
          <v-text-field v-model="assetData.serie" label="Número de Serie" variant="outlined" class="mb-3"></v-text-field>
          <v-text-field v-model="assetData.marca" label="Marca" variant="outlined" class="mb-3"></v-text-field>
          <v-text-field v-model="assetData.modelo" label="Modelo" variant="outlined" class="mb-3"></v-text-field>
          <v-text-field v-model="assetData.ip" label="Dirección IP" variant="outlined" class="mb-3"></v-text-field>
          <v-text-field v-model="assetData.departamento" label="Departamento" variant="outlined" class="mb-3"></v-text-field>
          <v-text-field v-model="assetData.unidad" label="Unidad" variant="outlined" class="mb-3"></v-text-field>

          <v-autocomplete
            v-model="assetData.usuarioAsignadoId"
            :items="userSelectOptions"
            item-title="title"
            item-value="value"
            label="Asignar a Usuario (Opcional)"
            variant="outlined"
            :loading="isLoadingUsers"
            clearable
            class="mb-3"
          ></v-autocomplete>

          <v-autocomplete
            v-model="assetData.deviceAsignadoId"
            :items="deviceSelectOptions"
            item-title="title"
            item-value="value"
            label="Asignar a Componente (Opcional)"
            variant="outlined"
            :loading="isLoadingDevices"
            clearable
          ></v-autocomplete>

        </v-form>
        <v-alert v-if="formError" type="error" density="compact" class="mt-4">{{ formError }}</v-alert>
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="dialog = false">Cancelar</v-btn>
        <v-btn color="primary" variant="flat" @click="handleSubmit" :loading="isSubmitting">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
