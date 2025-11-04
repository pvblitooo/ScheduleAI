import { Player } from '@lottiefiles/react-lottie-player';
import loading from './assets/loading-animation.json';
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
      
      const minDelay = new Promise(resolve => setTimeout(resolve, 3000));

      try {
        // --- ¡AQUÍ ESTÁ EL ARREGLO! ---
        // Añadimos .catch(e => null) a la llamada de la API.
        // Esto "atrapa" el error 401 y devuelve 'null' en lugar de romper
        // el Promise.all. Ahora, la app SIEMPRE esperará los 3 segundos.
        const [response] = await Promise.all([
          apiClient.get('/users/me').catch(e => null), 
          minDelay
        ]);
        
        // Si la llamada tuvo éxito, 'response' tendrá datos.
        // Si la llamada falló (401), 'response' será 'null'.
        if (response && response.data) {
          setUser(response.data);
        } else {
          // Esto se ejecuta si la API devolvió 401 (response es null)
          setUser(null);
          localStorage.removeItem('token');
        }

      } catch (error) {
        // Este catch ahora es solo para errores totalmente inesperados
        console.error("Error inesperado en checkAuthStatus:", error);
        setUser(null);
        localStorage.removeItem('token');
      } finally {
        // Esto se ejecuta después de que AMBAS promesas (API + 3s delay) han terminado.
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []); // El array vacío
  // --- FIN DE LA MODIFICACIÓN ---

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <Player
        autoplay
        loop
        src={loading} // <-- ¡Ahora React sabe qué es "loading"!
        style={{ height: '300px', width: '300px' }}
      >
      </Player>
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