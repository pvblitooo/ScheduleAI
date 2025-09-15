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
  <>
    {/* Contenedor principal que se apila en móvil y se divide en escritorio */}
    <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-8 text-white lg:h-[calc(100vh-6rem)]">
      
      {/* --- Panel Izquierdo (Lista de Rutinas) --- */}
      {/* En móvil ocupa todo el ancho; en escritorio, 1/3 o 1/4 del espacio */}
      <div className="lg:w-1/3 xl:w-1/4 bg-gray-800 p-6 rounded-xl flex flex-col shadow-lg">
        <h2 className="text-2xl font-bold mb-6 flex-shrink-0">Mis Rutinas</h2>
        <ul className="flex-grow overflow-y-auto space-y-3 -mr-2 pr-2 simple-scrollbar">
          {savedSchedules.length > 0 ? (
            savedSchedules.map((schedule) => (
              <li 
                key={schedule.id}
                onClick={() => handleScheduleSelect(schedule)}
                className={`group p-4 rounded-lg flex justify-between items-center cursor-pointer transition-all duration-200 ${
                  selectedSchedule?.id === schedule.id 
                  ? 'bg-purple-600 ring-2 ring-purple-400' 
                  : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <p className="font-semibold text-lg truncate flex-grow">
                  {schedule.name}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Evita que se seleccione la rutina al borrar
                    handleDeleteSchedule(schedule.id, schedule.name);
                  }}
                  className="ml-4 bg-gray-600/50 hover:bg-red-500 text-white w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-300 lg:opacity-0 lg:group-hover:opacity-100 transform lg:hover:scale-110"
                  title="Eliminar rutina"
                >
                  {/* Icono de Papelera */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </li>
            ))
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-gray-700 rounded-lg h-full flex flex-col justify-center">
              <p className="text-gray-400 text-lg">Sin Rutinas</p>
              <p className="text-gray-500 mt-1 text-sm">Ve a "Calendario" para crear y guardar tu primera rutina.</p>
            </div>
          )}
        </ul>
      </div>

      {/* --- Panel Derecho (Calendario o Mensaje de Bienvenida) --- */}
      <div className="flex-grow bg-white text-gray-800 rounded-xl shadow-2xl p-1 sm:p-2 md:p-4">
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
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <p className="text-xl font-medium text-gray-500">Selecciona una rutina</p>
            <p className="text-gray-400 mt-1">Elige una de tus rutinas guardadas en la lista para previsualizarla aquí.</p>
          </div>
        )}
      </div>
    </div>

    {/* --- Modal de Acción --- */}
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