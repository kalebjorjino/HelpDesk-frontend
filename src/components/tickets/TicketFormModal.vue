<script setup lang="ts">
import { ref, computed } from 'vue';
import TicketForm from './TicketForm.vue';
import type { Ticket } from '@/types/Ticket';
import type { PropType } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';

const authStore = useAuthStore();

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
const ticketData = defineModel<Partial<Ticket & { tecnicoAsignadoId?: number | null }>>('ticketData', { required: true });

const emit = defineEmits(['submit', 'cancel']);
const ticketFormRef = ref<any>(null);

// Computed property to check if the technician can edit
const canTechnicianEdit = computed(() => {
    // Si es tecnico y esta en modo edicion, SOLO si es SU ticket.
    if (props.isEditMode && authStore.isTechnician) {
        return ticketData.value.tecnicoAsignadoId === authStore.userId;
    }
    return true; // Admin and others can edit/view
});

const canSave = computed(() => {
  if (authStore.isAdmin) return true; // Admin siempre puede guardar (incluso para reasignar o cambiar estado)
  if (props.isLocked) return false; // Si esta bloqueado y no es admin, nadie guarda
  return canTechnicianEdit.value; // Tecnico solo si es suyo
});


const handleSubmit = async () => {
  if (ticketFormRef.value && ticketFormRef.value.form) {
    const { valid } = await ticketFormRef.value.form.validate();
    if (valid) {
      emit('submit');
    }
  } else {
    emit('submit');
  }
};

</script>

<template>
  <v-dialog v-model="dialog" max-width="800px" persistent>
    <v-card>
      <v-card-title class="text-h5 bg-primary text-white">{{ title }}</v-card-title>
      <v-card-text class="pt-4">
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
        <v-btn v-if="canSave" color="primary" variant="flat" @click="handleSubmit" :loading="isSubmitting">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

