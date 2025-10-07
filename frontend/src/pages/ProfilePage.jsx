import { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import apiClient from '../api/axiosConfig';
import { jwtDecode } from 'jwt-decode'; // ¡Importa la librería!
import ActionModal from '../components/ActionModal';

const EyeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeSlashIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 .847 0 1.67.128 2.453.375m7.343 12.25A10.03 10.03 0 0112 19c-2.27 0-4.41-.896-6-2.42m12.79-1.92A9.97 9.97 0 0012 5c-2.27 0-4.41.896-6 2.42m-.38 9.12A9.97 9.97 0 013 12M3.12 3.12l17.76 17.76" />
  </svg>
);

const ProfilePage = () => {
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
      <div className="text-white max-w-4xl mx-auto p-4 md:p-8">
        <h1 className="text-4xl font-bold mb-8">Mi Perfil</h1>

        {/* --- SECCIÓN DE DATOS PERSONALES (MODIFICADA) --- */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-6">Información de la Cuenta</h2>
          
          {/* Campos para Nombre y Apellido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label htmlFor="first_name" className="block text-gray-400 mb-2">Nombre</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={profile.first_name}
                onChange={handleProfileChange}
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-gray-400 mb-2">Apellido</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={profile.last_name}
                onChange={handleProfileChange}
                placeholder="Tu apellido"
              />
            </div>
          </div>
          
          {/* Campo de Correo Electrónico (no editable) */}
          <div className="mb-6">
            <label className="block text-gray-400 mb-2">Correo Electrónico</label>
            <p className="bg-gray-900 p-3 rounded-lg text-gray-300">{profile.email}</p>
          </div>

          {/* Botón para guardar los cambios del perfil */}
          <button 
            onClick={handleSaveChanges}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Guardar Cambios
          </button>
        </div>

        {/* --- SECCIÓN CAMBIAR CONTRASEÑA (sin cambios en la estructura) --- */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">Cambiar Contraseña</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            
            {/* Contraseña Actual */}
            <div className="relative">
              <label htmlFor="currentPassword">Contraseña Actual</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                id="currentPassword" name="currentPassword"
                value={passwords.currentPassword} onChange={handlePasswordChange}
                className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg p-3 mt-2 pr-10" required
              />
              <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center">
                {showPasswords ? <EyeSlashIcon className="h-5 w-5 text-gray-400"/> : <EyeIcon className="h-5 w-5 text-gray-400"/>}
              </button>
            </div>
            
            {/* Nueva Contraseña */}
            <div className="relative">
              <label htmlFor="newPassword">Nueva Contraseña (mín. 8 caracteres)</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                id="newPassword" name="newPassword"
                value={passwords.newPassword} onChange={handlePasswordChange}
                className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg p-3 mt-2 pr-10" required
              />
              <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center">
                {showPasswords ? <EyeSlashIcon className="h-5 w-5 text-gray-400"/> : <EyeIcon className="h-5 w-5 text-gray-400"/>}
              </button>
            </div>

            {/* Confirmar Nueva Contraseña */}
            <div className="relative">
              <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                id="confirmPassword" name="confirmPassword"
                value={passwords.confirmPassword} onChange={handlePasswordChange}
                className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg p-3 mt-2 pr-10" required
              />
              <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center">
                {showPasswords ? <EyeSlashIcon className="h-5 w-5 text-gray-400"/> : <EyeIcon className="h-5 w-5 text-gray-400"/>}
              </button>
            </div>
            
            <button type="submit" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 font-bold py-2 px-6 rounded-lg">
              Cambiar Contraseña
            </button>
          </form>
        </div>
      </div>

      {/* --- MODAL PARA NOTIFICACIONES --- */}
      <ActionModal
        isOpen={actionModal.isOpen}
        onRequestClose={() => setActionModal({ ...actionModal, isOpen: false })}
        title={actionModal.title}
        message={actionModal.message}
        showConfirmButton={false} // Oculta el botón de "Confirmar"
        isInfoOnly={true}       // Estilo para solo mostrar información
      />
    </>
  );
};

export default ProfilePage;