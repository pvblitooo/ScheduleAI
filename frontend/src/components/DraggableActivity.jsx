import React from 'react';

// Función auxiliar mejorada con íconos y colores consistentes
const getCategoryAppearance = (category) => {
  switch (category) {
    case 'estudio':   
      return { 
        className: 'bg-blue-500/20 text-blue-300 border border-blue-500/30', 
        name: 'Estudio',
        icon: '📚'
      };
    case 'trabajo':   
      return { 
        className: 'bg-purple-500/20 text-purple-300 border border-purple-500/30', 
        name: 'Trabajo',
        icon: '💼'
      };
    case 'ejercicio': 
      return { 
        className: 'bg-red-500/20 text-red-300 border border-red-500/30', 
        name: 'Ejercicio',
        icon: '🏃'
      };
    case 'ocio':      
      return { 
        className: 'bg-green-500/20 text-green-300 border border-green-500/30', 
        name: 'Ocio',
        icon: '🎮'
      };
    case 'personal':  
      return { 
        className: 'bg-orange-500/20 text-orange-300 border border-orange-500/30', 
        name: 'Personal',
        icon: '📝'
      };
    case 'familia':   
      return { 
        className: 'bg-pink-500/20 text-pink-300 border border-pink-500/30', 
        name: 'Familia',
        icon: '👨‍👩‍👧'
      };
    default:          
      return { 
        className: 'bg-slate-500/20 text-slate-300 border border-slate-500/30', 
        name: category,
        icon: '📌'
      };
  }
};

const DraggableActivity = ({ activity, getColor }) => {
  // 1. Obtenemos el color HEX para el evento del CALENDARIO
  const eventColor = getColor ? getColor(activity.category) : '#6b7280';
  
  // 2. Obtenemos el estilo de la ETIQUETA para ESTE componente
  const categoryStyle = getCategoryAppearance(activity.category);

  // Preparamos los datos para FullCalendar
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
      className='fc-event flex justify-between items-center gap-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-purple-500/30 p-3.5 mb-2.5 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 group'
      data-event={JSON.stringify(eventData)}
    >
      {/* Lado izquierdo: Contenedor flexible */}
      <div className="min-w-0 flex-grow space-y-1">
        <div className="flex items-center gap-2">
          {/* Indicador de color de la categoría */}
          <div 
            className="w-1 h-8 rounded-full flex-shrink-0" 
            style={{ backgroundColor: eventColor }}
          ></div>
          <strong className="text-white font-semibold block truncate group-hover:text-purple-300 transition-colors">
            {activity.name}
          </strong>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400 ml-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{activity.duration} min</span>
        </div>
      </div>

      {/* Lado derecho: Badge de categoría con ícono */}
      <span className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${categoryStyle.className}`}>
        <span>{categoryStyle.icon}</span>
        <span>{categoryStyle.name}</span>
      </span>
    </div>
  );
};

export default DraggableActivity;
