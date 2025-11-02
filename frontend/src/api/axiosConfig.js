import axios from 'axios';

// Diagnóstico: ¿Qué ve este archivo cuando se ejecuta?
console.log('DIAGNÓSTICO DESDE AXIOS: Ejecutando axiosConfig.js. El valor actual de window.API_BASE_URL es:', window.API_BASE_URL);

const baseURL = window.API_BASE_URL || 'http://localhost:8000';

// Diagnóstico: ¿Qué valor se usó finalmente?
console.log('DIAGNÓSTICO DESDE AXIOS: La baseURL se ha establecido en:', baseURL);


const apiClient = axios.create({
  baseURL: baseURL,
  withCredentials: true
});

// El interceptor sigue igual
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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