import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

// Componente para los títulos de las secciones
const SectionTitle = ({ children, icon }) => (
  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700">
    {icon && <div className="text-purple-400">{icon}</div>}
    <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
      {children}
    </h3>
  </div>
);

const PreferencesModal = ({ isOpen, onRequestClose, preferences, onPreferencesChange }) => {

  // Actualiza un bloque de tiempo existente
  const handlePeakHourChange = (index, field, value) => {
    const newPeakHours = [...preferences.peakHours];
    newPeakHours[index] = { ...newPeakHours[index], [field]: value };
    onPreferencesChange({ target: { name: 'peakHours', value: newPeakHours } });
  };

  // Añade un nuevo bloque de tiempo
  const addPeakHour = () => {
    const currentPeakHours = preferences.peakHours || [];
    const newPeakHours = [...currentPeakHours, { start: '12:00', end: '13:00' }];
    onPreferencesChange({ target: { name: 'peakHours', value: newPeakHours } });
  };

  // Elimina un bloque de tiempo
  const removePeakHour = (index) => {
    const newPeakHours = preferences.peakHours.filter((_, i) => i !== index);
    onPreferencesChange({ target: { name: 'peakHours', value: newPeakHours } });
  };

  // Cierra el modal con 'Escape' y previene scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onRequestClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
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

  if (!isOpen) return null;
  
return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onRequestClose}></div>
      
      {/* --- MODIFICADO: Contenedor del Modal --- */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-scaleIn">
        
        {/* --- MODIFICADO: Cabecera --- */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {/* --- MODIFICADO: Icono --- */}
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            {/* --- MODIFICADO: Título --- */}
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Preferencias</h2>
          </div>
          {/* --- MODIFICADO: Botón de Cerrar --- */}
          <button 
            onClick={onRequestClose} 
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-transparent hover:bg-slate-200 dark:hover:bg-slate-800 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* --- MODIFICADO: Cuerpo del Modal --- */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {/* --- MODIFICADO: SECCIÓN 1: DISPONIBILIDAD --- */}
          <section className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-5 rounded-xl">
            <SectionTitle icon={
              // --- MODIFICADO: Icono ---
              <svg className="w-5 h-5 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }>
              Disponibilidad
            </SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                {/* --- MODIFICADO: Label --- */}
                <label htmlFor="startHour" className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">Inicio del día</label>
                {/* --- MODIFICADO: Input --- */}
                <input 
                  id="startHour" 
                  type="number" 
                  name="startHour" 
                  value={preferences.startHour || ''} 
                  onChange={onPreferencesChange} 
                  className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 p-2.5 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                  min="0" 
                  max="23" 
                />
              </div>
              <div>
                {/* --- MODIFICADO: Label --- */}
                <label htmlFor="endHour" className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">Fin del día</label>
                {/* --- MODIFICADO: Input --- */}
                <input 
                  id="endHour" 
                  type="number" 
                  name="endHour" 
                  value={preferences.endHour || ''} 
                  onChange={onPreferencesChange} 
                  className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 p-2.5 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                  min="1" 
                  max="24" 
                />
              </div>
            </div>
          </section>

          {/* --- MODIFICADO: SECCIÓN 2: ENERGÍA Y ENFOQUE --- */}
          <section className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-5 rounded-xl">
            <SectionTitle icon={
              // --- MODIFICADO: Icono ---
              <svg className="w-5 h-5 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }>
              Energía y Enfoque
            </SectionTitle>
            
            <div className="space-y-4">
              <div>
                {/* --- MODIFICADO: Label --- */}
                <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-3">Horas de máxima productividad</label>
                <div className="space-y-2">
                  {(preferences.peakHours || []).map((range, index) => (
                    // --- MODIFICADO: Contenedor de rango de tiempo ---
                    <div key={index} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700/50 p-2 rounded-lg border border-slate-200 dark:border-slate-600/50">
                      {/* --- MODIFICADO: Input time --- */}
                      <input 
                        type="time" 
                        value={range.start} 
                        onChange={(e) => handlePeakHourChange(index, 'start', e.target.value)} 
                        className="flex-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 p-2 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" 
                      />
                      {/* --- MODIFICADO: Guion --- */}
                      <span className="text-slate-500 dark:text-slate-400">—</span>
                      {/* --- MODIFICADO: Input time --- */}
                      <input 
                        type="time" 
                        value={range.end} 
                        onChange={(e) => handlePeakHourChange(index, 'end', e.target.value)} 
                        className="flex-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 p-2 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" 
                      />
                      {/* Botón (rojo, no cambia) */}
                      <button 
                        onClick={() => removePeakHour(index)} 
                        className="p-2 bg-red-600 hover:bg-red-500 rounded-lg text-white transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {/* Botón (verde, no cambia) */}
                  <button 
                    onClick={addPeakHour} 
                    className="w-full bg-green-600 hover:bg-green-500 font-semibold py-2.5 px-4 rounded-lg text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Añadir Bloque
                  </button>
                </div>
              </div>

              <div>
                {/* --- MODIFICADO: Label --- */}
                <label htmlFor="productivityArchetype" className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">Arquetipo de productividad</label>
                {/* --- MODIFICADO: Select --- */}
                <select 
                  name="productivityArchetype" 
                  id="productivityArchetype" 
                  value={preferences.productivityArchetype || 'Constante'} 
                  onChange={onPreferencesChange} 
                  className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 p-2.5 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                >
                  <option value="Madrugador">🌅 Madrugador (energía alta por la mañana)</option>
                  <option value="Nocturno">🌙 Nocturno (energía alta por la tarde/noche)</option>
                  <option value="Por Sprints">⚡ Por Sprints (energía en ráfagas cortas)</option>
                  <option value="Constante">📊 Constante (energía estable)</option>
                </select>
              </div>

              <div>
                {/* --- MODIFICADO: Label --- */}
                <label htmlFor="focusBlockDuration" className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">Duración de bloque de enfoque</label>
                {/* --- MODIFICADO: Select --- */}
                <select 
                  name="focusBlockDuration" 
                  id="focusBlockDuration" 
                  value={preferences.focusBlockDuration || 50} 
                  onChange={onPreferencesChange} 
                  className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 p-2.5 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                >
                  <option value="25">25 min (Pomodoro) 🍅</option>
                  <option value="50">50 min (Estándar) ⏱️</option>
                  <option value="90">90 min (Deep Work) 🎯</option>
                </select>
              </div>
            </div>
          </section>

          {/* --- MODIFICADO: SECCIÓN 3: ESTRATEGIA --- */}
          <section className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-5 rounded-xl">
            <SectionTitle icon={
              // --- MODIFICADO: Icono ---
              <svg className="w-5 h-5 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            }>
              Estrategia de Agendamiento
            </SectionTitle>

            <div className="space-y-4">
              <div>
                {/* --- MODIFICADO: Label --- */}
                <label htmlFor="schedulingAggressiveness" className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">Estilo de horario</label>
                {/* --- MODIFICADO: Select --- */}
                <select 
                  name="schedulingAggressiveness" 
                  id="schedulingAggressiveness" 
                  value={preferences.schedulingAggressiveness || 'Normal'} 
                  onChange={onPreferencesChange} 
                  className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 p-2.5 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                >
                  <option value="Relajado">😌 Relajado (con descansos amplios)</option>
                  <option value="Normal">⚖️ Normal (balanceado)</option>
                  <option value="Compacto">🚀 Compacto (tareas seguidas)</option>
                </select>
              </div>

              {/* --- MODIFICADO: Checkbox "Agrupar tareas" --- */}
              <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600/50 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors">
                <input 
                  type="checkbox" 
                  name="taskBatching" 
                  id="taskBatching" 
                  checked={!!preferences.taskBatching} 
                  onChange={onPreferencesChange} 
                  className="w-5 h-5 rounded text-purple-600 bg-slate-200 dark:bg-slate-600 border-slate-300 dark:border-slate-500 focus:ring-purple-500 focus:ring-offset-white dark:focus:ring-offset-slate-900" 
                />
                <span className="font-medium text-slate-800 dark:text-slate-200">Agrupar tareas similares</span>
              </label>

              <div>
                {/* --- MODIFICADO: Label --- */}
                <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-3">Días sin reuniones</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => (
                    // --- MODIFICADO: Checkboxes de días ---
                    <label 
                      key={day} 
                      className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg bg-slate-100 dark:bg-transparent hover:bg-slate-200 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600/30 hover:border-purple-400 dark:hover:border-purple-500/30 transition-all"
                    >
                      <input 
                        type="checkbox" 
                        name="daysNoMeetings" 
                        value={day} 
                        checked={(preferences.daysNoMeetings || []).includes(day)} 
                        onChange={handleDaysNoMeetingsChange} 
                        className="w-4 h-4 text-purple-600 bg-slate-200 dark:bg-slate-600 border-slate-300 dark:border-slate-500 rounded focus:ring-purple-500" 
                      />
                      <span className="text-sm">{day.slice(0, 3)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* --- MODIFICADO: Pie del Modal --- */}
        <div className="flex justify-end p-6 border-t border-slate-200 dark:border-slate-800">
          {/* Botón (gradiente, no cambia) */}
          <button 
            onClick={onRequestClose} 
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 font-semibold py-3 px-8 rounded-lg text-white transition-all shadow-lg hover:shadow-purple-500/50"
          >
            Guardar Preferencias
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PreferencesModal;
