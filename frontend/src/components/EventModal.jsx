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

  // Cierra el modal con la tecla 'Escape'
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onRequestClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
      {/* Fondo Oscuro */}
      <div className="fixed inset-0 bg-black/80" onClick={onRequestClose} aria-hidden="true"></div>

      {/* Contenedor del Modal */}
      <div className="relative w-full max-w-lg bg-gray-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Cabecera */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Editar Evento</h2>
          <button onClick={onRequestClose} className="text-gray-400 hover:text-white text-3xl transition-colors">&times;</button>
        </div>

        {/* Cuerpo del Modal (Formulario) */}
        <div className="p-6 space-y-6 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Título</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Inicio</label>
              <input
                type="datetime-local"
                name="start"
                value={formData.start}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Fin</label>
              <input
                type="datetime-local"
                name="end"
                value={formData.end}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Pie del Modal (Botones) */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-center p-6 border-t border-gray-700 gap-4">
          <button onClick={handleDeleteClick} className="w-full sm:w-auto bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Eliminar
          </button>
          <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto">
            <button onClick={onRequestClose} className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              Cancelar
            </button>
            <button onClick={handleUpdateClick} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
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