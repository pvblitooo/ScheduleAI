import { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';

import ActionModal from '../components/ActionModal';

// --- CONSTANTES ---
// Definimos las categorías y prioridades en un solo lugar para fácil mantenimiento.
const CATEGORIES = [
  { id: 'estudio', name: 'Estudio' },
  { id: 'trabajo', name: 'Trabajo' },
  { id: 'ejercicio', name: 'Ejercicio' },
  { id: 'ocio', name: 'Ocio/Descanso' },
  { id: 'personal', name: 'Personal/Trámites' },
  { id: 'familia', name: 'Familia/Social' },
];

const ActivitiesPage = () => {
  // --- ESTADOS ---
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState({ name: '', duration: 60, priority: 'media', category: '' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', duration: 0, priority: 'media', category: '' });

  // --- EFECTOS ---
  useEffect(() => {
    fetchActivities();
  }, []);

  const [actionModal, setActionModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  // --- MANEJADORES DE API ---
  const fetchActivities = async () => {
    try {
      const response = await apiClient.get('/activities/');
      setActivities(response.data);
    } catch (error) {
      console.error("Error al cargar actividades:", error);
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!newActivity.name.trim() || !newActivity.category) return;
    try {
      // El backend ahora espera 'frequency', lo añadimos si no existe.
      await apiClient.post('/activities/', { ...newActivity, frequency: newActivity.frequency || 'única' });
      setNewActivity({ name: '', duration: 60, priority: 'media', category: '' });
      fetchActivities();
    } catch (error) {
      console.error("Error al añadir actividad:", error);
    }
  };

  const handleSaveEdit = async (activityId) => {
    if (!editData.name.trim() || !editData.category) return;
    try {
      await apiClient.put(`/activities/${activityId}`, editData);
      setEditingId(null);
      fetchActivities();
    } catch (error) {
      console.error("Error al actualizar la actividad:", error);
    }
  };

  const handleDeleteActivity = (activityId, activityName) => {
    setActionModal({
      isOpen: true,
      title: 'Confirmar Eliminación',
      message: `¿Estás seguro de que quieres eliminar la actividad "${activityName}"?`,
      onConfirm: async () => {
        try {
          await apiClient.delete(`/activities/${activityId}`);
          fetchActivities();
          setActionModal({ isOpen: false, title: '', message: '' }); // Cierra el modal al éxito
        } catch (error) {
          console.error("Error al eliminar actividad:", error);
          // Opcional: mostrar un modal de error si falla
          setActionModal({
            isOpen: true,
            title: 'Error',
            message: 'No se pudo eliminar la actividad.',
            onConfirm: null
          });
        }
      },
    });
  };

  // --- MANEJADORES DE ESTADO LOCAL ---
  const handleNewActivityChange = (e) => {
    const { name, value } = e.target;
    setNewActivity(prev => ({ ...prev, [name]: name === 'duration' ? parseInt(value) : value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: name === 'duration' ? parseInt(value) : value }));
  };

  const handleEditClick = (activity) => {
    setEditingId(activity.id);
    setEditData({ name: activity.name, duration: activity.duration, priority: activity.priority, category: activity.category });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // --- RENDERIZADO DEL COMPONENTE ---
  return (
  <div className="text-white p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
    
    {/* --- FORMULARIO PARA AÑADIR ACTIVIDADES --- */}
    <section className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
      <h2 className="text-2xl font-bold mb-6">Añadir Nueva Actividad</h2>
      <form onSubmit={handleAddActivity} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-start">
        
        {/* Campo Nombre */}
        <div className="sm:col-span-2 lg:col-span-2">
          <label htmlFor="new-name" className="block text-sm font-medium text-gray-400 mb-1">Nombre</label>
          <input id="new-name" name="name" value={newActivity.name} onChange={handleNewActivityChange} required placeholder="Ej: Estudiar para el examen" className="w-full rounded bg-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner" />
        </div>

        {/* Campo Duración */}
        <div>
          <label htmlFor="new-duration" className="block text-sm font-medium text-gray-400 mb-1">Duración (min)</label>
          <input id="new-duration" name="duration" value={newActivity.duration} onChange={handleNewActivityChange} required type="number" placeholder="60" className="w-full rounded bg-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner" />
        </div>

        {/* Campo Prioridad */}
        <div>
          <label htmlFor="new-priority" className="block text-sm font-medium text-gray-400 mb-1">Prioridad</label>
          <select id="new-priority" name="priority" value={newActivity.priority} onChange={handleNewActivityChange} className="w-full rounded bg-gray-700 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>

        {/* Campo Categoría */}
        <div>
          <label htmlFor="new-category" className="block text-sm font-medium text-gray-400 mb-1">Categoría</label>
          <select id="new-category" name="category" value={newActivity.category} onChange={handleNewActivityChange} required className="w-full rounded bg-gray-700 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="" disabled>Seleccionar...</option>
            {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>

        {/* Botón Submit */}
        <div className="sm:col-span-2 lg:col-span-5 pt-5 sm:pt-0">
          <button type="submit" className="w-full rounded-lg bg-purple-600 px-6 py-3 font-bold text-white hover:bg-purple-700 transition-colors">Añadir Actividad</button>
        </div>
      </form>
    </section>

    {/* --- LISTA DE ACTIVIDADES EXISTENTES --- */}
    <section className="bg-gray-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Tus Actividades</h2>
      <ul className="space-y-4">
        {activities.length > 0 ? activities.map(act => (
          <li key={act.id} className="bg-gray-700 p-4 rounded-lg transition-all duration-300">
            {editingId === act.id ? (
              // --- FORMULARIO DE EDICIÓN RESPONSIVO (LA PIEZA NUEVA) ---
              <div className="space-y-4">
                {/* Input principal para el nombre */}
                <div>
                  <label htmlFor={`edit-name-${act.id}`} className="sr-only">Nombre de la actividad</label>
                  <input 
                    id={`edit-name-${act.id}`}
                    type="text" 
                    name="name" 
                    value={editData.name} 
                    onChange={handleEditChange} 
                    className="w-full rounded bg-gray-600 px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 shadow-inner" 
                  />
                </div>
                
                {/* Grid para los campos secundarios */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor={`edit-duration-${act.id}`} className="block text-xs font-medium text-gray-400 mb-1">Duración (min)</label>
                    <input 
                      id={`edit-duration-${act.id}`}
                      type="number" name="duration" value={editData.duration} onChange={handleEditChange} 
                      className="w-full rounded bg-gray-600 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-inner" 
                    />
                  </div>
                  <div>
                    <label htmlFor={`edit-priority-${act.id}`} className="block text-xs font-medium text-gray-400 mb-1">Prioridad</label>
                    <select 
                      id={`edit-priority-${act.id}`}
                      name="priority" value={editData.priority} onChange={handleEditChange} 
                      className="w-full rounded bg-gray-600 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor={`edit-category-${act.id}`} className="block text-xs font-medium text-gray-400 mb-1">Categoría</label>
                    <select 
                      id={`edit-category-${act.id}`}
                      name="category" value={editData.category} onChange={handleEditChange} required 
                      className="w-full rounded bg-gray-600 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="" disabled>Seleccionar...</option>
                      {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Botones de acción responsivos */}
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                  <button 
                    onClick={handleCancelEdit} 
                    className="w-full sm:w-auto bg-gray-500 hover:bg-gray-400 text-gray-900 font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => handleSaveEdit(act.id)} 
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            ) : (
              // --- VISTA DE ACTIVIDAD (AHORA RESPONSIVA) ---
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex-grow">
                  <p className="font-semibold text-lg">{act.name}</p>
                  <p className="text-sm text-gray-400">
                    {act.duration} min | Prioridad: {act.priority} | <span className="font-medium text-gray-300">Categoría: {act.category}</span>
                  </p>
                </div>
                <div className="flex gap-4 self-end sm:self-auto">
                  <button onClick={() => handleEditClick(act)} className="text-blue-400 hover:text-blue-200 font-semibold">Editar</button>
                  <button onClick={() => handleDeleteActivity(act.id, act.name)} className="text-red-400 hover:text-red-200 font-semibold">Eliminar</button>
                </div>
              </div>
            )}
          </li>
        )) : (
          // --- ESTADO VACÍO MEJORADO ---
          <div className="text-center py-10 border-2 border-dashed border-gray-700 rounded-lg">
            <p className="text-gray-400 text-lg">Aún no tienes actividades.</p>
            <p className="text-gray-500 mt-1">¡Añade tu primera tarea para empezar a organizar tu semana!</p>
          </div>
        )}
      </ul>
    </section>

    {/* --- MODAL DE ACCIÓN --- */}
    <ActionModal
      isOpen={actionModal.isOpen}
      onRequestClose={() => setActionModal({ ...actionModal, isOpen: false })}
      title={actionModal.title}
      message={actionModal.message}
      onConfirm={actionModal.onConfirm}
      showConfirmButton={!!actionModal.onConfirm}
    />
  </div>
);
};

export default ActivitiesPage;