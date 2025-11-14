<template>
  <div>
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { useTicketStore } from '@/stores/useTicketStore';
import type { Ticket } from '@/types/Ticket';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// Inicializar el store
const ticketStore = useTicketStore();

// Datos reactivos del gráfico
const chartData = ref({
  labels: [] as string[],
  datasets: [] as any[],
});

// Opciones del gráfico
const chartOptions = ref({
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Tickets por Prioridad',
    },
  },
});

// ✅ Función para actualizar los datos del gráfico
const updateChartData = (tickets: Ticket[]) => {
  const priorityCounts = tickets.reduce((acc, ticket) => {
    if (['BAJA', 'MEDIA', 'ALTA', 'URGENTE'].includes(ticket.prioridad)) {
      acc[ticket.prioridad] = (acc[ticket.prioridad] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const labels = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'];
  const colors = ['#4CAF50', '#FFEB3B', '#FF9800', '#F44336']; // Verde, Amarillo, Naranja, Rojo
  const data = labels.map(label => priorityCounts[label] || 0);

  chartData.value = {
    labels,
    datasets: [
      {
        label: 'Tickets',
        backgroundColor: colors,
        data,
      },
    ],
  };
};

// 👀 Observar cambios en los tickets del store
watch(
  () => ticketStore.tickets,
  (newTickets) => {
    if (newTickets.length > 0) {
      updateChartData(newTickets);
    } else {
      // Reiniciar gráfico si no hay tickets
      chartData.value = { labels: [], datasets: [] };
    }
  },
  { immediate: true }
);
</script>

