import React from 'react';

// Función auxiliar mejorada con íconos y colores consistentes
const getCategoryAppearance = (category) => {
  switch (category) {
    case 'estudio':   
      return { 
        // --- MODIFICADO ---
        className: 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30', 
        name: 'Estudio',
        icon: '📚'
      };
    case 'trabajo':   
      return { 
        // --- MODIFICADO ---
        className: 'bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30', 
        name: 'Trabajo',
        icon: '💼'
      };
    case 'ejercicio': 
      return { 
        // --- MODIFICADO ---
        className: 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30', 
        name: 'Ejercicio',
        icon: '🏃'
      };
    case 'ocio':      
      return { 
        // --- MODIFICADO ---
        className: 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30', 
        name: 'Ocio',
        icon: '🎮'
      };
    case 'personal':  
      return { 
        // --- MODIFICADO ---
        className: 'bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30', 
        name: 'Personal',
        icon: '📝'
      };
    case 'familia':   
      return { 
        // --- MODIFICADO ---
        className: 'bg-pink-100 text-pink-700 border border-pink-200 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-500/30', 
        name: 'Familia',
        icon: '👨‍👩‍👧'
      };
    default:          
      return { 
        // --- MODIFICADO ---
        className: 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30', 
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
      // --- MODIFICADO: Fondo, borde y hover ---
      className='fc-event flex justify-between items-center gap-4 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-slate-700/50 hover:border-purple-400 dark:hover:border-purple-500/30 p-3.5 mb-2.5 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 group'
      data-event={JSON.stringify(eventData)}
    >
      {/* Lado izquierdo: Contenedor flexible */}
      <div className="min-w-0 flex-grow space-y-1">
        <div className="flex items-center gap-2">
          {/* Indicador de color de la categoría (sin cambios, es dinámico) */}
          <div 
            className="w-1 h-8 rounded-full flex-shrink-0" 
            style={{ backgroundColor: eventColor }}
          ></div>
          {/* --- MODIFICADO: Color de texto del título --- */}
          <strong className="text-slate-800 dark:text-white font-semibold block truncate group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
            {activity.name}
          </strong>
        </div>
        {/* --- MODIFICADO: Color de texto de la duración --- */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 ml-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{activity.duration} min</span>
        </div>
      </div>

      {/* Lado derecho: Badge de categoría con ícono */}
      {/* --- ¡ADVERTENCIA! ESTO PUEDE NECESITAR MÁS CAMBIOS --- */}
      <span className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${categoryStyle.className}`}>
        <span>{categoryStyle.icon}</span>
        <span>{categoryStyle.name}</span>
      </span>
    </div>
  );
};

export default DraggableActivity;
