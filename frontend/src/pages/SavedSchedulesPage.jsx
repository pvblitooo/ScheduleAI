import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import apiClient from '../api/axiosConfig';
import useLocalStorage from '../hooks/useLocalStorage';

// ¡IMPORTANTE! Añadimos la importación del ActionModal
import ActionModal from '../components/ActionModal';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from '../components/EventModal';

import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'; // Para la estrella activa
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline'; // Para la estrella inactiva


const StarIcon = ({ isActive }) => {
  return (
    <button
      className="flex-shrink-0 focus:outline-none hover:scale-110 active:scale-95 transition-transform duration-200"
      title={isActive ? "Esta es tu rutina activa" : "Marcar como activa"}
    >
      {isActive ? (
        // Estrella activa (sólida)
        <StarIconSolid className="h-6 w-6 text-yellow-400 drop-shadow-md animate-bounce" />
      ) : (
        // Estrella inactiva (contorno)
        // Se ve mejor con un color más oscuro en modo claro y más claro en modo oscuro
        <StarIconOutline className="h-6 w-6 text-slate-500 dark:text-slate-400 group-hover:text-yellow-500 dark:group-hover:text-yellow-400" />
      )}
    </button>
  );
};

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
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

const handleRequestAnalysis = async () => {
    if (!selectedSchedule) return;
    
    setIsAnalyzing(true);
    
    try {
      // Usamos los 'calendarEvents' actuales (que pueden tener cambios sin guardar)
      const cleanEvents = calendarEvents.map(({ id, backgroundColor, borderColor, ...rest }) => rest);
      
      const response = await apiClient.post('/analyze-schedule', {
        events: cleanEvents
      });
      
      const suggestions = response.data;
      
      // Formateamos las sugerencias como una lista HTML
      const suggestionsHtml = suggestions.length > 0
        ? `<ul class="list-disc list-inside text-left space-y-2">${suggestions.map(s => `<li>${s}</li>`).join('')}</ul>`
        : '¡Tu horario se ve genial! No tengo sugerencias por ahora.';
      
      setActionModal({
        isOpen: true,
        title: '🤖 Análisis de IA',
        message: suggestionsHtml,
        onConfirm: null // Lo convertimos en un modal de "solo información"
      });
      
    } catch (error) {
      console.error("Error al analizar la rutina:", error);
      setActionModal({ isOpen: true, title: "Error", message: "No se pudo analizar la rutina." });
    } finally {
      setIsAnalyzing(false);
    }
  };

return (
    <>
      {/* Estilos para FullCalendar (igual que antes) */}
      <style>{`
        .dark .fc { --fc-border-color: #334155; }
        .dark .fc-col-header-cell-cushion, .dark .fc-daygrid-day-number { color: #cbd5e1; }
        .dark .fc-timegrid-slot-label-cushion { color: #94a3b8; }
        .dark .fc-timegrid-slot-lane { background: #0f172a; }
        .dark .fc-day-today { background: #1e293b !important; }
      `}</style>
      
      {/* Contenedor Principal (MODIFICADO para tema) */}
      <div className="flex flex-col lg:flex-row gap-8 p-4 md:p-10 text-slate-900 dark:text-white h-[calc(100vh-6rem)]">

        {/* Panel Izquierdo (MODIFICADO para tema) */}
        <div className="lg:w-1/3 xl:w-1/4 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl h-1/3 lg:h-full">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
            Mis Rutinas
          </h2>
          <ul className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {savedSchedules.map((schedule) => (
              <li
                key={schedule.id}
                onClick={() => handleScheduleSelect(schedule)}
                // Estilos de la lista (MODIFICADO para tema)
                className={`group p-3 rounded-xl flex justify-between items-center cursor-pointer transition-all duration-200 
                  ${selectedSchedule?.id === schedule.id
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 shadow-xl shadow-purple-500/30 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center gap-3 flex-grow min-w-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSetActive(schedule.id); }}
                    title={schedule.is_active ? "Esta es tu rutina activa" : "Marcar como activa"}
                    className="flex-shrink-0 focus:outline-none hover:scale-110 active:scale-95 transition-transform duration-200"
                  >
                    {/* El componente StarIcon ya fue modificado arriba */}
                    <StarIcon isActive={schedule.is_active} />
                  </button>
                  <p className="font-semibold text-base truncate" title={schedule.name}>
                    {schedule.name}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteSchedule(schedule.id, schedule.name); }}
                  // Botón de eliminar (MODIFICADO para tema)
                  className="ml-3 bg-slate-200 dark:bg-slate-700/50 hover:bg-red-500 text-slate-500 dark:text-slate-300 hover:text-white active:scale-90 transition-all duration-200 w-8 h-8 flex items-center justify-center rounded-lg shadow opacity-0 group-hover:opacity-100"
                  title="Eliminar rutina"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Panel Derecho (MODIFICADO para tema) */}
        <div className="flex-grow flex flex-col gap-6 min-h-0">

          {/* Panel de Control (MODIFICADO para tema) */}
          {selectedSchedule && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4 flex-shrink-0">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white text-center sm:text-left truncate">
                Editando: <span className="bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">{selectedSchedule.name}</span>
              </h3>
              
              {/* --- ¡NUEVO GRUPO DE BOTONES! --- */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Botón Analizar IA */}
                <button
                  onClick={handleRequestAnalysis}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-600 font-semibold rounded-lg px-4 py-2.5 shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  <svg className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isAnalyzing 
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    }
                  </svg>
                  {isAnalyzing ? 'Analizando...' : 'Analizar'}
                </button>
                
                {/* Botón Guardar Cambios (ahora solo se muestra si hay cambios) */}
                {isDirty && (
                  <button
                    onClick={handleUpdateSchedule}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 active:scale-95 text-white font-bold py-2.5 px-4 rounded-lg shadow-lg hover:shadow-green-500/50 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Guardar
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Calendario (MODIFICADO para tema) */}
          <div className={`flex-grow bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2 md:p-6 min-h-0 ${!selectedSchedule && 'flex items-center justify-center'}`}>
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
              // Estado vacío (MODIFICADO para tema)
              <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 text-center p-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-4 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <p className="text-xl font-bold text-slate-600 dark:text-slate-500 mb-1">Selecciona una rutina</p>
                <p className="text-slate-500 dark:text-slate-400">Elige una de tus rutinas para editarla aquí.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modales (aún necesitan ser actualizados) */}
      <EventModal
        isOpen={eventModalIsOpen}
        onRequestClose={() => setEventModalIsOpen(false)}
        event={selectedEvent}
        onUpdate={handleUpdateEvent}
        onDelete={() => {}} // Deberías implementar esto
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