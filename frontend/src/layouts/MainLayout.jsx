import { NavLink, Outlet } from 'react-router-dom';

const MainLayout = ({ handleLogout }) => {
  const activeLinkStyle = {
    color: '#60a5fa', // Un azul brillante para el enlace activo
    borderBottom: '2px solid #60a5fa',
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white shadow-lg sticky top-0 z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-6">
              <span className="text-2xl font-bold text-purple-400">ScheduleAI</span>
              <NavLink to="/" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="py-2 px-1 hover:text-purple-300 transition-colors">Dashboard</NavLink>
              <NavLink to="/actividades" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="py-2 px-1 hover:text-purple-300 transition-colors">Actividades</NavLink>
              <NavLink to="/calendario" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="py-2 px-1 hover:text-purple-300 transition-colors">Calendario</NavLink>
            </div>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 font-bold py-2 px-4 rounded-lg transition-colors">
              Cerrar Sesión
            </button>
          </div>
        </nav>
      </header>
      <main className="flex-grow w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet /> {/* ¡La magia sucede aquí! React Router renderiza la página activa */}
      </main>
    </div>
  );
};

export default MainLayout;