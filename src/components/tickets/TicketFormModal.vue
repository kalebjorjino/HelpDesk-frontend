<script setup lang="ts">
import { ref } from 'vue';
import TicketForm from './TicketForm.vue';
import type { Ticket } from '@/types/Ticket';
import type { PropType } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  isEditMode: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  isSubmitting: Boolean,
  formError: String as PropType<string | null>,
  priorityOptions: { type: Array as PropType<any[]>, required: true },
  statusOptions: { type: Array as PropType<any[]>, required: true },
  clientUserOptions: { type: Array as PropType<any[]>, required: true },
  agentUserOptions: { type: Array as PropType<any[]>, required: true },
  deviceSelectOptions: { type: Array as PropType<any[]>, required: true },
  isLoadingUsers: Boolean,
  isLoadingDevices: Boolean,
  filteredEquipos: { type: Array as PropType<any[]>, required: true },
  isLoadingFilteredEquipos: { type: Boolean, default: false },
});

const dialog = defineModel<boolean>('dialog', { required: true });
const ticketData = defineModel<Partial<Ticket>>('ticketData', { required: true });

const emit = defineEmits(['submit', 'cancel']);
const ticketFormRef = ref<any>(null); // Referencia al componente hijo

const handleSubmit = async () => {
  // Acceder al formulario dentro del componente hijo y validarlo
  if (ticketFormRef.value && ticketFormRef.value.form) {
    const { valid } = await ticketFormRef.value.form.validate();
    if (valid) {
      emit('submit');
    }
  } else {
    // Fallback si no se puede acceder al formulario (no debería pasar)
    emit('submit');
  }
};

</script>

<template>
  <v-dialog v-model="dialog" max-width="800px" persistent>
    <v-card>
      <v-card-title class="text-h5 bg-primary text-white">{{ title }}</v-card-title>
      <v-card-text class="pt-4">
        <!-- Asignar ref al componente -->
        <TicketForm
          ref="ticketFormRef"
          v-model="ticketData"
          :is-edit-mode="isEditMode"
          :priority-options="props.priorityOptions"
          :status-options="props.statusOptions"
          :client-user-options="props.clientUserOptions"
          :agent-user-options="props.agentUserOptions"
          :device-select-options="props.deviceSelectOptions"
          :is-loading-users="props.isLoadingUsers"
          :is-loading-devices="props.isLoadingDevices"
          :filtered-equipos="props.filteredEquipos"
          :is-loading-filtered-equipos="props.isLoadingFilteredEquipos"
        />
        <v-alert v-if="formError" type="error" density="compact" class="mt-4">{{ formError }}</v-alert>
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="emit('cancel')">Cancelar</v-btn>
        <v-btn v-if="!props.isLocked" color="primary" variant="flat" @click="handleSubmit" :loading="isSubmitting">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
