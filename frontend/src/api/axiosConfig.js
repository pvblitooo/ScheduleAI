import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Creamos una instancia de axios con la URL base de nuestra API
const apiClient = axios.create({
  baseURL: baseURL,
});

// --- ¡EL INTERCEPTOR MÁGICO! ---
// Esto intercepta cada petición antes de que se envíe
apiClient.interceptors.request.use(
  (config) => {
    // 1. Recupera el token del localStorage
    const token = localStorage.getItem('token');
    
    // 2. Si el token existe, lo añade a la cabecera 'Authorization'
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 3. Devuelve la configuración modificada para que la petición continúe
    return config;
  },
  (error) => {
    // Maneja cualquier error que ocurra durante la configuración de la petición
    return Promise.reject(error);
  }
);

export default apiClient;