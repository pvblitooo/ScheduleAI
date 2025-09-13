import { Link } from 'react-router-dom';

const DashboardPage = () => {
  return (
    <div className="text-white">
      <h1 className="text-4xl font-bold mb-6">Bienvenido a ScheduleAI</h1>
      <p className="text-lg text-gray-300 mb-8">Tu asistente inteligente para la organización de horarios. ¿Qué te gustaría hacer hoy?</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card para ir a Actividades */}
        <Link to="/actividades" className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors shadow-lg">
          <h2 className="text-2xl font-semibold text-purple-400 mb-2">Gestionar Actividades</h2>
          <p className="text-gray-400">Añade, edita o elimina las tareas y compromisos que formarán parte de tu horario.</p>
        </Link>

        {/* Card para ir al Calendario */}
        <Link to="/calendario" className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors shadow-lg">
          <h2 className="text-2xl font-semibold text-purple-400 mb-2">Generar Horario</h2>
          <p className="text-gray-400">Usa el poder de la IA para crear un horario optimizado y visualízalo en el calendario.</p>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;