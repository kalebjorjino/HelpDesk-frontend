// src/composables/Users/useUsersView.ts
import { ref, onMounted, watch, computed } from 'vue'; // Asegurar imports
import { storeToRefs } from 'pinia';
// Importar Store, UserFilters, y UserRole
import { useUserStore, type UserFilters } from '@/stores/useUserStore';
import type { UserRole } from '@/types/User';

export function useUsersView() {
    // 1. Instancia del Store
    const userStore = useUserStore();

    const usersSafe = computed(() => users.value ?? []);
    // Extraer estado reactivo
    const { users, loading, error } = storeToRefs(userStore);

    // 2. Estado Reactivo para los Filtros (Exportado)
    const filters = ref<UserFilters>({
        search: '',
        role: undefined, // Sin filtro de rol por defecto
    });

    // 3. Función Central de Búsqueda (Usa los filtros reactivos)
    const fetchUsersWithFilters = () => {
        // Llama a la acción del store pasándole el valor actual de 'filters'
        userStore.fetchUsers(filters.value);
    };

    // 4. Observador (Watch) con Debounce para los Filtros
    let searchTimeout: ReturnType<typeof setTimeout> | null = null;
    watch(filters, () => {
        // Limpiar timeout anterior si existe
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        // Establecer un nuevo timeout: Espera 300ms antes de llamar a la API
        searchTimeout = setTimeout(() => {
            fetchUsersWithFilters();
        }, 300);
    }, { deep: true }); // 'deep' para observar cambios dentro del objeto ref

    // 5. Carga Inicial de Datos
    onMounted(fetchUsersWithFilters); // Carga inicial usando filtros (vacíos al principio)

    // 6. Función de Refresco Manual (Usa filtros actuales)
    const refreshUsers = () => {
        fetchUsersWithFilters(); // Recarga aplicando los filtros que estén seleccionados
    };

    const deleteUser = async (id: number) => {
        try {
            await userStore.deleteUser(id);
        } catch (err) {
            console.error('Error eliminando usuario desde composable:', err);
            throw err;
        }
    };



    // 7. Opciones para el Select de Filtro de Rol (Exportado)
    const roleOptions: { title: string, value: UserRole | undefined }[] = [
        { title: 'Todos los Roles', value: undefined }, // Opción para quitar el filtro
        { title: 'Usuario (USER)', value: 'USER' },
        { title: 'Técnico (TECHNICIAN)', value: 'TECHNICIAN' },
        { title: 'Administrador (ADMIN)', value: 'ADMIN' },
    ];

    // 8. Devolver todo lo necesario para la Vista
    return {
        users: usersSafe,           // La lista de usuarios (reactiva)
        isLoading: loading, // Estado de carga
        fetchError: error,   // Mensaje de error
        filters,           // Objeto reactivo de filtros (para v-model)
        refreshUsers,      // Función de recarga manual
        roleOptions,  
        deleteUser,     // Opciones para el v-select del filtro
    };
}
