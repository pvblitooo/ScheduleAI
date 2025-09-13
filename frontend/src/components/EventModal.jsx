import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#1f2937',
    color: '#f9fafb',
    border: '1px solid #4b5563',
    borderRadius: '0.5rem',
    width: '90%',
    maxWidth: '500px',
    padding: '2rem',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 2000,
  },
};

Modal.setAppElement('#root');

const EventModal = ({ isOpen, onRequestClose, event, onUpdate, onDelete }) => {
  const [formData, setFormData] = useState({ title: '', start: '', end: '' });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        start: event.start ? event.start.slice(0, 16) : '',
        end: event.end ? event.end.slice(0, 16) : '',
      });
    }
  }, [event]);

  if (!event) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateClick = () => {
    onUpdate(event.id, {
      ...formData,
      start: new Date(formData.start).toISOString(),
      end: new Date(formData.end).toISOString(),
    });
    onRequestClose();
  };

  // --- ¡FUNCIÓN MODIFICADA! ---
  // Ahora solo notifica la intención de borrar, no pregunta.
  const handleDeleteClick = () => {
    onDelete(event.id);
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Detalles del Evento"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Editar Evento</h2>
        <button onClick={onRequestClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Título</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Inicio</label>
          <input
            type="datetime-local"
            name="start"
            value={formData.start}
            onChange={handleChange}
            className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Fin</label>
          <input
            type="datetime-local"
            name="end"
            value={formData.end}
            onChange={handleChange}
            className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        <button onClick={handleDeleteClick} className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded transition-colors">
          Eliminar
        </button>
        <div className="flex gap-4">
          <button onClick={onRequestClose} className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded">
            Cancelar
          </button>
          <button onClick={handleUpdateClick} className="bg-blue-600 hover:bg-blue-700 font-bold py-2 px-4 rounded">
            Guardar Cambios
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EventModal;