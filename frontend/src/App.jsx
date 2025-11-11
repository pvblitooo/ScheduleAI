import { Player } from '@lottiefiles/react-lottie-player';
import loading from './assets/loading-animation.json';
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import apiClient from './api/axiosConfig';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const minDelay = new Promise(resolve => setTimeout(resolve, 3000));

      try {
        const [response] = await Promise.all([
          apiClient.get('/users/me').catch(e => null), 
          minDelay
        ]);
        
        if (response && response.data) {
          setUser(response.data);
        } else {
          setUser(null);
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error("Error inesperado en checkAuthStatus:", error);
        setUser(null);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    window.location.href = '/';
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/logout');
    } catch (error) {
      console.error("Error en el servidor al cerrar sesión:", error);
    }
    
    localStorage.removeItem('token');
    setUser(null);
  };

  // Pantalla de carga mejorada
    if (isLoading) {
    return (
      // --- MODIFICADO ---
      // Aplicamos el fondo del body (que viene de index.css)
      // y ajustamos los colores del texto
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="space-y-6 flex flex-col items-center">
          <div className="scale-75">
            <Player
              autoplay
              loop
              src={loading}
              style={{ height: '300px', width: '300px' }}
            />
          </div>
          <div className="space-y-3 text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              ScheduleAI
            </h2>
            <div className="flex items-center justify-center gap-2">
              {/* --- MODIFICADO --- */}
              <p className="text-slate-600 dark:text-slate-300 text-lg">Cargando</p>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
          {/* --- MODIFICADO --- */}
          <div className="w-48 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700">
            <div className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full animate-pulse" style={{ width: '65%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* --- MODIFICADO --- */}
      {/* Ya no necesitamos 'bg-slate-950' aquí. El color lo pone el 'body' desde index.css */}
      <div className="min-h-screen w-full">
        <Routes>
          <Route path="/login" element={!user ? <LoginPage handleLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
          
          <Route path="/" element={user ? <MainLayout handleLogout={handleLogout} user={user} /> : <Navigate to="/login" />}>
            <Route index element={<DashboardPage />} /> 
            <Route path="actividades" element={<ActivitiesPage />} />
            <Route path="calendario" element={<CalendarPage />} />
            <Route path="schedules" element={<SavedSchedulesPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;