<script setup lang="ts">
import { useMyTicketsView } from '@/composables/Tickets/useMyTicketsView';
import type { EstadoTicket, PrioridadTicket } from '@/types/Ticket';

// Use the dedicated composable for "My Tickets"
const { tickets, isLoading, fetchError, refreshTickets, filters, priorityOptions, statusOptions } = useMyTicketsView();

// Headers for the client's view
const headers = [
    { title: 'Asunto', align: 'start', key: 'asunto' },
    { title: 'Prioridad', key: 'prioridad', width: '120px' },
    { title: 'Estado', key: 'estado', width: '120px' },
    // { title: 'Agente Asignado', key: 'assignedAgentName' }, // Uncomment if you added augmentation
    { title: 'Fecha Creación', key: 'fechaCreacion' },
    { title: 'Acciones', key: 'actions', sortable: false, width: '100px' },
];

// Re-use status color logic
const getStatusColor = (estado: EstadoTicket) => {
    if (estado === 'PENDIENTE') return 'red-darken-1';
    if (estado === 'EN_PROCESO') return 'orange-darken-1';
    if (estado === 'RESUELTO') return 'blue-darken-1';
    if (estado === 'CERRADO') return 'green-darken-1';
    return 'grey';
};

// Placeholder functions for actions
const viewDetails = (ticketId: number) => {
    alert(`Implementar vista de detalles para cliente - Ticket ID: ${ticketId}`);
};
const addComment = (ticketId: number) => {
    alert(`Implementar modal para añadir comentario - Ticket ID: ${ticketId}`);
};
</script>

<template>
    <v-container fluid>
        <h1 class="text-h4 mb-4">Mis Tickets Reportados</h1>

        <v-card class="pa-4">
            <v-row class="mb-4 mt-2">
                <v-col cols="12" md="6">
                    <v-text-field v-model="filters.search" label="Buscar en mis tickets..."
                        prepend-inner-icon="mdi-magnify" variant="outlined" clearable density="compact"
                        hide-details></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                    <v-select v-model="filters.estado" :items="statusOptions" label="Estado" variant="outlined"
                        clearable density="compact" hide-details></v-select>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                    <v-select v-model="filters.prioridad" :items="priorityOptions" label="Prioridad" variant="outlined"
                        clearable density="compact" hide-details></v-select>
                </v-col>
            </v-row>

            <v-alert v-if="fetchError" type="error" closable class="my-4">
                {{ fetchError }}
                <v-btn class="ml-4" color="white" variant="text" @click="refreshTickets">Reintentar</v-btn>
            </v-alert>

            <v-data-table :headers="headers" :items="tickets" :loading="isLoading" item-key="id" class="elevation-1"
                no-data-text="No has reportado ningún ticket aún." loading-text="Cargando tus tickets...">
                <template v-slot:item.prioridad="{ item }">
                    <v-chip size="small"
                        :color="item.prioridad === 'ALTA' || item.prioridad === 'URGENTE' ? 'red' : item.prioridad === 'MEDIA' ? 'orange' : 'green'">{{
                        item.prioridad }}</v-chip>
                </template>
                <template v-slot:item.estado="{ item }">
                    <v-chip size="small" :color="getStatusColor(item.estado)">{{ item.estado }}</v-chip>
                </template>
                <template v-slot:item.fechaCreacion="{ item }">
                    {{ new Date(item.fechaCreacion).toLocaleString() }}
                </template>

                <template v-slot:item.actions="{ item }">
                    <v-tooltip text="Ver Detalles">
                        <template v-slot:activator="{ props }">
                            <v-btn v-bind="props" icon size="small" color="info" class="mr-1"
                                @click="viewDetails(item.id)">
                                <v-icon>mdi-eye</v-icon>
                            </v-btn>
                        </template>
                    </v-tooltip>
                    <v-tooltip text="Añadir Comentario">
                        <template v-slot:activator="{ props }">
                            <v-btn v-bind="props" icon size="small" color="primary" @click="addComment(item.id)">
                                <v-icon>mdi-comment-plus</v-icon>
                            </v-btn>
                        </template>
                    </v-tooltip>
                </template>
            </v-data-table>
        </v-card>
    </v-container>
</template>
