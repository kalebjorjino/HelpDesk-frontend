// src/utils/assetClient.ts
import axios, { type AxiosInstance, type AxiosError } from 'axios';
import router from '@/router';

// URL del Microservicio de Patrimonio (Assets)
const ASSET_API_URL = 'http://localhost:8080/api/'; // Añadimos /api/v1 si lo usas en el Controller

const assetClient: AxiosInstance = axios.create({
  baseURL: ASSET_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptores (iguales, asegurando lógica DRY para seguridad)
assetClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

assetClient.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && router.currentRoute.value.path !== '/login') {
      localStorage.removeItem('authToken');
      // router.push('/login');
    }
    return Promise.reject(error);
  }
);

export default assetClient;
