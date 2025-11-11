import { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import apiClient from '../api/axiosConfig';
import { jwtDecode } from 'jwt-decode'; // ¡Importa la librería!
import ActionModal from '../components/ActionModal';

import { EyeIcon, EyeSlashIcon, SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../context/ThemeContext';


const ProfilePage = () => {
  const { theme, toggleTheme } = useTheme();
  // --- ESTADOS ---
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState(false); // Nuevo estado para la visibilidad
  const [actionModal, setActionModal] = useState({ isOpen: false, title: '', message: '' });

  // --- EFECTOS ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/users/me');
        const userData = response.data;
        setProfile({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          email: userData.email || '',
        });
      } catch (error) {
        console.error("Error al cargar el perfil:", error);
        setActionModal({ isOpen: true, title: 'Error', message: 'No se pudo cargar tu perfil. Intenta recargar la página.' });
      }
    };

    fetchProfile();
  }, []);

  // --- MANEJADORES DE CAMBIOS ---
  const handleProfileChange = (e) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswords(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // --- MANEJADORES DE ACCIONES ---
  const handleSaveChanges = async () => {
    try {
      await apiClient.put('/users/me', {
        first_name: profile.first_name,
        last_name: profile.last_name,
      });
      setActionModal({ isOpen: true, title: 'Éxito', message: 'Tu perfil ha sido actualizado correctamente.' });
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'No se pudo actualizar tu perfil.';
      setActionModal({ isOpen: true, title: 'Error', message: errorMessage });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // 1. Verificación de coincidencia
    if (passwords.newPassword !== passwords.confirmPassword) {
      setActionModal({ isOpen: true, title: 'Error de Validación', message: 'Las nuevas contraseñas no coinciden.' });
      return;
    }

    // 2. ¡NUEVA VERIFICACIÓN DE LONGITUD!
    if (passwords.newPassword.length < 8) {
      setActionModal({ isOpen: true, title: 'Error de Validación', message: 'La nueva contraseña debe tener al menos 8 caracteres.' });
      return;
    }

    try {
      await apiClient.post('/users/me/change-password', {
        current_password: passwords.currentPassword,
        new_password: passwords.newPassword,
      });
      setActionModal({ isOpen: true, title: 'Éxito', message: 'Tu contraseña ha sido cambiada correctamente.' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'No se pudo cambiar la contraseña. Verifica tu contraseña actual.';
      setActionModal({ isOpen: true, title: 'Error en la Petición', message: errorMessage });
    }
  };

  
return (
  <>
    {/* --- MODIFICADO: Contenedor principal --- */}
    <div className="text-slate-900 dark:text-white max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
        Mi Perfil
      </h1>

      {/* --- ¡NUEVA SECCIÓN DE APARIENCIA! --- */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Apariencia
        </h2>
        <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50">
          <label htmlFor="theme-toggle" className="font-medium text-slate-700 dark:text-slate-300">
            Modo {theme === 'light' ? 'Claro' : 'Oscuro'}
          </label>
          
          {/* El Interruptor (Toggle) */}
          <button
            id="theme-toggle"
            onClick={toggleTheme}
            className={`relative w-16 h-8 flex items-center ${theme === 'light' ? 'bg-blue-500' : 'bg-slate-700'} rounded-full p-1 transition-colors duration-300`}
          >
            <span className="sr-only">Cambiar tema</span>
            
            {/* Círculo blanco que se mueve */}
            <span className={`absolute bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${theme === 'dark' ? 'translate-x-8' : 'translate-x-0'}`}></span>
            
            {/* Iconos (se ocultan y muestran) */}
            <div className="flex justify-between w-full px-1">
              <MoonIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-300' : 'text-slate-400'}`} />
              <SunIcon className={`h-5 w-5 ${theme ==='light' ? 'text-yellow-400' : 'text-slate-400'}`} />
            </div>
          </button>
        </div>
      </div>

      {/* --- MODIFICADO: SECCIÓN DE DATOS PERSONALES --- */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl mb-8">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Información de la Cuenta
        </h2>
        
        {/* Campos para Nombre y Apellido */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="first_name" className="block text-slate-700 dark:text-slate-300 font-medium mb-2">Nombre</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              value={profile.first_name}
              onChange={handleProfileChange}
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label htmlFor="last_name" className="block text-slate-700 dark:text-slate-300 font-medium mb-2">Apellido</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              value={profile.last_name}
              onChange={handleProfileChange}
              placeholder="Tu apellido"
            />
          </div>
        </div>
        
        {/* Campo de Correo Electrónico (no editable) */}
        <div className="mb-6">
          <label className="block text-slate-700 dark:text-slate-300 font-medium mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Correo Electrónico
          </label>
          <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-3 rounded-lg text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {profile.email}
          </div>
        </div>

        {/* Botón (gradiente, no cambia) */}
        <button 
          onClick={handleSaveChanges}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Guardar Cambios
        </button>
      </div>

      {/* --- MODIFICADO: SECCIÓN CAMBIAR CONTRASEÑA --- */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Cambiar Contraseña
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-5">
          
          <div className="relative">
            <label htmlFor="currentPassword" className="block text-slate-700 dark:text-slate-300 font-medium mb-2">Contraseña Actual</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              id="currentPassword" 
              name="currentPassword"
              value={passwords.currentPassword} 
              onChange={handlePasswordChange}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 pr-10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
              required
              placeholder="Ingresa tu contraseña actual"
            />
            <button 
              type="button" 
              onClick={() => setShowPasswords(!showPasswords)} 
              className="absolute right-3 top-10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              {showPasswords ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
            </button>
          </div>
          
          <div className="relative">
            <label htmlFor="newPassword" className="block text-slate-700 dark:text-slate-300 font-medium mb-2">Nueva Contraseña (mín. 8 caracteres)</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              id="newPassword" 
              name="newPassword"
              value={passwords.newPassword} 
              onChange={handlePasswordChange}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 pr-10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
              required
              placeholder="Ingresa una nueva contraseña"
            />
            <button 
              type="button" 
              onClick={() => setShowPasswords(!showPasswords)} 
              className="absolute right-3 top-10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              {showPasswords ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
            </button>
          </div>

          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-slate-700 dark:text-slate-300 font-medium mb-2">Confirmar Nueva Contraseña</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              id="confirmPassword" 
              name="confirmPassword"
              value={passwords.confirmPassword} 
              onChange={handlePasswordChange}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 pr-10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
              required
              placeholder="Confirma tu nueva contraseña"
            />
            <button 
              type="button" 
              onClick={() => setShowPasswords(!showPasswords)} 
              className="absolute right-3 top-10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              {showPasswords ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
            </button>
          </div>
          
          {/* Botón (verde, no cambia) */}
          <button 
            type="submit" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-green-500/50 transition-all active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Cambiar Contraseña
          </button>
        </form>
      </div>
    </div>

    {/* --- MODAL PARA NOTIFICACIONES --- */}
    {/* Este modal ya lo arreglamos, así que no hay cambios aquí */}
    <ActionModal
      isOpen={actionModal.isOpen}
      onRequestClose={() => setActionModal({ ...actionModal, isOpen: false })}
      title={actionModal.title}
      message={actionModal.message}
      showConfirmButton={false}
    />
  </>
);
};

export default ProfilePage;