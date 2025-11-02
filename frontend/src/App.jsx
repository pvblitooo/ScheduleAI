import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import apiClient from './api/axiosConfig'; // <--- ¡IMPORTANTE!

import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import ActivitiesPage from './pages/ActivitiesPage';
import CalendarPage from './pages/CalendarPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SavedSchedulesPage from './pages/SavedSchedulesPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const [user, setUser] = useState(null);
  // Empezamos en 'true' para mostrar "Cargando..." mientras validamos la cookie
  const [isLoading, setIsLoading] = useState(true);

  // Este efecto se ejecuta UNA VEZ cuando la app carga
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Hacemos una llamada a /users/me para validar la sesión (cookie o token)
        const response = await apiClient.get('/users/me');
        setUser(response.data); // ¡Éxito! Guardamos el usuario.
      } catch (error) {
        // 401: No hay sesión válida
        setUser(null);
        localStorage.removeItem('token'); // Limpiamos por si acaso
      } finally {
        setIsLoading(false); // En cualquier caso, dejamos de cargar.
      }
    };

    checkAuthStatus();
  }, []); // El array vacío [] significa que esto solo se ejecuta al montar

  // handleLogin guarda el token y RECARGA la página.
  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    window.location.href = '/'; // Recarga para re-validar con el useEffect
  };

  const handleLogout = async () => {
    try {
      // 1. Le decimos al backend que invalide la cookie y la borre
      await apiClient.post('/logout');
      
    } catch (error) {
      // Aunque el backend falle (ej. red caída), igual cerramos sesión en el frontend.
      console.error("Error en el servidor al cerrar sesión:", error);
    }
    
    // 2. Limpiamos el estado y el localStorage del frontend
    localStorage.removeItem('token');
    setUser(null);
    // La app nos redirigirá automáticamente al login porque 'user' es null
  };

  // Pantalla de carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  // Las rutas se protegen con el estado 'user'
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 w-full">
        <Routes>
          <Route path="/login" element={!user ? <LoginPage handleLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
          
          {/* Rutas protegidas */}
          <Route path="/" element={user ? <MainLayout handleLogout={handleLogout} user={user} /> : <Navigate to="/login" />}>
            <Route index element={<DashboardPage />} /> 
            <Route path="actividades" element={<ActivitiesPage />} />
            <Route path="calendario" element={<CalendarPage />} />
            <Route path="schedules" element={<SavedSchedulesPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" />} /> {/* Redirige rutas no encontradas al dashboard */}
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;