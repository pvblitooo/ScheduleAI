import axios from 'axios';

// ¡CAMBIO CLAVE! Leemos la variable desde el objeto 'window' global,
// que será creado por el script 'config.js'.
const baseURL = window.API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: baseURL,
});

// El interceptor para el token JWT sigue igual
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;