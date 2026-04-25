import axios from 'axios';

// Instancia global de Axios con configuración base
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  withCredentials: true, // Envía cookies de sesión en cada request
  headers: {
    'Content-Type': 'application/json',
  },
});
