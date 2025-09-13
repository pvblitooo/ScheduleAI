import React, { useState } from 'react';
import Modal from 'react-modal';

// Usamos los mismos estilos que el otro modal para mantener la consistencia
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
    maxWidth: '400px',
    padding: '2rem',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
};

Modal.setAppElement('#root');

const SaveScheduleModal = ({ isOpen, onRequestClose, onSave }) => {
  const [scheduleName, setScheduleName] = useState('Mi Semana Ideal');

  const handleSaveClick = () => {
    if (scheduleName.trim() === '') {
      alert('Por favor, introduce un nombre para la rutina.');
      return;
    }
    onSave(scheduleName);
    onRequestClose(); // Cierra el modal después de guardar
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Guardar Nueva Rutina"
    >
      <h2 className="text-2xl font-bold mb-4">Guardar Rutina</h2>
      <p className="mb-4 text-gray-300">Dale un nombre a tu nueva plantilla de horario.</p>
      <input
        type="text"
        value={scheduleName}
        onChange={(e) => setScheduleName(e.target.value)}
        className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Ej: Rutina de Exámenes"
      />
      <div className="flex justify-end gap-4 mt-6">
        <button onClick={onRequestClose} className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded">
          Cancelar
        </button>
        <button onClick={handleSaveClick} className="bg-green-600 hover:bg-green-700 py-2 px-4 rounded">
          Guardar
        </button>
      </div>
    </Modal>
  );
};

export default SaveScheduleModal;