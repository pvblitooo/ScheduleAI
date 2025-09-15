import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const ActionModal = ({ isOpen, onRequestClose, title, message, onConfirm, showConfirmButton }) => {
  
  // Efecto para cerrar el modal con la tecla 'Escape'
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

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onRequestClose();
  };

  // Usamos createPortal para renderizar el modal fuera de la jerarquía del DOM principal
  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Fondo Oscuro (Overlay) */}
      <div 
        className="fixed inset-0 bg-black/80" 
        onClick={onRequestClose}
        aria-hidden="true"
      ></div>

      {/* Contenedor del Modal */}
      <div className="relative w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 id="modal-title" className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onRequestClose} className="text-gray-400 hover:text-white text-3xl transition-colors">&times;</button>
        </div>

        {/* Cuerpo del Modal (con scroll si es necesario) */}
        <div className="p-6 overflow-y-auto">
          <div className="text-gray-300" dangerouslySetInnerHTML={{ __html: message }} />
        </div>

        {/* Pie del Modal (Botones) */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 p-6 border-t border-gray-700">
          {showConfirmButton && (
            <button onClick={onRequestClose} className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              Cancelar
            </button>
          )}
          <button onClick={handleConfirm} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            {showConfirmButton ? 'Confirmar' : 'Aceptar'}
          </button>
        </div>
      </div>
    </div>,
    document.body // Renderizamos el modal directamente en el body
  );
};

export default ActionModal;