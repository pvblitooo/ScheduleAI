import { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';

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

  const handleDeleteActivity = async (activityId) => {
    // Usamos un confirm para seguridad
    if (window.confirm("¿Estás seguro de que quieres eliminar esta actividad?")) {
      try {
        await apiClient.delete(`/activities/${activityId}`);
        fetchActivities();
      } catch (error) {
        console.error("Error al eliminar actividad:", error);
      }
    }
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
    <div className="text-white p-4 sm:p-8">
      {/* --- FORMULARIO PARA AÑADIR ACTIVIDADES --- */}
      <div className="bg-gray-800 p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-bold mb-4">Añadir Nueva Actividad</h2>
        <form onSubmit={handleAddActivity} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <input name="name" value={newActivity.name} onChange={handleNewActivityChange} required placeholder="Nombre de la actividad" className="md:col-span-2 rounded bg-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          <input name="duration" value={newActivity.duration} onChange={handleNewActivityChange} required type="number" placeholder="Duración (min)" className="rounded bg-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          <select name="priority" value={newActivity.priority} onChange={handleNewActivityChange} className="rounded bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
          {/* --- ¡NUEVO SELECT DE CATEGORÍA! --- */}
          <select name="category" value={newActivity.category} onChange={handleNewActivityChange} required className="rounded bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="" disabled>Categoría</option>
            {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <button type="submit" className="md:col-span-5 rounded bg-purple-600 px-6 py-2 font-bold text-white hover:bg-purple-700 transition-colors">Añadir Actividad</button>
        </form>
      </div>

      {/* --- LISTA DE ACTIVIDADES EXISTENTES --- */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Tus Actividades</h2>
        <ul className="space-y-4">
          {activities.length > 0 ? activities.map(act => (
            <li key={act.id} className="bg-gray-700 p-4 rounded-lg">
              {editingId === act.id ? (
                // --- FORMULARIO DE EDICIÓN ---
                <div className="space-y-4">
                  <input type="text" name="name" value={editData.name} onChange={handleEditChange} className="bg-gray-600 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input type="number" name="duration" value={editData.duration} onChange={handleEditChange} className="bg-gray-600 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <select name="priority" value={editData.priority} onChange={handleEditChange} className="bg-gray-600 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>
                    {/* --- ¡NUEVO SELECT DE CATEGORÍA EN EDICIÓN! --- */}
                    <select name="category" value={editData.category} onChange={handleEditChange} required className="bg-gray-600 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="" disabled>Categoría</option>
                      {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div className="flex justify-end gap-4">
                    <button onClick={() => handleSaveEdit(act.id)} className="bg-green-600 hover:bg-green-700 font-bold py-2 px-4 rounded transition-colors">Guardar</button>
                    <button onClick={handleCancelEdit} className="bg-gray-600 hover:bg-gray-500 py-2 px-4 rounded transition-colors">Cancelar</button>
                  </div>
                </div>
              ) : (
                // --- VISTA DE ACTIVIDAD ---
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-lg">{act.name}</p>
                    <p className="text-sm text-gray-400">
                      {act.duration} min | Prioridad: {act.priority} | <span className="font-medium text-gray-300">Categoría: {act.category}</span> {/* <-- Categoría visible */}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => handleEditClick(act)} className="text-blue-400 hover:text-blue-200 font-semibold">Editar</button>
                    <button onClick={() => handleDeleteActivity(act.id)} className="text-red-400 hover:text-red-200 font-semibold">Eliminar</button>
                  </div>
                </div>
              )}
            </li>
          )) : (
            <p className="text-gray-400">No tienes actividades. Añade una para empezar.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ActivitiesPage;