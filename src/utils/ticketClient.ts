// src/utils/ticketClient.ts
import axios, { type AxiosInstance, type AxiosError } from 'axios';
import router from '@/router';

// URL del Microservicio de Tickets
const TICKET_API_URL = 'http://localhost:8080/api/';

const ticketClient: AxiosInstance = axios.create({
  baseURL: TICKET_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptores (Seguridad y Manejo de Errores)
// Se aplica el mismo patrón que en los otros clientes para consistencia.
ticketClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

ticketClient.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && router.currentRoute.value.path !== '/login') {
      localStorage.removeItem('authToken');
      // router.push('/login'); // Descomentar cuando la ruta de login esté implementada
    }
    return Promise.reject(error);
  }
);

export default ticketClient;
