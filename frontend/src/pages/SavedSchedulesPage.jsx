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
    className={`w-6 h-6 transition-colors duration-200 ${isActive ? 'text-yellow-400' : 'text-gray-500 hover:text-gray-300'}`} 
    fill="currentColor" 
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.366 2.446a1 1 0 00-.364 1.118l1.287 3.96c.3.921-.755 1.688-1.54 1.118l-3.366-2.446a1 1 0 00-1.175 0l-3.366 2.446c-.784.57-1.838-.197-1.539-1.118l1.287-3.96a1 1 0 00-.364-1.118L2.07 9.387c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.96z" />
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
      <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-8 text-white h-[calc(100vh-6rem)]">
        
        {/* --- Panel Izquierdo (Lista de Rutinas) --- */}
        <div className="lg:w-1/3 xl:w-1/4 flex flex-col bg-gray-800 p-6 rounded-xl shadow-lg h-1/3 lg:h-full">
          <h2 className="text-2xl font-bold mb-6 flex-shrink-0">Mis Rutinas</h2>
          <ul className="flex-grow overflow-y-auto space-y-3 -mr-2 pr-2 simple-scrollbar">
            {savedSchedules.map((schedule) => (
              <li 
                key={schedule.id}
                onClick={() => handleScheduleSelect(schedule)}
                className={`group p-4 rounded-lg flex justify-between items-center cursor-pointer transition-all duration-200 ${
                  selectedSchedule?.id === schedule.id 
                  ? 'bg-purple-600 ring-2 ring-purple-400' 
                  : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {/* --- NUEVO: Contenedor para estrella y nombre --- */}
                <div className="flex items-center gap-3 flex-grow min-w-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetActive(schedule.id);
                    }}
                    title={schedule.is_active ? "Esta es tu rutina activa" : "Marcar como activa"}
                    className="flex-shrink-0 focus:outline-none"
                  >
                    <StarIcon isActive={schedule.is_active} />
                  </button>
                  <p className="font-semibold text-lg truncate" title={schedule.name}>
                    {schedule.name}
                  </p>
                </div>

                {/* Botón de eliminar (tu código original, sin cambios) */}
                <div className="flex-shrink-0 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSchedule(schedule.id, schedule.name);
                    }}
                    className="ml-4 bg-gray-600/50 hover:bg-red-500 text-white w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                    title="Eliminar rutina"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>


        {/* --- Panel Derecho (Calendario y Acciones) --- (Sin cambios) */}
        <div className="flex-grow flex flex-col gap-6 min-h-0">
          
          {/* Panel de Control */}
          {selectedSchedule && (
            <div className="bg-gray-800 p-4 rounded-xl shadow-lg flex flex-col sm:flex-row justify-between items-center gap-2 flex-shrink-0">
                <h3 className="text-lg sm:text-xl font-bold text-white text-center sm:text-left">
                    Editando: <span className="text-purple-400">{selectedSchedule.name}</span>
                </h3>
                {isDirty && (
                    <button 
                        onClick={handleUpdateSchedule} 
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
                    >
                        Guardar Cambios
                    </button>
                )}
            </div>
          )}


          {/* Calendario */}
          <div className={`flex-grow bg-white text-gray-800 rounded-xl shadow-2xl p-1 sm:p-2 md:p-4 min-h-0 ${!selectedSchedule && 'flex items-center justify-center'}`}>
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
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p className="text-xl font-medium text-gray-500">Selecciona una rutina</p>
                <p className="text-gray-400 mt-1">Elige una de tus rutinas para editarla aquí.</p>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* --- MODALES --- (Sin cambios) */}
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