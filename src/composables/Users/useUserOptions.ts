import { onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/useUserStore';

interface UserSelectOption {
    title: string;
    value: number;
}

export function useUserOptions() {
    const userStore = useUserStore();
    const { users, loading: isLoadingUsers, error: usersError } = storeToRefs(userStore);

    const fetchUsers = () => {
        if (users.value.length === 0) {
            userStore.fetchUsers();
        }
    };

    onMounted(fetchUsers);

    // Opción 1: Lista de TODOS los usuarios
    const allUserOptions = computed<UserSelectOption[]>(() =>
        users.value.map(user => ({
            title: `${user.nombreCompleto} (${user.codigoEmpleado})`,
            value: user.id,
        }))
    );

    // Opción 2: Lista solo de Clientes (para "Usuario que Reporta")
    const clientUserOptions = computed<UserSelectOption[]>(() =>
        users.value
            .filter(user => user.role === 'USER')
            .map(user => ({
                title: `${user.nombreCompleto} (${user.codigoEmpleado})`,
                value: user.id,
            }))
    );

    // Opción 3: Lista solo de Agentes (para "Asignar a Técnico")
    const agentUserOptions = computed<UserSelectOption[]>(() =>
        users.value
            .filter(user => user.role === 'ADMIN' || user.role === 'TECHNICIAN')
            .map(user => ({
                title: `${user.nombreCompleto} (${user.codigoEmpleado})`,
                value: user.id,
            }))
    );

    return {
        isLoadingUsers,
        usersError,
        fetchUsers,
        allUserOptions,
        clientUserOptions,   // <-- Lista para reportar
        agentUserOptions,    // <-- Lista para asignar
    };
}
