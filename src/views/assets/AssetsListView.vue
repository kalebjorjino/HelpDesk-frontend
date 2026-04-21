<script setup lang="ts">
import { ref } from 'vue';
import { useAssetsView } from '@/composables/Assets/useAssetsView';
import { useUserOptions } from '@/composables/Users/useUserOptions';
import { useDeviceOptions } from '@/composables/Devices/useDeviceOptions';
import { useExcelExport } from '@/composables/useExcelExport';
import { useAuthStore } from '@/stores/useAuthStore'; // <-- Importar authStore
import AssetFormModal from '@/components/assets/AssetFormModal.vue';
import AssetFilters from '@/components/assets/AssetFilters.vue';
import AssetHistory from '@/components/assets/AssetHistory.vue';

const authStore = useAuthStore(); // <-- Usar authStore

// --- LÓGICA DE GARANTÍA ---
const getGarantiaStatus = (fechaFin: string | undefined) => {
  if (!fechaFin) return { text: 'Sin Info', color: 'grey-lighten-1', icon: 'mdi-help-circle' };

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // Comparar solo fechas
  const fin = new Date(fechaFin);
  fin.setDate(fin.getDate() + 1); // Ajuste de zona horaria
  fin.setHours(0, 0, 0, 0);

  if (fin >= hoy) {
    return { text: 'Vigente', color: 'success', icon: 'mdi-check-circle' };
  } else {
    return { text: 'Vencida', color: 'error', icon: 'mdi-alert-circle' };
  }
};

// --- LÓGICA DE COLORES DE ESTADO ---
const getStatusColor = (estado: string) => {
  if (!estado) return 'grey';
  switch (estado) {
    case 'BUENO': return 'success';
    case 'REGULAR': return 'warning';
    case 'MALO': return 'error';
    case 'BAJA_PATRIMONIAL': return 'grey-darken-3';
    default: return 'primary';
  }
};

// --- COMPOSABLES ---
const { assets, headers, loading, error, loadData, deleteAsset, filters } = useAssetsView();
const { exportToExcel } = useExcelExport();
const { allUserOptions, isLoadingUsers } = useUserOptions();
const { deviceSelectOptions, isLoadingDevices } = useDeviceOptions();

// --- ESTADO DE DIÁLOGOS ---
const dialog = ref(false);
const isEditMode = ref(false);
const assetData = ref({});

// Estado para el diálogo de historial
const historyDialog = ref(false);
const selectedAssetId = ref<number | null>(null);

// --- FUNCIONES DEL FORMULARIO ---
const openCreateForm = () => {
  isEditMode.value = false;
  assetData.value = {};
  dialog.value = true;
};

const openEditForm = (asset: any) => {
  isEditMode.value = true;
  assetData.value = { ...asset };
  dialog.value = true;
};

const onFormSuccess = () => {
  dialog.value = false;
  loadData();
};

// --- FUNCIÓN DEL HISTORIAL ---
const openHistory = (asset: any) => {
  selectedAssetId.value = asset.id;
  historyDialog.value = true;
};

// --- EXPORTACIÓN ---
const handleExport = () => {
  const dataToExport = assets.value.map(a => ({
    'Cód. Patrimonial': a.codigoPatrimonial,
    'Hostname': a.hostname,
    'Marca': a.marca,
    'Modelo': a.modelo,
    'Serie': a.serie,
    'IP': a.ip,
    'Disco': a.disco,
    'Memoria': a.memoria,
    'Procesador': a.procesador,
    'Departamento': a.departamento,
    'Unidad': a.unidad,
    'Estado': a.estado,
    'Usuario Asignado': a.nombreUsuarioAsignado,
    'Componente Asignado': a.nombreDispositivoAsignado,
    'Garantía': getGarantiaStatus(a.fechaFinGarantia).text,
    'Total Tickets': a.totalTickets
  }));

  exportToExcel(dataToExport, 'Reporte_Patrimonio');
};
</script>

<template>
  <v-container fluid>
    <v-card class="pa-4">
      <v-card-title class="d-flex justify-space-between align-center">
        <h1 class="text-h4">Gestión de Patrimonio</h1>
        <div>
          <v-btn color="success" prepend-icon="mdi-microsoft-excel" class="mr-2" @click="handleExport">Exportar</v-btn>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateForm">Registrar Equipo</v-btn>
        </div>
      </v-card-title>

      <AssetFilters v-model:filters="filters" />

      <v-alert v-if="error" type="error" closable class="my-4">
        {{ error }}
      </v-alert>

      <v-data-table
        :headers="headers"
        :items="assets"
        :loading="loading"
        item-key="id"
        class="elevation-1 mt-4"
        no-data-text="No se encontraron equipos."
        loading-text="Cargando equipos..."
      >
        <!-- SLOT PARA GARANTÍA -->
        <template v-slot:item.garantia="{ item }">
          <v-chip
            :color="getGarantiaStatus(item.fechaFinGarantia).color"
            size="small"
            class="font-weight-medium"
            variant="flat"
          >
            <v-icon start size="small" class="mr-1">{{ getGarantiaStatus(item.fechaFinGarantia).icon }}</v-icon>
            {{ getGarantiaStatus(item.fechaFinGarantia).text }}
          </v-chip>
          <v-tooltip activator="parent" location="top" v-if="item.fechaFinGarantia">
            Vence: {{ item.fechaFinGarantia }}
          </v-tooltip>
        </template>

        <!-- SLOT PARA INTERVENCIONES -->
        <template v-slot:item.totalTickets="{ item }">
          <v-chip
            :color="item.totalTickets > 5 ? 'error' : (item.totalTickets > 0 ? 'warning' : 'success')"
            size="small"
            class="font-weight-bold"
          >
            {{ item.totalTickets }}
          </v-chip>
        </template>

        <!-- SLOT PARA ESTADO (COLORES) -->
        <template v-slot:item.estado="{ item }">
          <v-chip
            v-if="item.estado"
            :color="getStatusColor(item.estado)"
            size="small"
            class="font-weight-bold text-uppercase"
          >
            {{ item.estado.replace('_', ' ') }}
          </v-chip>
          <span v-else class="text-grey">N/A</span>
        </template>

        <!-- ACCIONES -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-center">
            <!-- Botón de Historial VISIBLE PARA TECHNICIAN Y ADMIN -->
            <v-btn
              v-if="authStore.isAgentOrAdmin"
              icon size="small" color="info" class="mr-2" @click="openHistory(item)"
            >
              <v-icon>mdi-history</v-icon>
              <v-tooltip activator="parent" location="top">Ver Historial</v-tooltip>
            </v-btn>

            <!-- Botón de Editar -->
            <v-btn icon size="small" color="secondary" class="mr-2" @click="openEditForm(item)">
              <v-icon>mdi-pencil</v-icon>
              <v-tooltip activator="parent" location="top">Editar</v-tooltip>
            </v-btn>

            <!-- Botón de Eliminar -->
            <v-btn icon size="small" color="error" @click="deleteAsset(item.id)">
              <v-icon>mdi-delete</v-icon>
              <v-tooltip activator="parent" location="top">Eliminar</v-tooltip>
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Modal de Formulario -->
    <AssetFormModal
      v-model:dialog="dialog"
      v-model:assetData="assetData"
      :is-edit-mode="isEditMode"
      :user-select-options="allUserOptions"
      :is-loading-users="isLoadingUsers"
      :device-select-options="deviceSelectOptions"
      :is-loading-devices="isLoadingDevices"
      @success="onFormSuccess"
    />

    <!-- NUEVO Diálogo de Historial -->
    <v-dialog v-model="historyDialog" max-width="700px">
      <AssetHistory
        v-if="selectedAssetId"
        :asset-id="selectedAssetId"
        @close="historyDialog = false"
      />
    </v-dialog>

  </v-container>
</template>