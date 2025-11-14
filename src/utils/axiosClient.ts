import axios from 'axios';

// 1. Creamos la instancia base de Axios
const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api/', // URL base para el servicio de tickets/activos
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor de Petición (Request Interceptor)
// Se ejecuta ANTES de que cada petición sea enviada.
axiosClient.interceptors.request.use(
  (config) => {
    // Obtenemos el token desde localStorage
    const token = localStorage.getItem('authToken');

    // Si el token existe, lo añadimos a la cabecera de Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // Continuamos con la petición modificada
  },
  (error) => {
    // Manejamos errores en la configuración de la petición
    return Promise.reject(error);
  }
);

// 3. Interceptor de Respuesta (Response Interceptor) - Opcional pero recomendado
// Se ejecuta DESPUÉS de recibir una respuesta.
axiosClient.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa (2xx), simplemente la retornamos
    return response;
  },
  (error) => {
    // Si recibimos un error 401 (No Autorizado), podría significar que el token expiró.
    if (error.response && error.response.status === 401) {
      // Forzamos el logout para limpiar el estado y redirigir al login.
      // NOTA: Para evitar dependencias circulares, no importamos el store aquí.
      // En su lugar, emitimos un evento global o simplemente limpiamos localStorage.
      localStorage.removeItem('authToken');
      // Recargamos la página para forzar la redirección al login.
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
