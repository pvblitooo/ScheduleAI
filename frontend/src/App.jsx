import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import ActivitiesPage from './pages/ActivitiesPage';
import CalendarPage from './pages/CalendarPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SavedSchedulesPage from './pages/SavedSchedulesPage';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 w-full">
        <Routes>
          {/* Rutas Públicas: solo accesibles si NO hay token */}
          <Route path="/login" element={!token ? <LoginPage handleLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/register" element={!token ? <RegisterPage /> : <Navigate to="/" />} />
          
          {/* --- ESTRUCTURA DE RUTA ANIDADA CORRECTA --- */}
          {/* Esta es la ruta protegida que actúa como layout */}
          <Route 
            path="/" 
            element={token ? <MainLayout handleLogout={handleLogout} /> : <Navigate to="/login" />}
          >
            {/* Estas rutas hijas se renderizarán dentro del <Outlet /> de MainLayout */}
            
            {/* La ruta 'index' es la que se muestra para el path del padre ('/') */}
            <Route index element={<DashboardPage />} /> 
            
            {/* Las rutas hijas son relativas a la del padre. No necesitan el '/' al principio */}
            <Route path="actividades" element={<ActivitiesPage />} />
            <Route path="calendario" element={<CalendarPage />} />
            <Route path="schedules" element={<SavedSchedulesPage />} />
            {/* Ruta comodín para cualquier otra cosa dentro de las rutas protegidas */}
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;