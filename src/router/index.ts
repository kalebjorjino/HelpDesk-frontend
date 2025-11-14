import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';

// --- Importa todas las vistas necesarias ---
import DashboardView from '../views/DashboardView.vue';
import LoginView from '../views/auth/LoginView.vue';

// Vistas de Usuario
import UsersListView from '../views/users/UsersListView.vue';
import UserDetailsView from '../views/users/UserDetailsView.vue';

// Vistas de Tickets
import TicketsListView from '../views/tickets/TicketsListView.vue';
import MyTicketsView from '../views/tickets/MyTicketsView.vue'; // <-- IMPORTACIÓN AÑADIDA
import MyTicketDetailsView from '../views/tickets/MyTicketDetailsView.vue';

// Vistas de Activos (Assets)
import AssetsListView from '../views/assets/AssetsListView.vue';
import AssetDetailsView from '../views/assets/AssetDetailsView.vue';

// Vistas de Dispositivos (Devices)
import DevicesListView from '../views/Device/DevicesListView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Redirección y rutas públicas
    { path: '/', redirect: '/dashboard' },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },

    // --- Rutas Protegidas ---
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },

    // Rutas de Usuarios
    {
      path: '/users',
      name: 'users-list',
      component: UsersListView,
      meta: { requiresAuth: true, roles: ['ADMIN'] } // Solo Admin
    },
    {
      path: '/users/:id',
      name: 'user-details',
      component: UserDetailsView,
      meta: { requiresAuth: true, roles: ['ADMIN'] } // Solo Admin
    },

    // Rutas de Tickets
    {
      path: '/tickets',
      name: 'tickets-list',
      component: TicketsListView,
      meta: { requiresAuth: true, roles: ['ADMIN', 'TECHNICIAN'] } // Admin y Técnico
    },
    {
      path: '/my-tickets', // <-- RUTA AÑADIDA
      name: 'my-tickets',
      component: MyTicketsView,
      meta: { requiresAuth: true } // Accesible para todos los autenticados (incluyendo clientes)
    },
    {
      path: '/tickets/:id',
      name: 'my-ticket-details',
      component: MyTicketDetailsView,
      meta: { requiresAuth: true } // Accesible para todos los autenticados
    },

    // Rutas de Activos
    {
      path: '/assets',
      name: 'assets-list',
      component: AssetsListView,
      meta: { requiresAuth: true, roles: ['ADMIN', 'TECHNICIAN'] }
    },
    {
      path: '/assets/:id',
      name: 'asset-details',
      component: AssetDetailsView,
      meta: { requiresAuth: true, roles: ['ADMIN', 'TECHNICIAN'] }
    },

    // Rutas de Dispositivos
    {
      path: '/devices',
      name: 'devices-list',
      component: DevicesListView,
      meta: { requiresAuth: true, roles: ['ADMIN', 'TECHNICIAN'] }
    },
  ]
});

// En tu archivo src/router/index.ts

// --- GUARDIA DE NAVEGACIÓN GLOBAL (VERSIÓN FINAL Y ROBUSTA) ---
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // --- LÓGICA CLAVE PARA SOLUCIONAR LA CONDICIÓN DE CARRERA ---
  // Si tenemos un token pero no un perfil de usuario, significa que la app
  // se está cargando. Debemos esperar a que el perfil se obtenga.
  if (authStore.token && !authStore.currentUser) {
    try {
      // Esperamos a que la petición de perfil termine
      await authStore.fetchUserProfile();
    } catch (error) {
      // Si fetchUserProfile falla (ej. token inválido), el store ya hace logout.
      // El guardián se volverá a ejecutar y la siguiente condición lo redirigirá al login.
      // No necesitamos hacer nada más aquí, el flujo se corregirá solo.
    }
  }

  // Ahora que hemos esperado (si era necesario), podemos leer los valores actualizados
  const isAuthenticated = authStore.isAuthenticated;
  const userRole = authStore.currentUser?.role;
  const requiredRoles = to.meta.roles as string[] | undefined;

  // 1. Si la ruta requiere autenticación y el usuario NO está logueado
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } });
  }

  // 2. Si la ruta requiere roles específicos
  if (requiredRoles && requiredRoles.length > 0) {
    if (!userRole || !requiredRoles.includes(userRole)) {
      console.error(`[Router] Blocked: Role '${userRole}' is not authorized for route '${String(to.name)}'.`);
      // Redirigir a una página segura, como el dashboard principal
      return next({ name: 'dashboard' });
    }
  }

  // 3. Si el usuario está autenticado e intenta acceder al login
  if (to.name === 'login' && isAuthenticated) {
    return next({ name: 'dashboard' });
  }

  // Si todo está bien, permite el acceso
  next();
});

export default router;
