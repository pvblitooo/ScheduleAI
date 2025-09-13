import React, { useEffect } from 'react';

const DraggableActivity = ({ activity }) => {

  // Este es el "payload" o la información que el calendario recibirá
  // cuando soltemos este elemento sobre él.
  const eventData = {
    title: activity.name,
    duration: `${String(Math.floor(activity.duration / 60)).padStart(2, '0')}:${String(activity.duration % 60).padStart(2, '0')}`,
    // Podemos añadir un color por defecto si queremos
    backgroundColor: '#0ea5e9', // Un azul cian para los nuevos eventos
    borderColor: '#0ea5e9'
  };

  return (
    <div
      className='fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event p-2 mb-2 rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors'
      data-event={JSON.stringify(eventData)} // ¡La clave está aquí!
    >
      <div className='fc-event-main'>
        <strong>{activity.name}</strong> ({activity.duration} min)
      </div>
    </div>
  );
};

export default DraggableActivity;