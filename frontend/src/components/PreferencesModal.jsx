import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

// Un componente pequeño y reutilizable para los títulos de las secciones.
const SectionTitle = ({ children }) => (
  <h3 className="text-xl font-bold text-purple-300 border-b border-gray-600 pb-2 mb-4">
    {children}
  </h3>
);

const PreferencesModal = ({ isOpen, onRequestClose, preferences, onPreferencesChange }) => {

  // ===== INICIO DE NUEVAS FUNCIONES =====

  // Actualiza un bloque de tiempo existente (inicio o fin)
  const handlePeakHourChange = (index, field, value) => {
    const newPeakHours = [...preferences.peakHours];
    newPeakHours[index] = { ...newPeakHours[index], [field]: value };
    onPreferencesChange({ target: { name: 'peakHours', value: newPeakHours } });
  };

  // Añade un nuevo bloque de tiempo vacío
  const addPeakHour = () => {
    // Asegúrate de que `preferences.peakHours` no sea null o undefined
    const currentPeakHours = preferences.peakHours || [];
    
    // Crea un array COMPLETAMENTE NUEVO
    const newPeakHours = [...currentPeakHours, { start: '12:00', end: '13:00' }];
    
    // Llama a la función del padre con el nuevo array
    onPreferencesChange({ target: { name: 'peakHours', value: newPeakHours } });
  };

  // Elimina un bloque de tiempo por su índice
  const removePeakHour = (index) => {
    const newPeakHours = preferences.peakHours.filter((_, i) => i !== index);
    onPreferencesChange({ target: { name: 'peakHours', value: newPeakHours } });
  };

  // ===== FIN DE NUEVAS FUNCIONES =====

  // Cierra el modal con la tecla 'Escape'
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onRequestClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onRequestClose]);

  const handleDaysNoMeetingsChange = (e) => {
    const { checked, value } = e.target;
    let currentDays = preferences.daysNoMeetings ? [...preferences.daysNoMeetings] : [];
    if (checked) {
      currentDays = [...currentDays, value];
    } else {
      currentDays = currentDays.filter(day => day !== value);
    }
    onPreferencesChange({ target: { name: 'daysNoMeetings', value: currentDays } });
  };

  if (!isOpen) {
    return null;
  }
  
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="relative w-full max-w-lg bg-gray-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Preferencias</h2>
          <button onClick={onRequestClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto">
          {/* --- SECCIÓN 1: DISPONIBILIDAD --- */}
          <section>
            <SectionTitle>Disponibilidad</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startHour" className="block text-gray-300 font-semibold mb-2">Inicio del día</label>
                <input id="startHour" type="number" name="startHour" value={preferences.startHour || ''} onChange={onPreferencesChange} className="w-full bg-gray-700 p-3 rounded-lg text-white" min="0" max="23" />
              </div>
              <div>
                <label htmlFor="endHour" className="block text-gray-300 font-semibold mb-2">Fin del día</label>
                <input id="endHour" type="number" name="endHour" value={preferences.endHour || ''} onChange={onPreferencesChange} className="w-full bg-gray-700 p-3 rounded-lg text-white" min="1" max="24" />
              </div>
            </div>
          </section>

          {/* --- SECCIÓN 2: ENERGÍA Y ENFOQUE --- */}
          <section>
            <SectionTitle>Energía y Enfoque</SectionTitle>
            <div>
              <label className="block text-gray-300 font-semibold mb-3">Horas de máxima productividad</label>
              <div className="space-y-3">
                {(preferences.peakHours || []).map((range, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input type="time" value={range.start} onChange={(e) => handlePeakHourChange(index, 'start', e.target.value)} className="flex-1 bg-gray-700 p-2 rounded-lg text-white" />
                    <span className="text-gray-400">-</span>
                    <input type="time" value={range.end} onChange={(e) => handlePeakHourChange(index, 'end', e.target.value)} className="flex-1 bg-gray-700 p-2 rounded-lg text-white" />
                    <button onClick={() => removePeakHour(index)} className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-bold">&times;</button>
                  </div>
                ))}
                <button onClick={addPeakHour} className="w-full mt-3 bg-green-600 hover:bg-green-700 font-bold py-2 px-4 rounded-lg">+ Añadir Bloque</button>
              </div>
            </div>
            <div className="mt-6">
              <label htmlFor="productivityArchetype" className="block text-gray-300 font-semibold mb-2">Arquetipo de productividad</label>
              <select name="productivityArchetype" id="productivityArchetype" value={preferences.productivityArchetype || 'Constante'} onChange={onPreferencesChange} className="w-full bg-gray-700 p-3 rounded-lg text-white">
                <option value="Madrugador">Madrugador (energía alta por la mañana)</option>
                <option value="Nocturno">Nocturno (energía alta por la tarde/noche)</option>
                <option value="Por Sprints">Por Sprints (energía en ráfagas cortas)</option>
                <option value="Constante">Constante (energía estable)</option>
              </select>
            </div>
            <div className="mt-6">
              <label htmlFor="focusBlockDuration" className="block text-gray-300 font-semibold mb-2">Duración de bloque de enfoque (min)</label>
              <select name="focusBlockDuration" id="focusBlockDuration" value={preferences.focusBlockDuration || 50} onChange={onPreferencesChange} className="w-full bg-gray-700 p-3 rounded-lg text-white">
                <option value="25">25 min (Pomodoro)</option>
                <option value="50">50 min (Estándar)</option>
                <option value="90">90 min (Deep Work)</option>
              </select>
            </div>
          </section>

          {/* --- SECCIÓN 3: ESTRATEGIA --- */}
          <section>
            <SectionTitle>Estrategia de Agendamiento</SectionTitle>
            <div className="mt-6">
              <label htmlFor="schedulingAggressiveness" className="block text-gray-300 font-semibold mb-2">Estilo de horario</label>
              <select name="schedulingAggressiveness" id="schedulingAggressiveness" value={preferences.schedulingAggressiveness || 'Normal'} onChange={onPreferencesChange} className="w-full bg-gray-700 p-3 rounded-lg text-white">
                <option value="Relajado">Relajado (con descansos amplios)</option>
                <option value="Normal">Normal (balanceado)</option>
                <option value="Compacto">Compacto (tareas seguidas)</option>
              </select>
            </div>
            <div className="flex items-center gap-4 mt-6">
              <input type="checkbox" name="taskBatching" id="taskBatching" checked={!!preferences.taskBatching} onChange={onPreferencesChange} className="w-5 h-5 rounded text-purple-500 bg-gray-600 border-gray-500 focus:ring-purple-600" />
              <label htmlFor="taskBatching" className="font-semibold text-gray-300">Agrupar tareas similares</label>
            </div>
            <div className="mt-6">
              <label className="block text-gray-300 font-semibold mb-2">Días sin reuniones</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => (
                  <label key={day} className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-gray-700 text-gray-300">
                    <input type="checkbox" name="daysNoMeetings" value={day} checked={(preferences.daysNoMeetings || []).includes(day)} onChange={handleDaysNoMeetingsChange} className="w-4 h-4 text-purple-500 bg-gray-600 border-gray-500 rounded focus:ring-purple-600" />
                    {day}
                  </label>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-700">
          <button onClick={onRequestClose} className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 font-bold py-3 px-6 rounded-lg text-white">Hecho</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PreferencesModal;