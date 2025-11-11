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
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
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


  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Fondo Oscuro (Overlay) con blur (sin cambios) */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm" 
        onClick={onRequestClose}
        aria-hidden="true"
      ></div>

      {/* --- MODIFICADO: Contenedor del Modal --- */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-scaleIn">
        
        {/* --- MODIFICADO: Cabecera --- */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {/* Ícono basado en el tipo de acción */}
            {showConfirmButton ? (
              // --- MODIFICADO: Icono de Confirmar (Error/Alerta) ---
              <div className="w-10 h-10 bg-red-100 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            ) : (
              // --- MODIFICADO: Icono de Información ---
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            {/* --- MODIFICADO: Título --- */}
            <h2 id="modal-title" className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
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

        {/* --- MODIFICADO: Cuerpo del Modal --- */}
        <div className="p-6 overflow-y-auto">
          <div className="text-slate-600 dark:text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: message }} />
        </div>

        {/* --- MODIFICADO: Pie del Modal --- */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-800">
          {showConfirmButton && (
            // --- MODIFICADO: Botón Cancelar ---
            <button 
              onClick={onRequestClose} 
              className="w-full sm:w-auto bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white font-semibold py-2.5 px-5 rounded-lg transition-all duration-200"
            >
              Cancelar
            </button>
          )}
          {/* Los botones de acción principal (Rojo y Morado) no necesitan cambios, se ven bien en ambos temas */}
          <button 
            onClick={handleConfirm} 
            className={`w-full sm:w-auto font-semibold py-2.5 px-5 rounded-lg transition-all duration-200 shadow-lg ${
              showConfirmButton 
                ? 'bg-red-600 hover:bg-red-500 text-white hover:shadow-red-500/50' 
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white hover:shadow-purple-500/50'
            }`}
          >
            {showConfirmButton ? 'Confirmar' : 'Aceptar'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ActionModal;
