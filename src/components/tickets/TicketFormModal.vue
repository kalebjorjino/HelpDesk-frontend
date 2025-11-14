<script setup lang="ts">
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
  // CORRECCIÓN: Nuevas props para las listas filtradas
  clientUserOptions: { type: Array as PropType<any[]>, required: true },
  agentUserOptions: { type: Array as PropType<any[]>, required: true },
  assetSelectOptions: { type: Array as PropType<any[]>, required: true },
  deviceSelectOptions: { type: Array as PropType<any[]>, required: true },
  isLoadingUsers: Boolean,
  isLoadingAssets: Boolean,
  isLoadingDevices: Boolean,
});

const dialog = defineModel<boolean>('dialog', { required: true });
const ticketData = defineModel<Partial<Ticket>>('ticketData', { required: true });

const emit = defineEmits(['submit', 'cancel']);

</script>

<template>
  <v-dialog v-model="dialog" max-width="800px" persistent>
    <v-card>
      <v-card-title class="text-h5 bg-primary text-white">{{ title }}</v-card-title>
      <v-card-text class="pt-4">
        <v-form @submit.prevent="emit('submit')">
          <TicketForm
            v-model="ticketData"
            :is-edit-mode="isEditMode"
            :priority-options="props.priorityOptions"
            :status-options="props.statusOptions"
            :client-user-options="props.clientUserOptions"
            :agent-user-options="props.agentUserOptions"
            :asset-select-options="props.assetSelectOptions"
            :device-select-options="props.deviceSelectOptions"
            :is-loading-users="props.isLoadingUsers"
            :is-loading-assets="props.isLoadingAssets"
            :is-loading-devices="props.isLoadingDevices"
          />
          <v-alert v-if="formError" type="error" density="compact" class="mt-4">{{ formError }}</v-alert>
        </v-form>
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="emit('cancel')">Cancelar</v-btn>
        <v-btn v-if="!props.isLocked" color="primary" variant="flat" @click="emit('submit')" :loading="isSubmitting">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
