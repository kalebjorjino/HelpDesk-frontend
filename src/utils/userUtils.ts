import type { UserRole } from '@/types/User';

export const getRoleColor = (role: UserRole): string => {
    switch (role) {
        case 'ADMIN': return 'error';
        case 'TECHNICIAN': return 'info';
        case 'USER': return 'success';
        default: return 'grey';
    }
};
