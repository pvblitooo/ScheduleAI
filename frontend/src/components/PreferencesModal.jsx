import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const PreferencesModal = ({ isOpen, onRequestClose, preferences, onPreferencesChange }) => {

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

  if (!isOpen) {
    return null;
  }
  
  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Fondo Oscuro */}
      <div 
        className="fixed inset-0 bg-black/80" 
        onClick={onRequestClose} 
        aria-hidden="true"
      ></div>

      {/* Contenedor del Modal */}
      <div className="relative w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Cabecera */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 id="modal-title" className="text-2xl font-bold text-white">Preferencias</h2>
          <button onClick={onRequestClose} className="text-gray-400 hover:text-white text-3xl transition-colors">&times;</button>
        </div>

        {/* Cuerpo del Modal (Formulario) */}
        <div className="p-6 space-y-6 overflow-y-auto">
          <div>
            <label htmlFor="startHour" className="block text-lg font-semibold text-gray-300 mb-2">
              Hora de inicio del día
            </label>
            <input 
              id="startHour"
              type="number" 
              name="startHour" 
              value={preferences.startHour} 
              onChange={onPreferencesChange} 
              className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-inner" 
              min="0" max="23" 
            />
          </div>
          <div>
            <label htmlFor="endHour" className="block text-lg font-semibold text-gray-300 mb-2">
              Hora de fin del día
            </label>
            <input 
              id="endHour"
              type="number" 
              name="endHour" 
              value={preferences.endHour} 
              onChange={onPreferencesChange} 
              className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-inner" 
              min="1" max="24"
            />
          </div>
        </div>

        {/* Pie del Modal (Botones) */}
        <div className="flex justify-end p-6 border-t border-gray-700">
          <button 
            onClick={onRequestClose} 
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 font-bold py-3 px-6 rounded-lg transition-colors transform hover:scale-105"
          >
            Hecho
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PreferencesModal;