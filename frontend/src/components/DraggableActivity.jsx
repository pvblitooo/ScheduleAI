import React from 'react';

// Nueva función auxiliar que vive solo en este componente para definir el estilo de las etiquetas.
// Usa colores pastel para el fondo y un texto más oscuro para mejor legibilidad.
const getCategoryAppearance = (category) => {
  switch (category) {
    case 'estudio':   return { className: 'bg-blue-200 text-blue-800', name: 'Estudio' };
    case 'trabajo':   return { className: 'bg-purple-200 text-purple-800', name: 'Trabajo' };
    case 'ejercicio': return { className: 'bg-red-200 text-red-800', name: 'Ejercicio' };
    case 'ocio':      return { className: 'bg-green-200 text-green-800', name: 'Ocio' };
    case 'personal':  return { className: 'bg-orange-200 text-orange-800', name: 'Personal' };
    case 'familia':   return { className: 'bg-pink-200 text-pink-800', name: 'Familia' };
    default:          return { className: 'bg-gray-200 text-gray-800', name: category };
  }
};

const DraggableActivity = ({ activity, getColor }) => {
  // 1. Obtenemos el color HEX para el evento del CALENDARIO (lógica sin cambios)
  const eventColor = getColor ? getColor(activity.category) : '#6b7280';
  
  // 2. Obtenemos el estilo de la ETIQUETA para ESTE componente
  const categoryStyle = getCategoryAppearance(activity.category);

  // Preparamos los datos para FullCalendar, usando el color HEX como siempre
  const eventData = {
    title: activity.name,
    duration: `${String(Math.floor(activity.duration / 60)).padStart(2, '0')}:${String(activity.duration % 60).padStart(2, '0')}`,
    backgroundColor: eventColor,
    borderColor: eventColor,
    extendedProps: {
        category: activity.category
    }
  };

  return (
  <div
    className='fc-event flex justify-between items-center gap-4 bg-gray-800 hover:bg-gray-700 p-3 mb-2 rounded-lg cursor-pointer transition-colors'
    data-event={JSON.stringify(eventData)}
  >
    {/* Lado izquierdo: Contenedor flexible para truncado correcto */}
    <div className="min-w-0 flex-grow">
      <strong className="text-white font-semibold block truncate">{activity.name}</strong>
      <p className="text-sm text-gray-400">{activity.duration} min</p>
    </div>

    {/* Lado derecho: La etiqueta no se encoge */}
    <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${categoryStyle.className}`}>
      {categoryStyle.name}
    </span>
  </div>
);
};

export default DraggableActivity;