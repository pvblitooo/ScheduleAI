import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const SaveScheduleModal = ({ isOpen, onRequestClose, onSave }) => {
  const [scheduleName, setScheduleName] = useState('Mi Semana Ideal');

  // Efecto para resetear el nombre cada vez que el modal se abre
  useEffect(() => {
    if (isOpen) {
      setScheduleName('Mi Semana Ideal');
    }
  }, [isOpen]);

  // Efecto para cerrar con la tecla 'Escape'
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onRequestClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onRequestClose]);
  
  const handleSaveClick = () => {
    if (scheduleName.trim() === '') {
      // Es mejor usar un feedback más integrado que un alert, pero por ahora está bien.
      alert('Por favor, introduce un nombre para la rutina.');
      return;
    }
    onSave(scheduleName);
    onRequestClose();
  };

  if (!isOpen) return null;

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
      <div className="relative w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl flex flex-col p-6">
        
        {/* Contenido */}
        <h2 id="modal-title" className="text-2xl font-bold mb-2 text-white">Guardar Rutina</h2>
        <p className="mb-6 text-gray-300">Dale un nombre a tu nueva plantilla de horario.</p>
        
        <input
          type="text"
          value={scheduleName}
          onChange={(e) => setScheduleName(e.target.value)}
          className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
          placeholder="Ej: Rutina de Exámenes"
        />

        {/* Pie de página con botones responsivos */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8">
          <button 
            onClick={onRequestClose} 
            className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSaveClick} 
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SaveScheduleModal;