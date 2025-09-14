import React from 'react';
import Modal from 'react-modal';

// Estilos personalizados para el modal, alineados con el tema oscuro.
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#1f2937', // bg-gray-800
    color: '#f9fafb',           // text-gray-50
    border: '1px solid #4b5563', // border-gray-600
    borderRadius: '0.75rem',     // rounded-xl
    width: '90%',
    maxWidth: '500px',
    padding: '2rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  overlay: {
    backgroundColor: 'rgba(17, 24, 39, 0.8)', // bg-gray-900 con opacidad
    zIndex: 50,
  },
};

// Asegúrate de que el modal sepa cuál es el elemento raíz de tu app para la accesibilidad
Modal.setAppElement('#root');

const PreferencesModal = ({ isOpen, onRequestClose, preferences, onPreferencesChange }) => {

  const handleSave = () => {
    // Aquí podrías añadir lógica para guardar las preferencias en el backend si quisieras,
    // pero por ahora, como usamos useLocalStorage, solo cerramos el modal.
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Preferencias del Calendario"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Preferencias</h2>
        <button 
          onClick={onRequestClose} 
          className="text-gray-400 hover:text-white text-4xl leading-none font-light"
        >
          &times;
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="startHour" className="block text-lg font-semibold text-gray-300">
            Hora de inicio del día
          </label>
          <input 
            id="startHour"
            type="number" 
            name="startHour" 
            value={preferences.startHour} 
            onChange={onPreferencesChange} 
            className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg p-3 mt-2 text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
            min="0" max="23" 
          />
        </div>
        <div>
          <label htmlFor="endHour" className="block text-lg font-semibold text-gray-300">
            Hora de fin del día
          </label>
          <input 
            id="endHour"
            type="number" 
            name="endHour" 
            value={preferences.endHour} 
            onChange={onPreferencesChange} 
            className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg p-3 mt-2 text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
            min="1" max="24"
          />
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button 
          onClick={handleSave} 
          className="bg-purple-600 hover:bg-purple-700 font-bold py-3 px-6 rounded-lg transition-colors transform hover:scale-105"
        >
          Hecho
        </button>
      </div>
    </Modal>
  );
};

export default PreferencesModal;