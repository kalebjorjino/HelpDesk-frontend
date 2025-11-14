import { createApp } from 'vue';
import { createPinia } from 'pinia';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';

import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/useAuthStore';

// Se envuelve la inicialización en una función async para poder usar await
async function initializeApp() {
  const app = createApp(App);

  // 1. Instalar Pinia PRIMERO. Es esencial para que los stores estén disponibles.
  app.use(createPinia());

  // 2. Obtener la instancia del store de autenticación.
  const authStore = useAuthStore();

  try {
    // 3. Si hay un token, intentar cargar el perfil del usuario.
    // La palabra clave `await` PAUSA la ejecución de esta función
    // hasta que la promesa de fetchUserProfile se resuelva (o falle).
    await authStore.fetchUserProfile();
  } catch (error) {
    // Si fetchUserProfile falla (ej. token inválido), el store ya maneja el logout.
    // No necesitamos hacer nada más aquí. La app continuará sin usuario autenticado.
    console.log('[main.ts] Could not fetch user profile on startup. User is not logged in.');
  }

  // 4. SOLO DESPUÉS de que el estado de autenticación esté resuelto, instalar el router.
  app.use(router);

  // 5. Instalar Vuetify y montar la aplicación.
  app.use(createVuetify({
    components,
    directives,
    theme: {
      themes: {
        light: {
          colors: {
            primary: '#1976D2',
            secondary: '#424242',
          },
        },
      },
    },
  }));

  app.mount('#app');
}

// Llamar a la función de inicialización para arrancar la aplicación.
initializeApp();
