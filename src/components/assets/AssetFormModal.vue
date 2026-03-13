<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAssetStore } from '@/stores/useAssetStore';
import type { PropType } from 'vue';

const props = defineProps({
  isEditMode: { type: Boolean, default: false },
  userSelectOptions: { type: Array as PropType<any[]>, required: true },
  deviceSelectOptions: { type: Array as PropType<any[]>, required: true },
  isLoadingUsers: { type: Boolean, default: false },
  isLoadingDevices: { type: Boolean, default: false },
});

const dialog = defineModel<boolean>('dialog', { required: true });
const assetData = defineModel<any>('assetData', { required: true });

const emit = defineEmits(['success']);

const assetStore = useAssetStore();
const isSubmitting = ref(false);
const formError = ref<string | null>(null);
const form = ref<any>(null);

// --- OPCIONES PARA EL NUEVO CAMPO ESTADO ---
const estadoOptions = [
  { title: 'Bueno', value: 'BUENO' },
  { title: 'Regular', value: 'REGULAR' },
  { title: 'Malo', value: 'MALO' },
  { title: 'Baja Patrimonial', value: 'BAJA_PATRIMONIAL' },
];

const rules = {
  required: (value: any) => !!value || 'Este campo es requerido.',
};

const handleSubmit = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;

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
  <v-dialog v-model="dialog" max-width="800px" persistent>
    <v-card>
      <v-card-title class="text-h5 bg-primary text-white">{{ isEditMode ? 'Editar Equipo' : 'Registrar Nuevo Equipo' }}</v-card-title>
      <v-card-text class="pt-4">
        <v-form ref="form" @submit.prevent="handleSubmit">
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field v-model="assetData.codigoPatrimonial" label="Código Patrimonial" variant="outlined" :rules="[rules.required]" class="mb-3"></v-text-field>
              <v-text-field v-model="assetData.hostname" label="Hostname" variant="outlined" :rules="[rules.required]" class="mb-3"></v-text-field>
              <v-text-field v-model="assetData.serie" label="Número de Serie" variant="outlined" :rules="[rules.required]" class="mb-3"></v-text-field>
              <v-text-field v-model="assetData.marca" label="Marca" variant="outlined" :rules="[rules.required]" class="mb-3"></v-text-field>
              <v-text-field v-model="assetData.modelo" label="Modelo" variant="outlined" :rules="[rules.required]" class="mb-3"></v-text-field>
              <v-text-field v-model="assetData.disco" label="Disco" variant="outlined" :rules="[rules.required]" class="mb-3"></v-text-field>
              <v-text-field v-model="assetData.memoria" label="Memoria" variant="outlined" :rules="[rules.required]" class="mb-3"></v-text-field>
              <v-text-field v-model="assetData.procesador" label="Procesador" variant="outlined" :rules="[rules.required]" class="mb-3"></v-text-field>
              
              <!-- NUEVO CAMPO DE ESTADO -->
              <v-select
                v-model="assetData.estado"
                :items="estadoOptions"
                label="Condición / Estado"
                variant="outlined"
                :rules="[rules.required]"
                class="mb-3"
              ></v-select>

              <v-text-field
                v-model="assetData.fechaCompra"
                label="Fecha de Compra"
                type="date"
                variant="outlined"
                class="mb-3"
                hide-details="auto"
              ></v-text-field>

              <v-text-field
  v-model="assetData.fechaFinGarantia"
  label="Vencimiento de Garantía"
  type="date"
  variant="outlined"
  class="mb-3"
  hide-details="auto"
  hint="Fecha en que expira la garantía"
  persistent-hint
></v-text-field>
            

            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="assetData.ip" label="Dirección IP" variant="outlined" class="mb-3"></v-text-field>
              <v-text-field v-model="assetData.departamento" label="Departamento" variant="outlined" class="mb-3"></v-text-field>
              <v-text-field v-model="assetData.unidad" label="Unidad" variant="outlined" class="mb-3"></v-text-field>
              <v-text-field v-model="assetData.oficina" label="Oficina" variant="outlined" class="mb-3"></v-text-field>
              <v-text-field v-model="assetData.servicio" label="Servicio" variant="outlined" class="mb-3"></v-text-field>

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
            </v-col>
          </v-row>
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
