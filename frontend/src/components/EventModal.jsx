import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const EventModal = ({ isOpen, onRequestClose, event, onUpdate, onDelete }) => {
  // Estado local para manejar los datos del formulario
  const [formData, setFormData] = useState({ title: '', start: '', end: '' });

  // Sincroniza el estado del formulario cuando el evento cambia
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        start: event.start ? new Date(event.start).toISOString().slice(0, 16) : '',
        end: event.end ? new Date(event.end).toISOString().slice(0, 16) : '',
      });
    }
  }, [event]);

  // Cierra el modal con la tecla 'Escape' y previene scroll
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

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateClick = () => {
    onUpdate({
      ...event,
      ...formData,
      start: new Date(formData.start).toISOString(),
      end: new Date(formData.end).toISOString(),
    });
    onRequestClose();
  };

  const handleDeleteClick = () => {
    onDelete(event.id);
    onRequestClose();
  };

return createPortal(
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      {/* Fondo Oscuro con blur (sin cambios) */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={onRequestClose} aria-hidden="true"></div>

      {/* --- MODIFICADO: Contenedor del Modal --- */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* --- MODIFICADO: Cabecera --- */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {/* --- MODIFICADO: Icono --- */}
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            {/* --- MODIFICADO: Título --- */}
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Editar Evento</h2>
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

        {/* --- MODIFICADO: Cuerpo del Modal (Formulario) --- */}
        <div className="p-6 space-y-5 overflow-y-auto">
          <div>
            {/* --- MODIFICADO: Label Título --- */}
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Título del Evento
            </label>
            {/* --- MODIFICADO: Input Título --- */}
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Nombre del evento"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              {/* --- MODIFICADO: Label Inicio --- */}
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Inicio
              </label>
              {/* --- MODIFICADO: Input Inicio --- */}
              <input
                type="datetime-local"
                name="start"
                value={formData.start}
                onChange={handleChange}
                // --- MODIFICADO: Estilos del input datetime ---
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              {/* --- MODIFICADO: Label Fin --- */}
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Fin
              </label>
              {/* --- MODIFICADO: Input Fin --- */}
              <input
                type="datetime-local"
                name="end"
                value={formData.end}
                onChange={handleChange}
                // --- MODIFICADO: Estilos del input datetime ---
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* --- MODIFICADO: Pie del Modal (Botones) --- */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-center p-6 border-t border-slate-200 dark:border-slate-800 gap-3">
          {/* Botón Eliminar (sin cambios, rojo se ve bien) */}
          <button 
            onClick={handleDeleteClick} 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 px-5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-red-500/50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar
          </button>
          <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto">
            {/* --- MODIFICADO: Botón Cancelar --- */}
            <button 
              onClick={onRequestClose} 
              className="w-full sm:w-auto bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white font-semibold py-2.5 px-5 rounded-lg transition-all duration-200"
            >
              Cancelar
            </button>
            {/* Botón Guardar (sin cambios, gradiente se ve bien) */}
            <button 
              onClick={handleUpdateClick} 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-2.5 px-5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EventModal;
