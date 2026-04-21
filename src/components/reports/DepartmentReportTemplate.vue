<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  departmentName: String,
  reportDate: String,
  data: {
    type: Array as () => any[],
    default: () => []
  }
});

// Función para imprimir expuesta al padre
const print = () => {
  window.print();
};

defineExpose({ print });

const formatDate = (date: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('es-ES');
};
</script>

<template>
  <div class="print-container">
    <!-- Encabezado del Reporte -->
    <div class="report-header">
      <div class="header-left">
        <h1>Reporte de Historial de Soporte</h1>
        <h2>Departamento / Unidad: {{ departmentName || 'Todos' }}</h2>
      </div>
      <div class="header-right">
        <p><strong>Fecha Emisión:</strong> {{ reportDate }}</p>
        <p><strong>Total Equipos:</strong> {{ data.length }}</p>
      </div>
    </div>

    <hr class="divider">

    <!-- Lista de Equipos -->
    <div v-for="asset in data" :key="asset.id" class="asset-block">
      <!-- Cabecera del Equipo -->
      <div class="asset-header">
        <div class="asset-title">
            <strong>{{ asset.codigoPatrimonial }}</strong> - {{ asset.tipoEquipo }} {{ asset.marca }} {{ asset.modelo }}
        </div>
        <div class="asset-meta">
             Serie: {{ asset.serie }} | Estado: {{ asset.estado }}
        </div>
      </div>

      <!-- Tabla de Historial para este equipo -->
      <table v-if="asset.history && asset.history.length > 0" class="history-table">
        <thead>
          <tr>
            <th width="12%">Fecha</th>
            <th width="8%">Ticket #</th>
            <th width="20%">Asunto / Problema</th>
            <th width="25%">Diagnóstico / Solución</th>
            <th width="15%">Reportado Por</th>
            <th width="15%">Técnico</th>
            <th width="5%">Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ticket in asset.history" :key="ticket.id">
            <td>{{ formatDate(ticket.fechaCreacion) }}</td>
            <td>#{{ ticket.id }}</td>
            <td>{{ ticket.asunto }}</td>
            <td class="diagnosis-cell">{{ ticket.diagnostico || '-' }}</td>
            <td>{{ ticket.nombreReportadoPor || 'N/A' }}</td>
            <td>{{ ticket.nombreTecnico || 'Sin Asignar' }}</td>
            <td>{{ ticket.estado }}</td>
          </tr>
        </tbody>
      </table>

      <div v-else class="no-history">
        <em>Sin historial de soporte registrado.</em>
      </div>
    </div>

    <!-- Pie de página de impresión -->
    <div class="print-footer">
      Generado por Sistema HelpDesk - Confidencial
    </div>
  </div>
</template>

<style scoped>
/* Estilos que solo aplican a la vista en pantalla (oculto por defecto) */
.print-container {
  display: none; /* Oculto en pantalla normal */
  font-family: Arial, sans-serif;
  color: #000;
  background: white;
  padding: 20px;
}

/* Estilos de Impresión / PDF */
@media print {
  /* Forzar visibilidad al imprimir */
  .print-container {
    display: block !important;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 9999;
  }

  /* Ocultar todo lo demás de la aplicación (navbar, sidebar, botones) */
  body > *:not(.print-container) {
    display: none !important;
  }

  /* Estilos de la tabla y layout */
  .report-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .header-left h1 { font-size: 18pt; margin: 0; }
  .header-left h2 { font-size: 14pt; margin: 5px 0 0; color: #444; }
  .header-right { text-align: right; font-size: 10pt; }

  .divider { border: 1px solid #333; margin-bottom: 20px; }

  .asset-block {
    margin-bottom: 25px;
    page-break-inside: avoid; /* Intentar no cortar un equipo a la mitad */
  }

  .asset-header {
    background-color: #f0f0f0 !important; /* Forzar fondo gris */
    -webkit-print-color-adjust: exact; /* Para Chrome/Safari */
    print-color-adjust: exact;
    padding: 8px;
    border: 1px solid #ccc;
    font-size: 11pt;
    display: flex;
    justify-content: space-between;
  }

  .history-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 5px;
    font-size: 8pt; /* Reducir un poco fuente para que quepa todo */
  }

  .history-table th {
    border-bottom: 1px solid #000;
    text-align: left;
    padding: 4px;
    font-weight: bold;
    background-color: #f9f9f9;
  }

  .history-table td {
    border-bottom: 1px solid #eee;
    padding: 4px;
    vertical-align: top;
  }

  .diagnosis-cell {
    font-style: italic;
    color: #444;
  }

  .no-history {
    padding: 5px;
    font-size: 9pt;
    color: #666;
    border: 1px dashed #ccc;
    border-top: none;
  }

  .print-footer {
    position: fixed;
    bottom: 0;
    width: 100%;
    text-align: center;
    font-size: 8pt;
    color: #999;
    border-top: 1px solid #eee;
    padding-top: 5px;
  }
}
</style>