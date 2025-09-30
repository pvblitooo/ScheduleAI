import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const MainLayout = ({ handleLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Clases para el enlace activo, usando la funcionalidad de NavLink
  const linkClasses = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-gray-900 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;
  
  const mobileLinkClasses = ({ isActive }) =>
    `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
      isActive
        ? 'bg-gray-900 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <nav className="bg-gray-800 shadow-lg sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo y Navegación de Escritorio */}
            <div className="flex items-center">
              <span className="text-2xl font-bold text-purple-400">ScheduleAI</span>
              {/* Los enlaces solo se muestran en pantallas medianas y grandes */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <NavLink to="/" className={linkClasses}>Dashboard</NavLink>
                  <NavLink to="/actividades" className={linkClasses}>Actividades</NavLink>
                  <NavLink to="/calendario" className={linkClasses}>Calendario</NavLink>
                  <NavLink to="/schedules" className={linkClasses}>Rutinas</NavLink>
                  <NavLink to="/profile" className={linkClasses}>Mi Perfil</NavLink>
                </div>
              </div>
            </div>

            {/* Botón de Cerrar Sesión (Escritorio) */}
            <div className="hidden md:block">
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Cerrar Sesión
              </button>
            </div>

            {/* Botón de Menú Hamburguesa (Móvil) */}
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                type="button"
                className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">Abrir menú principal</span>
                {/* Icono de hamburguesa o de cierre */}
                {isMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menú Desplegable (Móvil) */}
        {isMenuOpen && (
          <div className="md:hidden" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <NavLink to="/" onClick={() => setIsMenuOpen(false)} className={mobileLinkClasses}>Dashboard</NavLink>
              <NavLink to="/actividades" onClick={() => setIsMenuOpen(false)} className={mobileLinkClasses}>Actividades</NavLink>
              <NavLink to="/calendario" onClick={() => setIsMenuOpen(false)} className={mobileLinkClasses}>Calendario</NavLink>
              <NavLink to="/schedules" onClick={() => setIsMenuOpen(false)} className={mobileLinkClasses}>Rutinas</NavLink>
              <NavLink to="/profile" onClick={() => setIsMenuOpen(false)} className={mobileLinkClasses}>Mi Perfil</NavLink>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-700 px-2 sm:px-3">
              <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full text-left bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-md transition-colors">
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Contenido Principal */}
      <main className="flex-grow w-full">
        {/* El Outlet renderiza la página activa */}
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;