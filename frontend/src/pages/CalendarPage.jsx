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
  // Contenedor principal con un grid responsivo y espaciado consistente.
  <div className="text-white grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 md:p-6">
    
    {/* --- COLUMNA IZQUIERDA: "MIS ACTIVIDADES" --- */}
    <div className="lg:col-span-3">
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg h-full flex flex-col">
        <h2 className="text-xl font-bold mb-2">Mis Actividades</h2>
        <p className="text-sm text-gray-400 mb-4">Arrastra una actividad al calendario para añadirla.</p>
        <div ref={externalEventsRef} id="external-events" className="flex-grow space-y-3 overflow-y-auto pr-2 -mr-2 simple-scrollbar">
          {activities.length > 0 ? (
            activities.map(act => (
              <DraggableActivity 
                key={act.id} 
                activity={act} 
                getColor={getColorForCategory}
              />
            ))
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-gray-700 rounded-lg">
              <p className="text-gray-400">No hay actividades.</p>
              <p className="text-gray-500 mt-1 text-sm">Ve a "Actividades" para crear algunas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    
    {/* --- CONTENIDO PRINCIPAL: CALENDARIO Y ACCIONES --- */}
    <div className="lg:col-span-9">
      {/* Panel de Control */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <h2 className="text-2xl font-bold">Generador de Rutina Semanal</h2>
          <button 
            onClick={() => setPreferencesModalIsOpen(true)}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
            title="Abrir Preferencias"
          >
            {/* Icono de configuración */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <button 
            onClick={handleGenerateSchedule} 
            disabled={isLoading || activities.length === 0} 
            className="w-full text-white bg-gradient-to-r from-purple-500 to-purple-700 hover:bg-gradient-to-br font-bold rounded-lg px-5 py-3 text-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creando...' : 'Crear Nueva Rutina'}
          </button>
          
          {schedule.length > 0 && (
            <button
              onClick={handleRequestAnalysis}
              disabled={isAnalyzing}
              className="w-full text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl font-bold rounded-lg px-5 py-3 text-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? 'Analizando...' : 'Analizar con IA'}
            </button>
          )}
        </div>
      </div>

      {/* Botón de Guardar Condicional */}
      {isDirty && schedule.length > 0 && !isLoading && (
        <div className="text-center my-4">
          <button 
            onClick={handleSaveOrUpdate} 
            className="bg-green-600 hover:bg-green-700 font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105"
          >
            {currentScheduleId ? `Guardar Cambios en "${currentScheduleName}"` : 'Guardar Rutina Nueva'}
          </button>
        </div>
      )}

      {/* Contenedor del Calendario */}
      <div className="bg-white text-gray-800 rounded-xl shadow-2xl p-1 sm:p-2 md:p-4">
        <FullCalendar
          key={calendarKey}
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
          editable={true}
          droppable={true}
          eventReceive={handleEventReceive}
          eventChange={handleEventChange}
          initialView="timeGrid" // Usamos una vista de semana simple
          duration={{ weeks: 1 }}
          headerToolbar={false} // Quitamos la barra de herramientas por defecto
          initialDate='2024-01-01'
          dayHeaderFormat={{ weekday: 'long' }} // Muestra nombres completos de los días
          allDaySlot={false} // Oculta la fila de "todo el día"
          firstDay={1} // Lunes como primer día de la semana
          events={schedule}
          locale='es'
          slotMinTime="05:00:00"
          slotMaxTime="23:00:00"
          height="auto" // El calendario se adapta a la altura del contenido
          eventClick={handleEventClick}
        />
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