import { useState, useEffect, useRef } from 'react';
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

const CalendarPage = () => {
  // Estados para datos y UI
  const [schedule, setSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useLocalStorage('userPreferences', { startHour: 8, endHour: 22 });
  const [activities, setActivities] = useState([]);
  const [savedSchedules, setSavedSchedules] = useState([]);
  const [calendarKey, setCalendarKey] = useState(0);

  // Estados para el control de los modales
  const [eventModalIsOpen, setEventModalIsOpen] = useState(false);
  const [saveModalIsOpen, setSaveModalIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [actionModal, setActionModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  // Estados para la gestión de la rutina actual
  const [currentScheduleId, setCurrentScheduleId] = useState(null);
  const [isDirty, setIsDirty] = useState(false); // ¿Hay cambios sin guardar?

  const externalEventsRef = useRef(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Carga inicial de datos
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const activitiesResponse = await apiClient.get('/activities/');
        setActivities(activitiesResponse.data);
        await fetchSavedSchedules();
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
      }
    };
    fetchInitialData();
  }, []);

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

    // --- ¡LA CLAVE ESTÁ AQUÍ! ---
    // Esta función se ejecuta antes de que el efecto se vuelva a ejecutar,
    // o cuando el componente se desmonta.
    return () => {
      if (draggable) {
        draggable.destroy(); // Destruimos la instancia anterior
      }
    };
  }, [activities]); // La dependencia sigue siendo la misma

  const fetchSavedSchedules = async () => {
    try {
        const response = await apiClient.get('/schedules/');
        setSavedSchedules(response.data);
    } catch (error) {
        console.error("Error al cargar las rutinas guardadas:", error);
    }
  };

  // Genera un nuevo horario
  const handleGenerateSchedule = async () => {
    setIsLoading(true);
    setSchedule([]);
    try {
      const response = await apiClient.post('/generate-schedule', preferences);
      const finalEvents = response.data.map((event, index) => {
        let backgroundColor = '#3b82f6';
        const title = event.title.toLowerCase();
        if (title.includes('descanso') || title.includes('ocio')) backgroundColor = '#22c55e';
        else if (title.includes('comida') || title.includes('almuerzo')) backgroundColor = '#f97316';
        else if (title.includes('ejercicio')) backgroundColor = '#ef4444';
        return { ...event, id: `${Date.now()}-${index}`, allDay: false, backgroundColor, borderColor: backgroundColor };
      });
      setSchedule(finalEvents);
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
    let events = typeof scheduleToLoad.events === 'string' ? JSON.parse(scheduleToLoad.events) : scheduleToLoad.events;
    
    const eventsWithIds = events.map((event, index) => ({
      ...event,
      id: event.id || `${Date.now()}-${index}`
    }));
    
    setSchedule(eventsWithIds);
    setCurrentScheduleId(scheduleToLoad.id);
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
      setIsDirty(false);
      setActionModal({ isOpen: true, title: "Éxito", message: `Rutina "${scheduleName}" guardada.` });
      await fetchSavedSchedules();
    } catch (error) {
      console.error("Error al guardar:", error);
      setActionModal({ isOpen: true, title: "Error", message: "No se pudo guardar la rutina." });
    }
  };

  // 6. ACTUALIZA una rutina existente (usando los eventos limpios)
  const handleUpdateSchedule = async () => {
    const currentName = savedSchedules.find(s => s.id === currentScheduleId)?.name || 'Rutina Actualizada';
    const cleanSchedule = cleanEventsForBackend(schedule);
    try {
      await apiClient.put(`/schedules/${currentScheduleId}`, { name: currentName, events: cleanSchedule });
      setIsDirty(false);
      setActionModal({ isOpen: true, title: "Éxito", message: "Los cambios han sido guardados." });

      // =================================================================
      // ¡LA LÍNEA QUE FALTABA!
      // Refrescamos la lista local de rutinas guardadas con los nuevos
      // datos que acabamos de guardar en el backend.
      await fetchSavedSchedules();
      // =================================================================

    } catch (error) {
      console.error("Error al actualizar:", error);
      setActionModal({ isOpen: true, title: "Error", message: "No se pudieron guardar los cambios." });
    }
  };
  
  // (Resto de funciones auxiliares sin cambios)
  const handleDeleteSchedule = (scheduleId) => {
    setActionModal({
      isOpen: true,
      title: "Confirmar Eliminación",
      message: "¿Estás seguro de que quieres eliminar esta rutina?",
      onConfirm: () => confirmDelete(scheduleId)
    });
  };
  const confirmDelete = async (scheduleId) => {
    try {
      await apiClient.delete(`/schedules/${scheduleId}`);
      setActionModal({ isOpen: true, title: "Éxito", message: "La rutina ha sido eliminada." });
      await fetchSavedSchedules();
      if (currentScheduleId === scheduleId) {
          setSchedule([]);
          setCurrentScheduleId(null);
          setIsDirty(false);
      }
    } catch (error) { /* ... */ }
  };

  // --- ¡NUEVAS FUNCIONES PARA EL MODAL EDITABLE! ---

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
    const { name, value } = e.target;
    setPreferences(prev => ({ ...prev, [name]: parseInt(value) }));
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
    <div className="text-white grid grid-cols-1 lg:grid-cols-4 gap-8 p-4 md:p-8">
      <div className="lg:col-span-3">
        <div className="bg-gray-800 p-6 rounded-lg mb-4">
          <h2 className="text-2xl font-bold mb-4">Generador de Rutina Semanal</h2>
          {/* --- ¡NUEVO DISEÑO DE BOTONES! --- */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            {/* Botón para Crear Rutina con degradado púrpura */}
            <button 
              onClick={handleGenerateSchedule} 
              disabled={isLoading || activities.length === 0} 
              className="w-full text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-bold rounded-lg text-sm px-5 py-3 text-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creando...' : 'Crear Nueva Rutina'}
            </button>
    
            {/* Botón para Analizar con IA con degradado cian */}
            {schedule.length > 0 && (
              <button
                onClick={handleRequestAnalysis}
                disabled={isAnalyzing}
                className="w-full text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 shadow-lg shadow-cyan-500/50 dark:shadow-lg dark:shadow-cyan-800/80 font-bold rounded-lg text-sm px-5 py-3 text-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? 'Analizando...' : 'Analizar con IA'}
              </button>
            )}
        </div>
      </div>
        {isDirty && schedule.length > 0 && !isLoading && (
          <div className="text-center my-4">
            <button 
              onClick={handleSaveOrUpdate} 
              className="bg-green-600 hover:bg-green-700 font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105"
            >
              {currentScheduleId ? 'Guardar Cambios' : 'Guardar Rutina Nueva'}
            </button>
          </div>
        )}

        <div className="mt-4 bg-white text-gray-800 rounded-lg p-4">
          <FullCalendar
            key={calendarKey}
            plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
            editable={true}
            droppable={true} // <-- Permite que se suelten elementos
            eventReceive={handleEventReceive} // <-- "Escucha" los elementos soltados
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
            slotMinTime={`${String(preferences.startHour).padStart(2, '0')}:00:00`}
            slotMaxTime={`${String(preferences.endHour).padStart(2, '0')}:00:00`}
            height="auto"
            eventClick={handleEventClick}
          />
        </div>
      </div>

      <div className="lg:col-span-1 space-y-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Preferencias</h2>
          <div className="flex flex-col gap-4">
            <label className="font-semibold">Empezar día:
              <input type="number" name="startHour" value={preferences.startHour} onChange={handlePreferencesChange} className="w-full bg-gray-700 rounded p-2 mt-1 font-normal" />
            </label>
            <label className="font-semibold">Terminar día:
              <input type="number" name="endHour" value={preferences.endHour} onChange={handlePreferencesChange} className="w-full bg-gray-700 rounded p-2 mt-1 font-normal" />
            </label>
          </div>
        </div>

        {/* --- ¡NUEVA SECCIÓN DE ACTIVIDADES! --- */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Mis Actividades</h2>
          <p className="text-sm text-gray-400 mb-4">Arrastra una actividad al calendario para añadirla.</p>
          <div ref={externalEventsRef} id="external-events" className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {activities.length > 0 ? (
              activities.map(act => (
                <DraggableActivity key={act.id} activity={act} />
              ))
            ) : (
              <p className="text-gray-400 text-sm">Aún no tienes actividades creadas.</p>
            )}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Mis Rutinas Guardadas</h2>
          {savedSchedules.length > 0 ? (
            <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {savedSchedules.map(s => (
                <li key={s.id} className={`bg-gray-700 p-3 rounded-lg flex justify-between items-center transition-all ${currentScheduleId === s.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-600'}`}>
                  <span className="font-semibold flex-1 truncate pr-2">{s.name}</span>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleLoadSchedule(s)} className="text-xs bg-blue-600 hover:bg-blue-700 py-1 px-2 rounded">Cargar</button>
                    <button onClick={() => handleDeleteSchedule(s.id)} className="text-xs bg-red-600 hover:bg-red-700 py-1 px-2 rounded">X</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">Aún no tienes rutinas guardadas.</p>
          )}
        </div>
      </div>
      
      <EventModal 
        isOpen={eventModalIsOpen}
        onRequestClose={() => setEventModalIsOpen(false)}
        event={selectedEvent}
        onUpdate={handleUpdateEvent} // <-- Le pasamos la función de actualizar
        onDelete={handleDeleteEvent} // <-- Le pasamos la función de eliminar
      />
      <SaveScheduleModal
        isOpen={saveModalIsOpen}
        onRequestClose={() => setSaveModalIsOpen(false)}
        onSave={handleConfirmSaveNew}
      />
      <ActionModal
        isOpen={actionModal.isOpen}
        onRequestClose={() => setActionModal({ isOpen: false, title: '', message: '', onConfirm: null })}
        title={actionModal.title}
        message={actionModal.message}
        onConfirm={actionModal.onConfirm}
        showConfirmButton={!!actionModal.onConfirm}
      />
    </div>
  );
};

export default CalendarPage;