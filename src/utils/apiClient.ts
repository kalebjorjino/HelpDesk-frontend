import axios from 'axios';

// 1. Instancia ÚNICA de Axios para toda la aplicación
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // URL base de tu API
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor de Petición: Se ejecuta ANTES de cada petición
apiClient.interceptors.request.use(
  (config) => {
    // Obtiene el token de localStorage en cada petición
    const token = localStorage.getItem('authToken');

    // Si el token existe, lo añade a la cabecera Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // Continúa con la petición
  },
  (error) => {
    // Maneja errores en la configuración de la petición
    return Promise.reject(error);
  }
);

// 3. Interceptor de Respuesta: Se ejecuta DESPUÉS de cada respuesta
apiClient.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, simplemente la devuelve
    return response;
  },
  (error) => {
    // Si el error es 401 (No Autorizado), el token es inválido o ha expirado
    if (error.response && error.response.status === 401) {
      console.error('[apiClient] Unauthorized (401). Token might be expired. Logging out.');

      // Limpia el token de localStorage
      localStorage.removeItem('authToken');

      // Redirige al login. Usamos window.location para forzar una recarga completa
      // y limpiar cualquier estado residual en Pinia o Vue.
      window.location.href = '/login';
    }

    // Para cualquier otro error, lo propaga para que sea manejado por el código que hizo la llamada
    return Promise.reject(error);
  }
);

export default apiClient;
