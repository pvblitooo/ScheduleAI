import { Link } from 'react-router-dom';

const DashboardPage = () => {
  
  return (
  // Contenedor principal con más padding para un look más espacioso
  <div className="text-white p-4 sm:p-6 md:p-8">
    <div className="text-center">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
        Bienvenido a ScheduleAI
      </h1>
      <p className="text-md md:text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
        Tu asistente personal para organizar el caos y conquistar tus metas. ¿Qué te gustaría hacer hoy?
      </p>
    </div>

    {/* Contenedor de las tarjetas con un grid responsivo */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
      
      {/* Card 1: Gestionar Actividades */}
      <Link 
        to="/actividades" 
        className="group bg-gray-800 p-8 rounded-xl hover:bg-gray-700/50 border border-transparent hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-1"
      >
        <h2 className="text-xl md:text-2xl font-bold text-purple-400 group-hover:text-purple-300 transition-colors mb-2">
          Gestionar Actividades
        </h2>
        <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
          Define tus tareas y compromisos. Este es el primer paso para construir tu horario ideal.
        </p>
      </Link>

      {/* Card 2: Generar Horario */}
      <Link 
        to="/calendario" 
        className="group bg-gray-800 p-8 rounded-xl hover:bg-gray-700/50 border border-transparent hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-1"
      >
        <h2 className="text-xl md:text-2xl font-bold text-purple-400 group-hover:text-purple-300 transition-colors mb-2">
          Generar Horario
        </h2>
        <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
          Deja que la IA cree un plan optimizado para ti y visualízalo en un calendario interactivo.
        </p>
      </Link>

    </div>
  </div>
);
};

export default DashboardPage;