<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import DepartmentReportTemplate from '@/components/reports/DepartmentReportTemplate.vue';
import { useAssetsView } from '@/composables/Assets/useAssetsView';
import { useTicketStore } from '@/stores/useTicketStore';
import { useUserOptions } from '@/composables/Users/useUserOptions';

const authStore = useAuthStore();
const { assets, loadData, filters } = useAssetsView();
const ticketStore = useTicketStore();
const { allUserOptions, fetchUsers } = useUserOptions();

const searchQuery = ref(''); // Variable para el input de búsqueda
const isGenerating = ref(false);
const reportData = ref<any[]>([]);
const currentDate = new Date().toLocaleDateString();



onMounted(() => {
    fetchUsers();
});

const getUserName = (id?: number | null, fallbackName?: string) => {
    if (!id) return 'N/A';
    const user = allUserOptions.value.find(u => u.value === id);
    return user ? user.title.split(' (')[0] : (fallbackName || 'Usuario Desconocido');
};

const generateReport = async () => {
    if (!searchQuery.value && !authStore.isAdmin) return;

    isGenerating.value = true;
    reportData.value = [];

    try {
        if (allUserOptions.value.length === 0) await fetchUsers();

        // Limpiar filtros anteriores y aplicar la búsqueda global
        filters.value = {
            search: searchQuery.value  // El backend debe buscar este string en Dept/Unidad/Oficina
        };

        await loadData(); // Cargar assets filtrados por la búsqueda

        const assetsWithHistory = await Promise.all(
            assets.value.map(async (asset) => {
                let history = [];
                try {
                    const rawHistory = await ticketStore.fetchTicketsByAssetId(asset.id);
                    history = rawHistory.map((t: any) => ({
                        ...t,
                        nombreReportadoPor: getUserName(t.usuarioReportaId, t.nombreUsuarioReporta),
                        nombreTecnico: getUserName(t.tecnicoAsignadoId, t.nombreTecnicoAsignado)
                    }));
                } catch (e) {
                    console.warn(`No se pudo cargar historial para asset ${asset.id}`, e);
                }

                return {
                    ...asset,
                    history: history
                };
            })
        );

        reportData.value = assetsWithHistory;

    } catch (error) {
        console.error('Error generando reporte:', error);
    } finally {
        isGenerating.value = false;
    }
};

const canPrint = computed(() => reportData.value.length > 0);
const reportTemplateRef = ref<InstanceType<typeof DepartmentReportTemplate> | null>(null);

const handlePrint = () => {
    if (reportTemplateRef.value) {
        reportTemplateRef.value.print();
    }
};
</script>

<template>
  <v-container fluid>
    <v-card class="mb-4">
      <v-card-title class="text-h5">Generar Reporte por Área</v-card-title>
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="6">
            <!-- Buscador Flexible -->
            <v-combobox
              v-model="searchQuery"
              :items="suggestions"
              label="Buscar por Departamento, Unidad, Oficina o Servicio"
              placeholder="Ej: Logística, Piso 2, RRHH..."
              variant="outlined"
              clearable
              prepend-inner-icon="mdi-magnify"
              hide-no-data
              hint="Escriba el nombre del área y presione Enter o Generar"
              persistent-hint
            ></v-combobox>
          </v-col>
          <v-col cols="12" md="2">
            <v-btn
                color="primary"
                block
                height="56"
                @click="generateReport"
                :loading="isGenerating"
                :disabled="!searchQuery"
            >
              Generar Vista Previa
            </v-btn>
          </v-col>
          <v-col cols="12" md="2" v-if="canPrint">
             <v-btn
                color="secondary"
                block
                height="56"
                prepend-icon="mdi-printer"
                @click="handlePrint"
            >
              Imprimir / PDF
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Vista Previa en Pantalla -->
    <v-card v-if="reportData.length > 0" class="pa-4">
        <div class="d-flex justify-space-between align-center">
             <v-card-title>Resultados para: "{{ searchQuery }}"</v-card-title>
             <v-chip color="info">{{ reportData.length }} Equipos Encontrados</v-chip>
        </div>

        <v-expansion-panels variant="accordion" class="mt-4">
            <v-expansion-panel
                v-for="asset in reportData"
                :key="asset.id"
            >
                <v-expansion-panel-title>
                    <v-icon start size="small" class="mr-2">mdi-laptop</v-icon>
                    <strong>{{ asset.codigoPatrimonial }}</strong>
                    <span class="mx-2 text-grey">|</span>
                    {{ asset.tipoEquipo }} {{ asset.marca }}
                    <span class="mx-2 text-grey">|</span>
                    <span class="text-caption text-grey">{{ asset.departamento }} - {{ asset.unidad }}</span>
                </v-expansion-panel-title>

                <v-expansion-panel-text>
                    <v-table density="compact">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Asunto</th>
                                <th>Diagnóstico</th>
                                <th>Reportado Por</th>
                                <th>Técnico</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="ticket in asset.history" :key="ticket.id">
                                <td>{{ new Date(ticket.fechaCreacion).toLocaleDateString() }}</td>
                                <td>{{ ticket.asunto }}</td>
                                <td class="text-caption text-grey-darken-2" style="max-width: 200px;">
                                    {{ ticket.diagnostico || '-' }}
                                </td>
                                <td>{{ ticket.nombreReportadoPor }}</td>
                                <td>{{ ticket.nombreTecnico }}</td>
                                <td><v-chip size="x-small" label>{{ ticket.estado }}</v-chip></td>
                            </tr>
                            <tr v-if="asset.history.length === 0">
                                <td colspan="6" class="text-center text-grey">Sin historial de soporte.</td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-expansion-panel-text>
            </v-expansion-panel>
        </v-expansion-panels>
    </v-card>

    <v-alert v-else-if="!isGenerating && searchQuery && reportData.length === 0" type="warning" variant="tonal" class="mt-4">
        No se encontraron equipos que coincidan con "{{ searchQuery }}". Intente con otro término.
    </v-alert>

    <v-alert v-else-if="!searchQuery" type="info" variant="tonal" class="mt-4">
        Ingrese un término de búsqueda (Departamento, Unidad, etc.) para generar el reporte.
    </v-alert>

    <!-- Componente Invisible para Impresión -->
    <DepartmentReportTemplate
        ref="reportTemplateRef"
        :department-name="searchQuery || ''"
        :report-date="currentDate"
        :data="reportData"
    />

  </v-container>
</template>