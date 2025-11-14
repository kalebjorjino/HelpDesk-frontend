// src/utils/deviceClient.ts
import axios, { type AxiosInstance, type AxiosError } from 'axios';
import router from '@/router';

// URL del Microservicio de Componentes
const DEVICE_API_URL = 'http://localhost:8080/api/';

const deviceClient: AxiosInstance = axios.create({
  baseURL: DEVICE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptores (Seguridad y Error handling)
deviceClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

deviceClient.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && router.currentRoute.value.path !== '/login') {
      localStorage.removeItem('authToken');
      // router.push('/login');
    }
    return Promise.reject(error);
  }
);

export default deviceClient;
