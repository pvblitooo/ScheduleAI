import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import apiClient from '../api/axiosConfig';
import useLocalStorage from '../hooks/useLocalStorage';

// ¡IMPORTANTE! Añadimos la importación del ActionModal
import ActionModal from '../components/ActionModal';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from '../components/EventModal';

const StarIcon = ({ isActive }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill={isActive ? "currentColor" : "none"}
    stroke={isActive ? "currentColor" : "#d1d5db"}
    className={`h-6 w-6 transition-all 
      ${isActive
        ? 'text-yellow-400 drop-shadow-md animate-bounce'
        : 'text-slate-400 group-hover:text-yellow-300'}`}
    strokeWidth={isActive ? 0 : 2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10 15.27l5.18 3.04-1.64-7.03L18 7.24l-7.19-.62L10 2 9.19 6.62 2 7.24l5.46 4.04-1.64 7.03z"
    />
  </svg>
);

// Reutilizamos la función de colores que ya tenemos
const getColorForCategory = (category) => {
  switch (category) {
    case 'estudio': return '#3b82f6';
    case 'trabajo': return '#8b5cf6';
    case 'ejercicio': return '#ef4444';
    case 'ocio': return '#22c55e';
    case 'personal': return '#f97316';
    case 'familia': return '#ec4899';
    default: return '#6b7280';
  }
};

const SavedSchedulesPage = () => {
  const [savedSchedules, setSavedSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [preferences] = useLocalStorage('userPreferences', { startHour: 8, endHour: 22 });
  const [isDirty, setIsDirty] = useState(false);
  const [eventModalIsOpen, setEventModalIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // --- ¡NUEVO ESTADO PARA EL MODAL! ---
  // Este estado controlará nuestro modal de confirmación y de error.
  const [actionModal, setActionModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '',
    onConfirm: null 
  });
  
  // Función para cargar las rutinas (para reutilizarla después de borrar)
  const fetchSchedules = async () => {
        try {
            const response = await apiClient.get('/schedules/');
            // Ordenamos: la rutina activa (is_active: true) va primero.
            const sortedSchedules = response.data.sort((a, b) => b.is_active - a.is_active);
            setSavedSchedules(sortedSchedules);
        } catch (error) {
            console.error('Error al cargar las rutinas:', error);
        }
    };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // --- NUEVO --- Función para manejar la activación de una rutina
    const handleSetActive = async (scheduleId) => {
        try {
            await apiClient.post(`/schedules/${scheduleId}/set-active`);
            // Vuelve a cargar las rutinas para reflejar el cambio (y el nuevo orden)
            fetchSchedules(); 
            setActionModal({ isOpen: true, title: "Éxito", message: "Rutina activada." });
        } catch (error) {
            console.error("Error al activar la rutina:", error);
            setActionModal({ isOpen: true, title: "Error", message: "No se pudo activar la rutina." });
        }
    };

  const handleDeleteSchedule = (scheduleId, scheduleName) => {
    setActionModal({
      isOpen: true,
      title: `Confirmar Eliminación`,
      message: `¿Estás seguro de que quieres eliminar la rutina "${scheduleName}"? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        try {
          await apiClient.delete(`/schedules/${scheduleId}`);
          
          // Cerramos el modal de confirmación
          setActionModal({ isOpen: false, title: '', message: '' });
          
          // Actualizamos la lista de rutinas
          fetchSchedules();

          // Si la rutina eliminada era la seleccionada, limpiamos la vista
          if (selectedSchedule?.id === scheduleId) {
            setSelectedSchedule(null);
            setCalendarEvents([]);
          }
        } catch (error) {
          console.error("Error al eliminar la rutina:", error);
          // Mostramos un modal de error
          setActionModal({ 
            isOpen: true,
            title: "Error",
            message: "No se pudo eliminar la rutina.",
            onConfirm: null // Sin acción de confirmación en un error
          });
        }
      }
    });
  };

  const handleScheduleSelect = (schedule) => {
    setSelectedSchedule(schedule);
    const events = typeof schedule.events === 'string' ? JSON.parse(schedule.events) : schedule.events;
    const processedEvents = events.map((event, index) => {
      const color = getColorForCategory(event.category || 'default');
      return {
        ...event,
        id: `${schedule.id}-${index}`,
        backgroundColor: color,
        borderColor: color,
      };
    });
    setCalendarEvents(processedEvents);
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent({
        id: clickInfo.event.id,
        title: clickInfo.event.title,
        start: clickInfo.event.startStr,
        end: clickInfo.event.endStr,
        category: clickInfo.event.extendedProps.category,
    });
    setEventModalIsOpen(true);
};

// 2. Se activa cuando mueves o redimensionas un bloque
const handleEventChange = (changeInfo) => {
    const updatedEvents = calendarEvents.map(evt => 
        evt.id === changeInfo.event.id 
        ? { ...evt, start: changeInfo.event.startStr, end: changeInfo.event.endStr } 
        : evt
    );
    setCalendarEvents(updatedEvents);
    setIsDirty(true); // Marca la rutina como "modificada"
};

// 3. Se llama desde el EventModal para guardar cambios en un evento
const handleUpdateEvent = (eventId, updatedData) => {
    const updatedEvents = calendarEvents.map(event =>
        event.id === eventId ? { ...event, ...updatedData } : event
    );
    setCalendarEvents(updatedEvents);
    setIsDirty(true);
    // Podríamos cerrar el modal aquí si quisiéramos
    // setEventModalIsOpen(false); 
};

// 4. Guarda TODA la rutina actualizada en el backend
const handleUpdateSchedule = async () => {
    if (!selectedSchedule || !isDirty) return;
    
    // 1. Limpiamos los eventos para el backend (esto ya lo tenías)
    const cleanEvents = calendarEvents.map(({ id, backgroundColor, borderColor, ...rest }) => rest);
    
    try {
        // 2. Enviamos la actualización a la API
        await apiClient.put(`/schedules/${selectedSchedule.id}`, { 
            name: selectedSchedule.name, 
            events: cleanEvents 
        });
        
        // --- ¡LA PARTE NUEVA Y CLAVE! ---
        // 3. Actualizamos la lista de rutinas en el estado LOCAL
        setSavedSchedules(prevSchedules => 
            prevSchedules.map(schedule => 
                schedule.id === selectedSchedule.id 
                ? { ...schedule, events: cleanEvents } // Reemplazamos los eventos de la rutina actualizada
                : schedule
            )
        );

        // 4. Reseteamos el estado 'dirty' y mostramos confirmación
        setIsDirty(false);
        setActionModal({ isOpen: true, title: "Éxito", message: "Rutina actualizada correctamente." });

    } catch (error) {
        console.error("Error al actualizar la rutina:", error);
        setActionModal({ isOpen: true, title: "Error", message: "No se pudo actualizar la rutina." });
    }
};

return (
  <>
    {/* --- CONTENEDOR PRINCIPAL RESPONSIVO --- */}
    <div className="flex flex-col lg:flex-row gap-8 p-4 md:p-10 text-white h-[calc(100vh-6rem)]">

      {/* --- Panel Izquierdo (Lista de Rutinas) --- */}
      <div className="lg:w-1/3 xl:w-1/4 flex flex-col bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl h-1/3 lg:h-full">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Mis Rutinas
        </h2>
        <ul className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {savedSchedules.map((schedule) => (
            <li
              key={schedule.id}
              onClick={() => handleScheduleSelect(schedule)}
              className={`group p-3 rounded-xl flex justify-between items-center cursor-pointer transition-all duration-200 
                ${selectedSchedule?.id === schedule.id
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 shadow-xl shadow-purple-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 hover:shadow-lg'
              }`}
            >
              <div className="flex items-center gap-3 flex-grow min-w-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetActive(schedule.id);
                  }}
                  title={schedule.is_active ? "Esta es tu rutina activa" : "Marcar como activa"}
                  className="flex-shrink-0 focus:outline-none hover:scale-110 active:scale-95 transition-transform duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={schedule.is_active ? "#fbbf24" : "none"}
                    stroke={schedule.is_active ? "none" : "#94a3b8"}
                    className={`h-7 w-7 transition-all duration-300
                      ${schedule.is_active 
                        ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-bounce' 
                        : 'group-hover:stroke-yellow-400'
                      }`}
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    />
                  </svg>
                </button>
                <p className="font-semibold text-base truncate" title={schedule.name}>
                  {schedule.name}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSchedule(schedule.id, schedule.name);
                }}
                className="ml-3 bg-slate-700/50 hover:bg-red-500 active:scale-90 transition-all duration-200 text-white w-8 h-8 flex items-center justify-center rounded-lg shadow opacity-0 group-hover:opacity-100"
                title="Eliminar rutina"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* --- Panel Derecho (Calendario y Acciones) --- */}
      <div className="flex-grow flex flex-col gap-6 min-h-0">

        {/* Panel de Control */}
        {selectedSchedule && (
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-center gap-3 flex-shrink-0">
            <h3 className="text-lg sm:text-xl font-bold text-white text-center sm:text-left">
              Editando: <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{selectedSchedule.name}</span>
            </h3>
            {isDirty && (
              <button
                onClick={handleUpdateSchedule}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 active:scale-95 text-white font-bold py-2.5 px-5 rounded-lg shadow-lg hover:shadow-green-500/50 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Guardar Cambios
              </button>
            )}
          </div>
        )}

        {/* Calendario */}
        <div className={`flex-grow bg-white text-gray-800 rounded-2xl border border-slate-200 shadow-2xl p-2 md:p-6 min-h-0 ${!selectedSchedule && 'flex items-center justify-center'}`}>
          {selectedSchedule ? (
            <FullCalendar
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={false}
              allDaySlot={false}
              locale="es"
              firstDay={1}
              height="100%"
              slotMinTime="05:00:00"
              slotMaxTime="23:00:00"
              initialDate='2024-01-01'
              events={calendarEvents}
              editable={true}
              eventClick={handleEventClick}
              eventChange={handleEventChange}
              dayHeaderFormat={{ weekday: 'long' }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center p-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <p className="text-xl font-bold text-slate-500 mb-1">Selecciona una rutina</p>
              <p className="text-slate-400">Elige una de tus rutinas para editarla aquí.</p>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* --- MODALES --- */}
    <EventModal
      isOpen={eventModalIsOpen}
      onRequestClose={() => setEventModalIsOpen(false)}
      event={selectedEvent}
      onUpdate={handleUpdateEvent}
      onDelete={() => {}}
    />
    <ActionModal
      isOpen={actionModal.isOpen}
      onRequestClose={() => setActionModal({ ...actionModal, isOpen: false })}
      title={actionModal.title}
      message={actionModal.message}
      onConfirm={actionModal.onConfirm}
      showConfirmButton={!!actionModal.onConfirm}
    />
  </>
);

};

export default SavedSchedulesPage;