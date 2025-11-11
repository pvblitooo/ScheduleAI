import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom'; 
import apiClient from '../api/axiosConfig';
import useLocalStorage from '../hooks/useLocalStorage';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';

// Importamos todos nuestros modales
import EventModal from '../components/EventModal';
import SaveScheduleModal from '../components/SaveScheduleModal';
import ActionModal from '../components/ActionModal';
import DraggableActivity from '../components/DraggableActivity';
import PreferencesModal from '../components/PreferencesModal';

const getColorForCategory = (category) => {
  switch (category) {
    case 'estudio': return '#3b82f6';  // Azul
    case 'trabajo': return '#8b5cf6';  // Púrpura
    case 'ejercicio': return '#ef4444'; // Rojo
    case 'ocio': return '#22c55e';     // Verde
    case 'personal': return '#f97316';  // Naranja
    case 'familia': return '#ec4899';   // Rosa
    default: return '#6b7280';         // Gris por defecto
  }
};

const CalendarPage = () => {
  // --- ESTADOS ---
  const [schedule, setSchedule] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preferences, setPreferences] = useLocalStorage('userPreferences', { startHour: 8, endHour: 22, peakHours: [], });
  
  
  // Estados para la gestión de la rutina actual
  const [currentScheduleId, setCurrentScheduleId] = useState(null);
  const [currentScheduleName, setCurrentScheduleName] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // Estados para modales
  const [eventModalIsOpen, setEventModalIsOpen] = useState(false);
  const [saveModalIsOpen, setSaveModalIsOpen] = useState(false);
  const [preferencesModalIsOpen, setPreferencesModalIsOpen] = useState(false); // ¡NUEVO ESTADO!
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [actionModal, setActionModal] = useState({ isOpen: false, title: '', message: '' });

  // Refs y hooks de navegación
  const externalEventsRef = useRef(null);
  const [calendarKey, setCalendarKey] = useState(0);
  const location = useLocation();

  // Carga inicial de datos
  useEffect(() => {
    const fetchActivitiesData = async () => {
      try {
        const activitiesResponse = await apiClient.get('/activities/');
        setActivities(activitiesResponse.data);
      } catch (error) {
        console.error("Error al cargar actividades:", error);
      }
    };
    fetchActivitiesData();
  }, []);

  useEffect(() => {
    if (location.state && location.state.scheduleToLoad) {
      handleLoadSchedule(location.state.scheduleToLoad);
      // Limpiamos el estado para no volver a cargarla si el usuario refresca la página
      window.history.replaceState({}, document.title)
    }
  }, [location.state]);

  useEffect(() => {
    let draggable = null; // Guardamos la instancia aquí para poder destruirla
    if (externalEventsRef.current) {
      draggable = new Draggable(externalEventsRef.current, {
        itemSelector: '.fc-event',
        eventData: function(eventEl) {
          return JSON.parse(eventEl.getAttribute('data-event'));
        }
      });
    }
    return () => {
      if (draggable) {
        draggable.destroy(); // Destruimos la instancia anterior
      }
    };
  }, [activities]); // La dependencia sigue siendo la misma

  const mapEventsWithColors = (events) => {
    return events.map((event, index) => {
        const color = getColorForCategory(event.category);
        return {
            ...event,
            id: event.id || `${Date.now()}-${index}`,
            allDay: false,
            backgroundColor: color,
            borderColor: color,
        };
      });
  };

  // Genera un nuevo horario
  const handleGenerateSchedule = async () => {
    setIsLoading(true);
    setSchedule([]);
    try {
        const response = await apiClient.post('/generate-schedule', preferences);
        // La IA ya devuelve la categoría, solo tenemos que pintarla.
        const eventsWithColors = mapEventsWithColors(response.data);
        setSchedule(eventsWithColors);
        setCurrentScheduleId(null);
        setIsDirty(true);
    } catch (error) {
        console.error("Error al generar el horario:", error);
        setActionModal({ isOpen: true, title: "Error de API", message: "No se pudo generar el horario. Revisa tu cuota de API." });
    } finally {
        setIsLoading(false);
    }
};
  
  // --- ¡CORRECCIONES CLAVE AQUÍ! ---

  // 1. "Limpia" los eventos quitando los IDs temporales antes de guardarlos
  const cleanEventsForBackend = (eventsToClean) => {
    return eventsToClean.map(({ id, ...rest }) => rest);
  };

  // 2. Carga una rutina y le asigna IDs a los eventos
  const handleLoadSchedule = (scheduleToLoad) => {
    let events = typeof scheduleToLoad.events === 'string' 
        ? JSON.parse(scheduleToLoad.events) 
        : scheduleToLoad.events;
    
    const eventsWithColors = mapEventsWithColors(events);
    
    setSchedule(eventsWithColors); // <- Corrección del nombre de la variable
    setCurrentScheduleId(scheduleToLoad.id);
    setCurrentScheduleName(scheduleToLoad.name); // <- Línea añadida
    setIsDirty(false);
    setCalendarKey(prevKey => prevKey + 1);
  };

  // 3. Maneja el Drag & Drop
  const handleEventChange = (changeInfo) => {
    const { event } = changeInfo;
    const newSchedule = schedule.map(evt => 
      evt.id === event.id 
        ? { ...evt, start: event.startStr, end: event.endStr } 
        : evt
    );
    setSchedule(newSchedule);
    setIsDirty(true);
  };

  // 4. Llama a la función de guardado o actualización correcta
  const handleSaveOrUpdate = () => {
    if (currentScheduleId) {
      handleUpdateSchedule();
    } else {
      setSaveModalIsOpen(true);
    }
  };

  // 5. Guarda una NUEVA rutina (usando los eventos limpios)
  const handleConfirmSaveNew = async (scheduleName) => {
    const cleanSchedule = cleanEventsForBackend(schedule);
    try {
        const response = await apiClient.post('/schedules/', { name: scheduleName, events: cleanSchedule });
        setCurrentScheduleId(response.data.id);
        setCurrentScheduleName(scheduleName); // <- Línea añadida
        setIsDirty(false);
        setActionModal({ isOpen: true, title: "Éxito", message: `Rutina "${scheduleName}" guardada.` });
        // La línea 'await fetchSavedSchedules();' se elimina.
    } catch (error) {
        console.error("Error al guardar:", error);
        setActionModal({ isOpen: true, title: "Error", message: "No se pudo guardar la rutina." });
    }
  };

  // Versión Modificada
const handleUpdateSchedule = async () => {
    const cleanSchedule = cleanEventsForBackend(schedule);
    try {
        // Usamos 'currentScheduleName' del estado en lugar de buscar en 'savedSchedules'.
        await apiClient.put(`/schedules/${currentScheduleId}`, { name: currentScheduleName, events: cleanSchedule });
        setIsDirty(false);
        setActionModal({ isOpen: true, title: "Éxito", message: "Los cambios han sido guardados." });
        // La línea 'await fetchSavedSchedules();' se elimina.
    } catch (error) {
        console.error("Error al actualizar:", error);
    }
  };
  
  // Se ejecuta cuando el usuario guarda cambios en un evento desde el modal
  const handleUpdateEvent = (eventId, updatedData) => {
    const updatedSchedule = schedule.map(event => {
      if (event.id === eventId) {
        return { ...event, ...updatedData };
      }
      return event;
    });
    setSchedule(updatedSchedule);
    setIsDirty(true);
  };

  // Se ejecuta cuando el usuario elimina un evento desde el modal
  const handleDeleteEvent = (eventId) => {
    setActionModal({
      isOpen: true,
      title: "Confirmar Eliminación",
      message: `¿Estás seguro de que quieres eliminar este evento?`,
      onConfirm: () => confirmEventDeletion(eventId)
    });
  };

  const confirmEventDeletion = (eventId) => {
    const updatedSchedule = schedule.filter(event => event.id !== eventId);
    setSchedule(updatedSchedule);
    setIsDirty(true);
  };

  // --- FUNCIÓN DE CLIC MODIFICADA ---
  const handleEventClick = (clickInfo) => {
    setSelectedEvent({
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr,
    });
    setEventModalIsOpen(true);
  };

  const handlePreferencesChange = (e) => {
  // 1. Extraemos TODAS las propiedades que podríamos necesitar del evento
  const { name, value, type, checked } = e.target;

  // 2. Comprobamos el tipo de campo para decidir cómo actualizar el estado
  if (name === 'peakHours' || name === 'daysNoMeetings') {
    // Si el campo es uno de nuestros arrays, usamos su valor directamente
    setPreferences(prev => ({ ...prev, [name]: value }));
  } else if (type === 'checkbox') {
    // Si es un checkbox, el valor que nos importa es 'checked' (true/false)
    setPreferences(prev => ({ ...prev, [name]: checked }));
  } else if (name === 'focusBlockDuration' || name === 'startHour' || name === 'endHour') {
    // Si es una de las duraciones o las horas, lo convertimos a número
    setPreferences(prev => ({ ...prev, [name]: parseInt(value, 10) }));
  } else {
    // Para todos los demás casos (como los selects con texto), usamos el 'value' tal cual
    setPreferences(prev => ({ ...prev, [name]: value }));
  }
};
  const handleEventReceive = (info) => {
    const eventExists = schedule.some(event => event.id === info.event.id);
    if (eventExists) {
        return;
    }

    const newEvent = {
      id: `${Date.now()}-${info.event.title}`,
      title: info.event.title,
      start: info.event.startStr,
      end: info.event.endStr,
      allDay: info.event.allDay,
      backgroundColor: info.event.backgroundColor,
      borderColor: info.event.borderColor,
    };

    setSchedule(currentSchedule => [...currentSchedule, newEvent]);
    setIsDirty(true);
  };

  const handleRequestAnalysis = async () => {
    if (schedule.length === 0) return;

    setIsAnalyzing(true);
    try {
        // Usamos cleanEventsForBackend para no enviar el 'id' temporal a la IA
        const cleanSchedule = cleanEventsForBackend(schedule);
        const response = await apiClient.post('/analyze-schedule', { events: cleanSchedule });
        
        // Formateamos las sugerencias como una lista HTML para el modal
        const suggestionsList = response.data.map(s => `<li>${s}</li>`).join('');
        const message = `<ul class="list-disc list-inside text-left">${suggestionsList}</ul>`;

        setActionModal({
            isOpen: true,
            title: "💡 Sugerencias de ScheduleAI",
            message: message,
            onConfirm: null // Es solo informativo, sin botón de confirmación
        });

    } catch (error) {
        console.error("Error al analizar el horario:", error);
        setActionModal({ 
            isOpen: true, 
            title: "Error", 
            message: "No se pudieron obtener las sugerencias en este momento." 
        });
    } finally {
        setIsAnalyzing(false);
    }
  };


  return (
  <div className="text-white grid grid-cols-1 lg:grid-cols-12 gap-10 p-4 md:p-10">
    
    {/* --- COLUMNA IZQUIERDA: "MIS ACTIVIDADES" --- */}
    <div className="lg:col-span-3">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl h-full flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Mis Actividades
          </h2>
        </div>
        <p className="text-sm text-slate-400 mb-4">Arrastra una actividad al calendario para añadirla.</p>
        <div ref={externalEventsRef} id="external-events" className="flex-grow space-y-3 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
          {activities.length > 0 ? (
            activities.map(act => (
              <DraggableActivity 
                key={act.id} 
                activity={act} 
                getColor={getColorForCategory}
              />
            ))
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-slate-700 rounded-lg bg-slate-800/30">
              <svg className="w-12 h-12 mx-auto mb-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-slate-400 text-base font-medium">No hay actividades.</p>
              <p className="text-slate-500 mt-1 text-sm">Ve a "Actividades" para crear algunas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    
    {/* --- CONTENIDO PRINCIPAL: CALENDARIO Y ACCIONES --- */}
    <div className="lg:col-span-9 flex flex-col gap-8">
      
      {/* Panel de Control */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-5 gap-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Generador de Rutina Semanal
          </h2>
          <button
            onClick={() => setPreferencesModalIsOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800 border border-slate-700 shadow transition-all
                       hover:bg-purple-700/40 hover:border-purple-400 hover:scale-105 group focus:outline-none focus:ring-2 focus:ring-purple-500"
            title="Abrir Preferencias"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-5 w-5 text-purple-300 group-hover:text-white transition-all group-hover:rotate-180 duration-500"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="text-purple-300 font-semibold text-base group-hover:text-white transition-colors">
              Preferencias
            </span>
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={handleGenerateSchedule} 
            disabled={isLoading || activities.length === 0} 
            className="w-full flex items-center justify-center gap-2 text-white bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 font-bold rounded-lg px-5 py-3 shadow-lg hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {isLoading ? 'Creando...' : 'Crear Nueva Rutina'}
          </button>
          {schedule.length > 0 && (
            <button
              onClick={handleRequestAnalysis}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-2 text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-600 font-bold rounded-lg px-5 py-3 shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              {isAnalyzing ? 'Analizando...' : 'Analizar con IA'}
            </button>
          )}
        </div>
      </div>

      {/* Botón de Guardar Condicional */}
      {isDirty && schedule.length > 0 && !isLoading && (
        <div className="text-center -my-2">
          <button 
            onClick={handleSaveOrUpdate} 
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 active:scale-95 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-green-500/50 transition-all mx-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            {currentScheduleId ? `Guardar Cambios en "${currentScheduleName}"` : 'Guardar Rutina Nueva'}
          </button>
        </div>
      )}

      {/* Contenedor del Calendario */}
      <div className={`bg-white text-gray-800 rounded-2xl border border-slate-200 shadow-2xl p-2 md:p-6 min-h-[70vh] ${schedule.length === 0 && 'flex items-center justify-center'}`}>
        {schedule.length > 0 ? (
          <FullCalendar
            key={calendarKey}
            plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
            editable={true}
            droppable={true}
            eventReceive={handleEventReceive}
            eventChange={handleEventChange}
            initialView="timeGrid"
            duration={{ weeks: 1 }}
            headerToolbar={false}
            initialDate='2024-01-01'
            dayHeaderFormat={{ weekday: 'long' }}
            allDaySlot={false}
            firstDay={1}
            events={schedule}
            locale='es'
            slotMinTime="05:00:00"
            slotMaxTime="23:00:00"
            height="auto"
            eventClick={handleEventClick}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-slate-400 py-20">
            <svg className="h-20 w-20 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xl font-bold text-slate-500 mb-1">Genera una rutina para empezar</p>
            <p className="text-slate-400">Usa el botón "Crear Nueva Rutina" para que tu horario aparezca aquí.</p>
          </div>
        )}
      </div>
    </div>

    {/* --- MODALES --- */}
    <PreferencesModal
      isOpen={preferencesModalIsOpen}
      onRequestClose={() => setPreferencesModalIsOpen(false)}
      preferences={preferences}
      onPreferencesChange={handlePreferencesChange}
      onSave={() => setPreferencesModalIsOpen(false)}
    />
    <EventModal 
      isOpen={eventModalIsOpen}
      onRequestClose={() => setEventModalIsOpen(false)}
      event={selectedEvent}
      onUpdate={handleUpdateEvent}
      onDelete={handleDeleteEvent}
    />
    <SaveScheduleModal
      isOpen={saveModalIsOpen}
      onRequestClose={() => setSaveModalIsOpen(false)}
      onSave={handleConfirmSaveNew}
    />
    <ActionModal
      isOpen={actionModal.isOpen}
      onRequestClose={() => setActionModal({ ...actionModal, isOpen: false })}
      title={actionModal.title}
      message={actionModal.message}
      onConfirm={actionModal.onConfirm}
      showConfirmButton={!!actionModal.onConfirm}
    />
  </div>
);


};

export default CalendarPage;