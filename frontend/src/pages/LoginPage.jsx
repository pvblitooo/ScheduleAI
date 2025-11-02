import { useState } from 'react';
import { Link } from 'react-router-dom'; // Para el enlace de "Regístrate"
import apiClient from '../api/axiosConfig'; // Usamos el apiClient configurado

// Este es el componente de página completo que recibe handleLogin de App.jsx
const LoginPage = ({ handleLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false); // --- NUEV
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
    params.append('remember_me', rememberMe);

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
  <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4">
    
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 shadow-xl rounded-2xl px-10 pt-10 pb-8">
        
        {/* Logo minimalista */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 shadow-lg transform hover:scale-105 transition-transform duration-300">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            ScheduleAI
          </h1>
          
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="login-email">
              Email
            </label>
            <input 
              id="login-email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="tu@email.com"
              className="bg-slate-800 border border-slate-700 rounded-lg w-full py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200" 
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="login-password">
              Contraseña
            </label>
            <input 
              id="login-password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
              className="bg-slate-800 border border-slate-700 rounded-lg w-full py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200" 
            />
          </div>

          {/* Checkbox personalizado */}
          <div className="flex items-center pt-1">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="peer relative appearance-none w-5 h-5 border-2 border-slate-700 rounded bg-slate-800 cursor-pointer transition-all duration-200 checked:bg-gradient-to-br checked:from-purple-500 checked:to-blue-500 checked:border-transparent hover:border-purple-500"
            />
            <svg className="absolute w-5 h-5 pointer-events-none hidden peer-checked:block text-white ml-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <label htmlFor="remember-me" className="ml-3 text-sm text-slate-400 cursor-pointer select-none hover:text-slate-300 transition-colors">
              Recordarme
            </label>
          </div>

          <button 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-3 rounded-lg w-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02] mt-6" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando...
              </span>
            ) : 'Iniciar Sesión'}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
          <p className="text-slate-400 text-sm">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200">
              Regístrate
            </Link>
          </p>
        </div>
      </form>
    </div>
  </div>
);

};

export default LoginPage;