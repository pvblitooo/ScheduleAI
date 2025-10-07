import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importar useNavigate
import apiClient from '../api/axiosConfig';

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
    // Contenedor principal para centrar todo
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="bg-gray-800 shadow-2xl rounded-xl px-8 pt-6 pb-8 mb-4">
          
          <h2 className="text-white text-2xl md:text-3xl font-bold mb-6 text-center">
            Crear Cuenta
          </h2>

          {/* --- NUEVOS CAMPOS PARA NOMBRE Y APELLIDO --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="first_name">
                Nombre
              </label>
              <input
                id="first_name"
                name="first_name" // Clave: el 'name' debe coincidir con la propiedad del estado
                type="text"
                placeholder="Tu nombre"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="shadow-inner appearance-none border border-gray-700 rounded w-full py-3 px-4 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="last_name">
                Apellido
              </label>
              <input
                id="last_name"
                name="last_name" // Clave: el 'name' debe coincidir con la propiedad del estado
                type="text"
                placeholder="Tu apellido"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="shadow-inner appearance-none border border-gray-700 rounded w-full py-3 px-4 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="register-email">
              Correo Electrónico
            </label>
            <input
              id="register-email"
              name="email" // Clave: el 'name' debe coincidir
              type="email"
              placeholder="tu@correo.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="shadow-inner appearance-none border border-gray-700 rounded w-full py-3 px-4 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="register-password">
              Contraseña
            </label>
            <input
              id="register-password"
              name="password" // Clave: el 'name' debe coincidir
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChange={handleChange}
              required
              className="shadow-inner appearance-none border border-gray-700 rounded w-full py-3 px-4 bg-gray-700 text-white mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition-all duration-300 disabled:opacity-50" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </button>
          </div>

          {message && (
            <p className={`text-center text-sm ${isError ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </p>
          )}

          <p className="text-center text-gray-500 text-xs mt-6">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Inicia Sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;