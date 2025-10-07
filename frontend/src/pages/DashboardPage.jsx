import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axiosConfig'; // Asegúrate de que la ruta a tu cliente API sea correcta
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

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

const ActionButtons = () => (
  <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-12">
    <Link to="/actividades" className="bg-gray-800 px-8 py-4 rounded-lg hover:bg-gray-700/80 border border-transparent hover:border-purple-500 text-purple-400 text-lg font-semibold transition-all duration-300">
      Gestionar Actividades
    </Link>
    <Link to="/calendario" className="bg-gray-800 px-8 py-4 rounded-lg hover:bg-gray-700/80 border border-transparent hover:border-purple-500 text-purple-400 text-lg font-semibold transition-all duration-300">
      Generar Horario
    </Link>
    <Link to="/rutinas" className="bg-gray-800 px-8 py-4 rounded-lg hover:bg-gray-700/80 border border-transparent hover:border-purple-500 text-purple-400 text-lg font-semibold transition-all duration-300">
      Ver Rutinas
    </Link>
    <Link to="/mi-perfil" className="bg-gray-800 px-8 py-4 rounded-lg hover:bg-gray-700/80 border border-transparent hover:border-purple-500 text-purple-400 text-lg font-semibold transition-all duration-300">
      Mi Perfil
    </Link>
  </div>
);

const DailySummary = ({ events }) => {
  if (!events.length) {
    return (
      <div className="bg-gray-700/50 p-4 rounded-lg text-center text-gray-300 mb-8 max-w-4xl mx-auto">
        <p>✨ ¡Día despejado! No tienes actividades programadas para hoy. ✨</p>
      </div>
    );
  }

  const totalEvents = events.length;
  // Obtenemos la hora del primer y último evento del día
  const earliest = new Date(Math.min(...events.map(e => new Date(e.start))));
  const latest = new Date(Math.max(...events.map(e => new Date(e.end))));

  return (
    <div className="bg-gray-700/50 p-4 rounded-lg text-center text-gray-300 mb-8 max-w-4xl mx-auto">
      <p>Hoy tienes <span className="font-bold text-purple-400">{totalEvents}</span> {totalEvents === 1 ? 'actividad' : 'actividades'} desde las <span className="font-bold text-white">{earliest.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> hasta las <span className="font-bold text-white">{latest.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>.</p>
    </div>
  );
};

// --- Componente Principal DashboardPage ---
const DashboardPage = () => {
  const [userName, setUserName] = useState('');
  const [activeSchedule, setActiveSchedule] = useState(null);
  const [todaysEvents, setTodaysEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Hacemos ambas peticiones en paralelo para mayor eficiencia
        const [userResponse, scheduleResponse] = await Promise.all([
          apiClient.get('/users/me'),
          apiClient.get('/schedules/active/')
        ]);

        // Procesamos los datos del usuario
        setUserName(userResponse.data.first_name || 'Usuario');
        
        // Procesamos los datos de la rutina
        const schedule = scheduleResponse.data;
        setActiveSchedule(schedule);

        const now = new Date();
        // Ajuste para que Domingo sea 6 (JS lo da como 0 por defecto)
        const dayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;
        
        const eventsForToday = schedule.events
          .filter(event => new Date(event.start).getDay() === now.getDay())
          .sort((a, b) => new Date(a.start) - new Date(b.start));
        
        setTodaysEvents(eventsForToday);
        setError(null);
        
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError('No hay una rutina activa. Activa una desde "Ver Rutinas" para ver tu dashboard.');
        } else {
          console.error("Error fetching dashboard data:", err);
          setError('No se pudo cargar la información del dashboard.');
        }
        setActiveSchedule(null);
        setTodaysEvents([]);
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
    <div className="p-4 sm:p-8 space-y-8 text-white">
      
      {/* --- SALUDO (ARRIBA) --- */}
      {!isLoading && !error && userName && (
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            ¡Hola, <span className="text-purple-400">{userName}</span>!
          </h1>
          {activeSchedule && (
            <p className="text-lg text-gray-400">
              Tu rutina activa es: <span className="font-semibold">{activeSchedule.name}</span>
            </p>
          )}
        </div>
      )}

      {/* --- Contenido Principal del Dashboard --- */}
      <div className="space-y-8">
        {isLoading && (
          <div className="text-center p-10 text-gray-400">Cargando dashboard...</div>
        )}

        {!isLoading && error && (
          <div className="text-center p-10 bg-gray-800 rounded-xl">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Atención</h2>
            <p className="text-gray-300">{error}</p>
          </div>
        )}

        {!isLoading && !error && activeSchedule && (
          <>
            <DailySummary events={todaysEvents} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Columna Izquierda: Agenda para Hoy */}
              <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-purple-400 font-bold text-xl mb-4">Agenda para Hoy</h2>
                {todaysEvents.length > 0 ? (
                  <ul className="space-y-4 max-h-96 overflow-y-auto">
                    {todaysEvents.map(event => (
                      <li key={event.id || event.start} className="flex items-center gap-3">
                        <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: getColor(event.category) }}></div>
                        <span className="font-mono text-gray-400 text-sm">{new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <p className="flex-grow">{event.title}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">No hay actividades programadas para hoy.</p>
                )}
              </div>

              {/* Columna Derecha: Distribución Semanal */}
              <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col">
                <h2 className="text-purple-400 font-bold text-xl mb-4">Distribución Semanal</h2>
                {weeklyCategoryDistribution.length > 0 ? (
                  <div className="flex-grow w-full min-h-[300px]">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie 
                          data={weeklyCategoryDistribution} 
                          cx="50%" 
                          cy="50%" 
                          labelLine={false} 
                          outerRadius="80%" 
                          fill="#8884d8" 
                          dataKey="value" 
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {weeklyCategoryDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={getColor(entry.name)} />)}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ background: '#1F2937', border: '1px solid #4B5563' }} 
                          formatter={(value) => [`${value} horas`, null]} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-gray-400 m-auto">No hay datos para mostrar la distribución.</p>
                )}
              </div>
            </div>

            {/* --- SECCIÓN DE ACCIONES (AHORA AL FINAL) --- */}
            <div className="text-center pt-12 mt-8 border-t border-gray-700/50">
                <h2 className="text-2xl font-semibold mb-6 text-gray-300">¿Qué quieres hacer ahora?</h2>
                <ActionButtons />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;