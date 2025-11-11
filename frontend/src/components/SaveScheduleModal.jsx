import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const SaveScheduleModal = ({ isOpen, onRequestClose, onSave }) => {
  const [scheduleName, setScheduleName] = useState('Mi Semana Ideal');
  const [error, setError] = useState('');

  // Resetear el nombre cada vez que el modal se abre
  useEffect(() => {
    if (isOpen) {
      setScheduleName('Mi Semana Ideal');
      setError('');
    }
  }, [isOpen]);

  // Cerrar con 'Escape' y prevenir scroll
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
  
  const handleSaveClick = () => {
    if (scheduleName.trim() === '') {
      setError('Por favor, introduce un nombre para la rutina.');
      return;
    }
    onSave(scheduleName);
    onRequestClose();
  };

  if (!isOpen) return null;

return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Fondo Oscuro con blur (sin cambios) */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm" 
        onClick={onRequestClose} 
        aria-hidden="true"
      ></div>

      {/* --- MODIFICADO: Contenedor del Modal --- */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col animate-scaleIn">
        
        {/* --- MODIFICADO: Cabecera --- */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {/* --- MODIFICADO: Icono --- */}
            <div className="w-10 h-10 bg-green-100 dark:bg-green-500/20 border border-green-200 dark:border-green-500/30 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </div>
            {/* --- MODIFICADO: Título --- */}
            <h2 id="modal-title" className="text-xl font-bold text-slate-900 dark:text-white">Guardar Rutina</h2>
          </div>
          {/* --- MODIFICADO: Botón de Cerrar --- */}
          <button 
            onClick={onRequestClose} 
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-transparent hover:bg-slate-200 dark:hover:bg-slate-800 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
            aria-label="Cerrar modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* --- MODIFICADO: Cuerpo --- */}
        <div className="p-6 space-y-4">
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Dale un nombre significativo a tu nueva plantilla de horario para identificarla fácilmente.
          </p>
          
          <div>
            {/* --- MODIFICADO: Label --- */}
            <label htmlFor="schedule-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Nombre de la rutina
            </label>
            {/* --- MODIFICADO: Input --- */}
            <input
              id="schedule-name"
              type="text"
              value={scheduleName}
              onChange={(e) => {
                setScheduleName(e.target.value);
                setError('');
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSaveClick();
              }}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Ej: Rutina de Exámenes"
              autoFocus
            />
            {error && (
              // --- MODIFICADO: Error (sin cambios de clase, ya usa colores de alerta) ---
              <p className="mt-2 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            )}
          </div>
        </div>

        {/* --- MODIFICADO: Pie del Modal --- */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-800">
          {/* --- MODIFICADO: Botón Cancelar --- */}
          <button 
            onClick={onRequestClose} 
            className="w-full sm:w-auto bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white font-semibold py-2.5 px-5 rounded-lg transition-all duration-200"
          >
            Cancelar
          </button>
          {/* Botón Guardar (sin cambios, verde se ve bien) */}
          <button 
            onClick={handleSaveClick} 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold py-2.5 px-5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-green-500/50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Guardar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SaveScheduleModal;
