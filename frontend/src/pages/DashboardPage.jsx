import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axiosConfig'; // Asegúrate de que la ruta a tu cliente API sea correcta
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import AddActivityModal from '../components/AddActivityModal'; // <-- ¡IMPORTADO!

// --- Colores y funciones de ayuda ---
const CATEGORY_COLORS = {
  estudio: '#3b82f6',
  trabajo: '#8b5cf6',
  ejercicio: '#ef4444',
  ocio: '#22c55e',
  personal: '#f97316',
  familia: '#ec4899',
  default: '#6b7280',
};
const getColor = (category) => CATEGORY_COLORS[category] || CATEGORY_COLORS.default;

// --- NUEVA FUNCIÓN ---: Formateador de fecha inteligente
// Esta función nos dirá si un evento es "Hoy", "Mañana" o en una fecha específica
const formatEventDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const timeOptions = { hour: '2-digit', minute: '2-digit' };
  
  if (date.toDateString() === now.toDateString()) {
    return `Hoy, ${date.toLocaleTimeString([], timeOptions)}`;
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Mañana, ${date.toLocaleTimeString([], timeOptions)}`;
  }
  // Formato para otros días, ej: "vie. 7 nov, 14:30"
  // Usamos 'es-ES' para el formato en español
  return date.toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', ...timeOptions });
};

const ActionButtons = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
    <Link 
      to="/actividades" 
      className="group bg-slate-900 border border-slate-800 px-6 py-5 rounded-xl hover:border-purple-500/50 text-center transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/20"
    >
      <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:from-purple-500/30 group-hover:to-blue-500/30 transition-all">
        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      </div>
      <span className="text-purple-400 text-base font-semibold block group-hover:text-purple-300 transition-colors">
        Gestionar Actividades
      </span>
    </Link>

    <Link 
      to="/calendario" 
      className="group bg-slate-900 border border-slate-800 px-6 py-5 rounded-xl hover:border-purple-500/50 text-center transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/20"
    >
      <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:from-purple-500/30 group-hover:to-blue-500/30 transition-all">
        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <span className="text-purple-400 text-base font-semibold block group-hover:text-purple-300 transition-colors">
        Generar Horario
      </span>
    </Link>

    <Link 
      to="/schedules" 
      className="group bg-slate-900 border border-slate-800 px-6 py-5 rounded-xl hover:border-purple-500/50 text-center transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/20"
    >
      <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:from-purple-500/30 group-hover:to-blue-500/30 transition-all">
        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <span className="text-purple-400 text-base font-semibold block group-hover:text-purple-300 transition-colors">
        Ver Rutinas
      </span>
    </Link>

    <Link 
      to="/profile" 
      className="group bg-slate-900 border border-slate-800 px-6 py-5 rounded-xl hover:border-purple-500/50 text-center transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/20"
    >
      <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:from-purple-500/30 group-hover:to-blue-500/30 transition-all">
        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <span className="text-purple-400 text-base font-semibold block group-hover:text-purple-300 transition-colors">
        Mi Perfil
      </span>
    </Link>
  </div>
);


// --- Componente Principal DashboardPage ---
const DashboardPage = () => {
  const [userName, setUserName] = useState('');
  const [activeSchedule, setActiveSchedule] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [userResponse, scheduleResponse] = await Promise.all([
          apiClient.get('/users/me'),
          apiClient.get('/schedules/active/')
        ]);

        setUserName(userResponse.data.first_name || 'Usuario');
        
        const schedule = scheduleResponse.data;
        setActiveSchedule(schedule);

        // --- ¡INICIO DE LA NUEVA LÓGICA MEJORADA! ---

        const now = new Date();
        const allUpcomingEvents = [];

        // 1. Iteramos por los próximos 7 días (0 = hoy, 1 = mañana, etc.)
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
          
          // 2. Calculamos la fecha y el día de la semana para el día que estamos revisando
          const targetDate = new Date(now);
          targetDate.setDate(now.getDate() + dayOffset);
          const targetDayIndex = targetDate.getDay(); // JS: 0=Domingo, 1=Lunes, ... 6=Sábado
          
          // 3. Filtramos los eventos de la plantilla que coinciden con ese día de la semana
          const eventsForTargetDay = schedule.events.filter(event => 
            new Date(event.start).getDay() === targetDayIndex
          );

          // 4. Proyectamos esos eventos a la fecha 'targetDate' (hoy, mañana, etc.)
          for (const event of eventsForTargetDay) {
            const templateTime = new Date(event.start);
            
            // Creamos una nueva fecha para el evento, usando el AÑO/MES/DÍA de 'targetDate'
            // pero la HORA/MINUTO/SEGUNDO de la plantilla
            const projectedStartDate = new Date(targetDate);
            projectedStartDate.setHours(
              templateTime.getHours(),
              templateTime.getMinutes(),
              templateTime.getSeconds(),
              0 // reseteamos milisegundos
            );

            // 5. ¡IMPORTANTE! Solo añadimos el evento si esta fecha proyectada está en el futuro
            if (projectedStartDate > now) {
              allUpcomingEvents.push({
                ...event,
                // Sobrescribimos 'start' con la fecha futura correcta
                start: projectedStartDate.toISOString(), 
              });
            }
          }
        }

        // 6. Ahora 'allUpcomingEvents' tiene todas las tareas de los próximos 7 días.
        // Las ordenamos y tomamos las 3 primeras.
        const futureEvents = allUpcomingEvents
          .sort((a, b) => new Date(a.start) - new Date(b.start)) // Ordenar por más cercano
          .slice(0, 3); // Tomar solo los primeros 3
        
        setUpcomingEvents(futureEvents);
        // --- FIN DE LA NUEVA LÓGICA ---
        
        setError(null);
        
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError('No hay una rutina activa. Activa una desde "Ver Rutinas" para ver tu dashboard.');
        } else {
          console.error("Error fetching dashboard data:", err);
          setError('No se pudo cargar la información del dashboard.');
        }
        setActiveSchedule(null);
        setUpcomingEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const weeklyCategoryDistribution = useMemo(() => {
    if (!activeSchedule?.events) return [];
    const categoryHours = activeSchedule.events.reduce((acc, event) => {
      const duration = (new Date(event.end) - new Date(event.start)) / 36e5; // horas
      const category = event.category || 'default';
      acc[category] = (acc[category] || 0) + duration;
      return acc;
    }, {});

    return Object.entries(categoryHours)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(1)) }))
      .filter(item => item.value > 0);
  }, [activeSchedule]);


  // --- Estructura Principal del Componente ---
  return (
  <div className="p-6 sm:p-8 space-y-6 text-white min-h-screen">
    
    {/* --- SALUDO --- */}
    {!isLoading && userName && (
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          ¡Hola, <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{userName}</span>!
        </h1>
        {activeSchedule && (
          <p className="text-base text-slate-400">
            Tu rutina activa es: <span className="font-semibold text-purple-400">{activeSchedule.name}</span>
          </p>
        )}
      </div>
    )}

    {/* --- Contenido Principal del Dashboard --- */}
    <div className="space-y-6">
      {isLoading && (
        <div className="text-center p-16 text-slate-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p>Cargando dashboard...</p>
        </div>
      )}

      {/* SI NO hay rutina activa */}
      {!isLoading && !activeSchedule && (
        <div className="text-center p-12 bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl mx-auto shadow-xl">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-3">
            ¡Bienvenido a tu Dashboard!
          </h2>
          <p className="text-slate-300 leading-relaxed">
            Actualmente no tienes una rutina activa. Cuando actives una, aquí podrás ver tu agenda del día y la distribución de tus actividades.
          </p>
        </div>
      )}

      {/* SI SÍ hay rutina activa */}
      {!isLoading && activeSchedule && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* --- Próximas Tareas --- */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
              <h2 className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-bold text-xl mb-5">
                Próximas Tareas
              </h2>
              {upcomingEvents.length > 0 ? (
                <ul className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {upcomingEvents.map(event => (
                    <li 
                      key={event.id || event.start} 
                      className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/30 transition-all duration-200"
                    >
                      <div 
                        className="w-1 h-12 rounded-full mt-0.5 flex-shrink-0" 
                        style={{ backgroundColor: getColor(event.category) }}
                      ></div>
                      <div className="flex-grow min-w-0">
                        <p className="font-semibold text-white text-sm mb-1 truncate">{event.title}</p>
                        <span className="font-mono text-slate-400 text-xs">
                          {formatEventDate(event.start)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-400 text-sm">¡Genial! No tienes tareas próximas.</p>
                </div>
              )}
            </div>

            {/* --- Distribución Semanal --- */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col">
              <h2 className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-bold text-xl mb-5">
                Distribución Semanal
              </h2>
              {weeklyCategoryDistribution.length > 0 ? (
                <div className="flex-grow w-full min-h-[300px]">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie 
                        data={weeklyCategoryDistribution} 
                        cx="50%" 
                        cy="50%" 
                        labelLine={false} 
                        outerRadius="75%" 
                        fill="#8884d8" 
                        dataKey="value" 
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {weeklyCategoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          background: '#0f172a', 
                          border: '1px solid #334155',
                          borderRadius: '0.75rem',
                          color: '#fff'
                        }} 
                        formatter={(value) => [`${value} horas`, null]} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-grow flex items-center justify-center">
                  <p className="text-slate-400 text-sm">No hay datos para mostrar la distribución.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* --- SECCIÓN DE ACCIONES --- */}
      {!isLoading && (
        <div className="text-center pt-8 mt-6 border-t border-slate-800">
          <h2 className="text-xl font-semibold mb-6 text-slate-300">¿Qué quieres hacer ahora?</h2>
          <ActionButtons />
        </div>
      )}
    </div>
  </div>
);

};

export default DashboardPage;