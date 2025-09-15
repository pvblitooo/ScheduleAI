import { useState } from 'react';
import { Link } from 'react-router-dom'; // Para el enlace de "Regístrate"
import apiClient from '../api/axiosConfig'; // Usamos el apiClient configurado

// Este es el componente de página completo que recibe handleLogin de App.jsx
const LoginPage = ({ handleLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // FastAPI espera los datos del login como form-data
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    try {
      const response = await apiClient.post('/token', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      // ¡Aquí está la conexión correcta!
      // Llamamos a la función handleLogin que viene de App.jsx
      handleLogin(response.data.access_token);
      
    } catch (err) {
      // Este bloque se ejecuta si el backend devuelve un error (ej. 401)
      setError('Error: Email o contraseña incorrectos.');
      console.error("Error en el login:", err.response || err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
  // Contenedor principal que centra todo vertical y horizontalmente
  <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
    <div className="w-full max-w-sm">
      {/* Añadimos más padding y un poco más de sombra para un mejor efecto */}
      <form onSubmit={handleSubmit} className="bg-gray-800 shadow-2xl rounded-xl px-8 pt-6 pb-8 mb-4">
        
        {/* Hacemos el título ligeramente más pequeño en móviles y más grande en escritorio */}
        <h2 className="text-white text-2xl md:text-3xl font-bold mb-6 text-center">
          Iniciar Sesión
        </h2>
        
        <div className="mb-4">
          <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="login-email">
            Email
          </label>
          <input 
            id="login-email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className="shadow-inner appearance-none border border-gray-700 rounded w-full py-3 px-4 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500" 
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="login-password">
            Contraseña
          </label>
          <input 
            id="login-password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            className="shadow-inner appearance-none border border-gray-700 rounded w-full py-3 px-4 bg-gray-700 text-white mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500" 
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <button 
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition-all duration-300 disabled:opacity-50" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando...' : 'Entrar'}
          </button>
        </div>

        {error && <p className="text-center text-red-500 text-sm">{error}</p>}
        
        <p className="text-center text-gray-500 text-xs mt-6">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
            Regístrate
          </Link>
        </p>
      </form>
    </div>
  </div>
);
};

export default LoginPage;