<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAssetForm } from '@/composables/Assets/useAssetForm';
import { useUserOptions } from '@/composables/Users/useUserOptions';
import { useDeviceOptions } from '@/composables/Devices/useDeviceOptions';
import AssetForm from '@/components/assets/AssetForm.vue';

const route = useRoute();
const assetId = parseInt(route.params.id as string);

const { assetData, isSubmitting, formError, openEditForm, handleSubmit } = useAssetForm(() => {
  alert('Activo actualizado con éxito!');
});

const { userSelectOptions, isLoadingUsers, usersError } = useUserOptions();
const { deviceSelectOptions, isLoadingDevices, devicesError } = useDeviceOptions();

onMounted(() => {
  openEditForm(assetId);
});
</script>

<template>
  <v-container fluid>
    <v-btn icon @click="$router.go(-1)" class="mb-4" title="Volver">
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>
    <h1 class="text-h4 mb-4">Detalles del Activo #{{ assetId }}</h1>
    <v-alert v-if="formError" type="error" closable class="mb-4">
      {{ formError }}
    </v-alert>
    <v-card v-if="!assetData.id && isSubmitting" class="pa-6">
      <v-skeleton-loader type="article, actions"></v-skeleton-loader>
    </v-card>
    <v-card v-else-if="assetData.id" class="pa-6">
      <v-card-title class="text-h5 mb-4">
        {{ assetData.marca }} {{ assetData.modelo }} - {{ assetData.codigoPatrimonial }}
      </v-card-title>
      <v-form @submit.prevent="handleSubmit">
        <AssetForm
          v-model="assetData"
          :user-select-options="userSelectOptions"
          :device-select-options="deviceSelectOptions"
          :is-loading-users="isLoadingUsers"
          :is-loading-devices="isLoadingDevices"
          :users-error="usersError"
          :devices-error="devicesError"
        />
        <v-divider class="my-4"></v-divider>
        <v-btn type="submit" color="success" size="large" :loading="isSubmitting" prepend-icon="mdi-content-save">
          Guardar Cambios
        </v-btn>
      </v-form>
    </v-card>
    <v-alert v-else-if="!isSubmitting" type="info" class="mt-4">
      Activo no encontrado o no existe.
    </v-alert>
  </v-container>
</template>
