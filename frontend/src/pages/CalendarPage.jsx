import { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import useLocalStorage from '../hooks/useLocalStorage';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

const CalendarPage = () => {
  const [schedule, setSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useLocalStorage('userPreferences', { startHour: 8, endHour: 22 });
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await apiClient.get('/activities/');
        setActivities(response.data);
      } catch (error) {
        console.error("Error al cargar actividades:", error);
      }
    };
    fetchActivities();
  }, []);
  
  const handleGenerateSchedule = async () => {
    setIsLoading(true);
    setSchedule([]);
    try {
      const response = await apiClient.post('/generate-schedule', preferences);
      const finalEvents = response.data.map(event => {
        let backgroundColor = '#3b82f6';
        const title = event.title.toLowerCase();
        if (title.includes('descanso') || title.includes('ocio')) backgroundColor = '#22c55e';
        else if (title.includes('comida') || title.includes('almuerzo')) backgroundColor = '#f97316';
        else if (title.includes('ejercicio')) backgroundColor = '#ef4444';
        return { ...event, allDay: false, backgroundColor, borderColor: backgroundColor };
      });
      setSchedule(finalEvents);
    } catch (error) {
      console.error("Error al generar el horario:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePreferencesChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({ ...prev, [name]: parseInt(value) }));
  };

  return (
    <div className="text-white">
      <div className="bg-gray-800 p-6 rounded-lg mb-8">
        <h2 className="text-xl mb-4">Preferencias de tu Semana Ideal</h2>
        <div className="flex items-center gap-6">
          <label>Empezar día a las: <input type="number" name="startHour" value={preferences.startHour} onChange={handlePreferencesChange} className="w-20 bg-gray-700 rounded p-2" />:00 hs</label>
          <label>Terminar día a las: <input type="number" name="endHour" value={preferences.endHour} onChange={handlePreferencesChange} className="w-20 bg-gray-700 rounded p-2" />:00 hs</label>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg mt-8">
        <h2 className="text-xl mb-4">Generador de Rutina Semanal</h2>
        <button onClick={handleGenerateSchedule} disabled={isLoading || activities.length === 0} className="w-full bg-purple-600 hover:bg-purple-700 font-bold py-3 px-4 rounded disabled:opacity-50">
          {isLoading ? 'Creando tu semana ideal...' : (activities.length === 0 ? 'Añade actividades primero' : 'Crear mi rutina semanal')}
        </button>
        
        <div className="mt-6 bg-white text-gray-800 rounded-lg p-4">
          {isLoading ? <p className="text-center p-8">Optimizando tu tiempo...</p> : (
            <FullCalendar
              plugins={[timeGridPlugin, dayGridPlugin]}
              
              // --- CONFIGURACIÓN DE VISTA LUNES-DOMINGO ---
              initialView="timeGrid"          // 1. Usamos la vista 'timeGrid' genérica
              duration={{ weeks: 1 }}        // 2. Le decimos que dure exactamente 1 semana
              headerToolbar={false}
              initialDate='2024-01-01'
              dayHeaderFormat={{ weekday: 'long' }}
              allDaySlot={false}
              firstDay={1}                     // 3. Importante: mantenemos que el Lunes es el primer día

              events={schedule}
              locale='es'
              slotMinTime={`${String(preferences.startHour).padStart(2, '0')}:00:00`}
              slotMaxTime={`${String(preferences.endHour).padStart(2, '0')}:00:00`}
              height="auto"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;