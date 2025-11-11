import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importar useNavigate
import apiClient from '../api/axiosConfig';

import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';


const RegisterPage = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Hook para la redirección
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Registrando...');
    setIsError(false);
    setIsLoading(true);

    if (formData.password.length < 8) {
      setMessage('La contraseña debe tener al menos 8 caracteres.');
      setIsError(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.post('/register', formData);
      
      setMessage(`¡Registro exitoso para ${response.data.email}! Serás redirigido al login.`);
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      setIsError(true);
      if (error.response && error.response.data) {
        // Manejo de errores más específico si el backend devuelve detalles
        const details = error.response.data.detail;
        if (Array.isArray(details)) {
          // Si Pydantic devuelve un array de errores
          const errorMsg = details.map(err => `${err.loc[1]}: ${err.msg}`).join(', ');
          setMessage(`Error: ${errorMsg}`);
        } else {
          setMessage(`Error: ${details}`);
        }
      } else {
        setMessage('Error de red al intentar registrar.');
      }
      console.error("Error en el registro:", error.response || error);
    } finally {
      setIsLoading(false);
    }
  };


return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl px-8 pt-8 pb-6">
          
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-1 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              ScheduleAI
            </h1>
          </div>

          <h2 className="text-slate-900 dark:text-white text-xl font-bold mb-5 text-center">
            Crear Cuenta
          </h2>

          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-1.5" htmlFor="first_name">
                  Nombre
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  placeholder="Tu nombre"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg w-full py-2.5 px-3.5 text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-1.5" htmlFor="last_name">
                  Apellido
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  placeholder="Tu apellido"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg w-full py-2.5 px-3.5 text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-1.5" htmlFor="register-email">
                Correo Electrónico
              </label>
              <input
                id="register-email"
                name="email"
                type="email"
                placeholder="tu@correo.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg w-full py-2.5 px-3.5 text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200"
              />
            </div>

            {/* --- BLOQUE DE CONTRASEÑA MODIFICADO --- */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-1.5" htmlFor="register-password">
                Contraseña
              </label>
              {/* 1. Contenedor Relativo */}
              <div className="relative">
                <input
                  id="register-password"
                  name="password"
                  // 2. Tipo dinámico
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  // 3. Padding a la derecha (pr-10)
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg w-full py-2.5 px-3.5 pr-10 text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200"
                />
                {/* 4. Botón del Ojo */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            {/* --- FIN DEL BLOQUE DE CONTRASEÑA --- */}


            <button 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-2.5 rounded-lg w-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02] mt-5" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center text-sm">
                  <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registrando...
                </span>
              ) : 'Registrarse'}
            </button>
          </div>

          {message && (
            <div className={`mt-3 px-3 py-2.5 rounded-lg text-xs ${
              isError 
                ? 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-300' 
                : 'bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 text-green-600 dark:text-green-300'
            }`}>
              {message}
            </div>
          )}

          <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 font-medium transition-colors duration-200">
                Inicia Sesión
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );

};

export default RegisterPage;