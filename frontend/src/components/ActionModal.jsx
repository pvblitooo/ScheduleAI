import React from 'react';
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
    maxWidth: '450px',
    padding: '2rem',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 2000, // Un z-index aún más alto para estas notificaciones
  },
};

Modal.setAppElement('#root');

const ActionModal = ({ isOpen, onRequestClose, title, message, onConfirm, showConfirmButton }) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel={title}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <button onClick={onRequestClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
      </div>

      {/* --- ¡CAMBIO CLAVE AQUÍ! --- */}
      {/* Usamos 'dangerouslySetInnerHTML' para renderizar el HTML de la lista */}
      <div className="text-gray-300" dangerouslySetInnerHTML={{ __html: message }} />

      <div className="flex justify-end gap-4 mt-8">
        {showConfirmButton && (
          <button onClick={onRequestClose} className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded">
            Cancelar
          </button>
        )}
        <button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700 font-bold py-2 px-4 rounded">
          {showConfirmButton ? 'Confirmar' : 'Aceptar'}
        </button>
      </div>
    </Modal>
  );
};

export default ActionModal;