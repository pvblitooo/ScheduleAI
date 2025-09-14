import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import apiClient from '../api/axiosConfig';
import useLocalStorage from '../hooks/useLocalStorage';

// ¡IMPORTANTE! Añadimos la importación del ActionModal
import ActionModal from '../components/ActionModal';

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
      setSavedSchedules(response.data);
    } catch (error) {
      console.error('Error al cargar las rutinas:', error);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // --- ¡FUNCIÓN MODIFICADA! ---
  // Ahora usa el ActionModal en lugar de window.confirm
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

  return (
    // Usamos un fragmento para poder tener el div principal y el modal al mismo nivel
    <>
      <div className="flex gap-8 p-8 text-white" style={{ height: 'calc(100vh - 4rem)' }}>
        
        {/* --- Panel Izquierdo --- */}
        <div className="w-1/4 bg-gray-800 p-6 rounded-lg flex flex-col">
          <h2 className="text-2xl font-bold mb-6 flex-shrink-0">Mis Rutinas</h2>
          <ul className="flex-grow overflow-y-auto space-y-3 -mr-2 pr-2">
            {savedSchedules.length > 0 ? (
              savedSchedules.map((schedule) => (
                <li 
                  key={schedule.id}
                  className={`group p-3 rounded-lg flex justify-between items-center transition-all duration-200 ${
                    selectedSchedule?.id === schedule.id 
                    ? 'bg-purple-600 ring-2 ring-purple-400' 
                    : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <p 
                    className="font-semibold text-lg truncate cursor-pointer flex-grow"
                    onClick={() => handleScheduleSelect(schedule)}
                  >
                    {schedule.name}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Pasamos también el nombre para mostrarlo en el modal
                      handleDeleteSchedule(schedule.id, schedule.name);
                    }}
                    className="ml-4 bg-gray-600 hover:bg-red-500 text-white font-bold w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 transform hover:scale-110"
                    title="Eliminar rutina"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </li>
              ))
            ) : (
              <p className="text-gray-400">No tienes rutinas guardadas.</p>
            )}
          </ul>
        </div>

        {/* --- Panel Derecho --- */}
        <div className="w-3/4 bg-white text-gray-800 rounded-lg p-4">
          {selectedSchedule ? (
            <FullCalendar
              plugins={[timeGridPlugin]}
              initialView="timeGridWeek"
              headerToolbar={false}
              dayHeaderFormat={{ weekday: 'long' }}
              allDaySlot={false}
              firstDay={1}
              locale="es"
              height="100%"
              events={calendarEvents}
              initialDate='2024-01-01'
              slotMinTime="05:00:00"
              slotMaxTime="23:00:00"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p className="text-xl font-medium">Selecciona una rutina de la lista para previsualizarla aquí.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- ¡AÑADIMOS EL MODAL AQUÍ! --- */}
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