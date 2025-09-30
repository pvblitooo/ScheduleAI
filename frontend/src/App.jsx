import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import ActivitiesPage from './pages/ActivitiesPage';
import CalendarPage from './pages/CalendarPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SavedSchedulesPage from './pages/SavedSchedulesPage';
import ProfilePage from './pages/ProfilePage';

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
          <Route path="/login" element={!token ? <LoginPage handleLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/register" element={!token ? <RegisterPage /> : <Navigate to="/" />} />
          <Route path="/" element={token ? <MainLayout handleLogout={handleLogout} /> : <Navigate to="/login" />}>
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