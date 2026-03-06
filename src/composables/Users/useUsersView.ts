import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/useUserStore';
import type { UserRole } from '@/types/User';
import { useSweetAlert } from '@/composables/useSweetAlert';

export function useUsersView() {
    const userStore = useUserStore();
    const { showSuccess, showError, confirmDelete } = useSweetAlert();

    const { users: rawUsers, loading, error } = storeToRefs(userStore);

    // --- FILTROS SIMPLIFICADOS ---
    const searchQuery = ref('');
    const roleFilter = ref<UserRole | undefined>(undefined);

    // --- LÓGICA DE FILTRADO ---
    const users = computed(() => {
        let processedUsers = rawUsers.value;

        // 1. Filtrar por búsqueda de texto
        if (searchQuery.value) {
            const searchLower = searchQuery.value.toLowerCase();
            processedUsers = processedUsers.filter(user =>
                (user.nombreCompleto && user.nombreCompleto.toLowerCase().includes(searchLower)) ||
                (user.username && user.username.toLowerCase().includes(searchLower)) ||
                (user.codigoEmpleado && user.codigoEmpleado.toLowerCase().includes(searchLower)) ||
                (user.email && user.email.toLowerCase().includes(searchLower))
            );
        }

        // 2. Filtrar por Rol
        if (roleFilter.value) {
            processedUsers = processedUsers.filter(user => user.role === roleFilter.value);
        }

        return processedUsers;
    });

    const fetchUsers = () => {
        userStore.fetchUsers();
    };

    onMounted(fetchUsers);

    const refreshUsers = () => {
        fetchUsers();
    };

    const deleteUser = async (id: number) => {
        const confirmed = await confirmDelete('¿Eliminar usuario?', 'Esta acción no se puede deshacer.');
        if (confirmed) {
            try {
                await userStore.deleteUser(id);
                showSuccess('Usuario eliminado correctamente');
            } catch (err) {
                showError('Error', 'No se pudo eliminar el usuario.');
            }
        }
    };

    const roleOptions: { title: string, value: UserRole | undefined }[] = [
        { title: 'Todos los Roles', value: undefined },
        { title: 'Usuario (USER)', value: 'USER' },
        { title: 'Técnico (TECHNICIAN)', value: 'TECHNICIAN' },
        { title: 'Administrador (ADMIN)', value: 'ADMIN' },
    ];

    return {
        users,
        isLoading: loading,
        fetchError: error,
        searchQuery, // <-- Exportar ref individual
        roleFilter,  // <-- Exportar ref individual
        refreshUsers,
        roleOptions,
        deleteUser,
    };
}
