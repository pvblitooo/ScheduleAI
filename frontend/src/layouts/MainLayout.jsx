import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const MainLayout = ({ handleLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- Clases de Enlaces (MODIFICADAS) ---
  const linkClasses = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-slate-200 text-purple-600 border border-slate-300 dark:bg-slate-800 dark:text-purple-400 dark:border-slate-700' // Estado Activo
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/50' // Estado Inactivo
    }`;
  
  const mobileLinkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
      isActive
        ? 'bg-slate-200 text-purple-600 border border-slate-300 dark:bg-slate-800 dark:text-purple-400 dark:border-slate-700' // Estado Activo
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/50' // Estado Inactivo
    }`;

  return (
    // --- MODIFICADO ---
    // Quitamos 'bg-slate-950' de aquí, el 'body' ya tiene el color base
    <div className="min-h-screen flex flex-col">
      
      {/* --- Navbar (MODIFICADA) --- */}
      <nav className="bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <div className="flex items-center gap-8">
              {/* Logo (No necesita cambios, el gradiente se ve bien en ambos) */}
              <NavLink to="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  ScheduleAI
                </span>
              </NavLink>

              {/* Enlaces Desktop (Usan las clases modificadas) */}
              <div className="hidden md:flex items-center space-x-1">
                <NavLink to="/" className={linkClasses}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Dashboard</span>
                </NavLink>
                <NavLink to="/actividades" className={linkClasses}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span>Actividades</span>
                </NavLink>
                <NavLink to="/calendario" className={linkClasses}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Calendario</span>
                </NavLink>
                <NavLink to="/schedules" className={linkClasses}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Rutinas</span>
                </NavLink>
                <NavLink to="/profile" className={linkClasses}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Mi Perfil</span>
                </NavLink>
              </div>
            </div>

            {/* Botón Cerrar Sesión (MODIFICADO) */}
            <div className="hidden md:block">
              <button 
                onClick={handleLogout} 
                className="group w-10 h-10 bg-red-100 hover:bg-red-600 rounded-lg flex items-center justify-center transition-all duration-200 border-2 border-red-200 hover:border-red-500 hover:scale-105 dark:bg-red-600/10 dark:hover:bg-red-600 dark:border-red-600/30 dark:hover:border-red-500"
                title="Cerrar Sesión"
              >
                <svg 
                  className="w-5 h-5 text-red-500 group-hover:text-white transition-colors" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2.5} 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                  />
                </svg>
              </button>
            </div>

            {/* Botón Hamburguesa (MODIFICADO) */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                type="button"
                className="bg-slate-100 dark:bg-slate-800 inline-flex items-center justify-center p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none transition-colors"
                aria-controls="mobile-menu"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">Abrir menú principal</span>
                {isMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menú Desplegable (MODIFICADO) */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800" id="mobile-menu">
            <div className="px-4 pt-2 pb-3 space-y-1">
              {/* Los enlaces ya usan las clases dinámicas */}
              <NavLink to="/" onClick={() => setIsMenuOpen(false)} className={mobileLinkClasses}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/actividades" onClick={() => setIsMenuOpen(false)} className={mobileLinkClasses}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                <span>Actividades</span>
              </NavLink>
              <NavLink to="/calendario" onClick={() => setIsMenuOpen(false)} className={mobileLinkClasses}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Calendario</span>
              </NavLink>
              <NavLink to="/schedules" onClick={() => setIsMenuOpen(false)} className={mobileLinkClasses}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span>Rutinas</span>
              </NavLink>
              <NavLink to="/profile" onClick={() => setIsMenuOpen(false)} className={mobileLinkClasses}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span>Mi Perfil</span>
              </NavLink>
            </div>

            {/* Botón Logout Móvil (MODIFICADO) */}
            <div className="pt-3 pb-4 border-t border-slate-200 dark:border-slate-800 px-4">
              <button 
                onClick={() => { handleLogout(); setIsMenuOpen(false); }} 
                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-red-600 text-slate-600 hover:text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 border border-slate-300 hover:border-red-500 dark:bg-slate-800 dark:hover:bg-red-600 dark:text-slate-300 dark:hover:text-white dark:border-slate-700 dark:hover:border-red-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Contenido Principal */}
      <main className="flex-grow w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;

