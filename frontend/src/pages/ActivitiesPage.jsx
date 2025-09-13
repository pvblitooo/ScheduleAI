import { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';

const ActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState({ name: '', duration: 60, priority: 'media' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', duration: 0, priority: 'media' });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await apiClient.get('/activities/');
      setActivities(response.data);
    } catch (error) {
      console.error("Error al cargar actividades:", error);
    }
  };

  const handleNewActivityChange = (e) => {
    const { name, value } = e.target;
    setNewActivity(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!newActivity.name.trim()) return;
    try {
      await apiClient.post('/activities/', { ...newActivity, frequency: 'única' });
      setNewActivity({ name: '', duration: 60, priority: 'media' });
      fetchActivities();
    } catch (error) {
      console.error("Error al añadir actividad:", error);
    }
  };

  const handleSaveEdit = async (activityId) => {
    try {
      await apiClient.put(`/activities/${activityId}`, editData);
      setEditingId(null);
      fetchActivities();
    } catch (error) {
      console.error("Error al actualizar la actividad:", error);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      await apiClient.delete(`/activities/${activityId}`);
      fetchActivities();
    } catch (error) {
      console.error("Error al eliminar actividad:", error);
    }
  };

  const handleEditClick = (activity) => {
    setEditingId(activity.id);
    setEditData({ name: activity.name, duration: activity.duration, priority: activity.priority });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="text-white">
      <div className="bg-gray-800 p-6 rounded-lg mb-8">
        <h2 className="text-xl mb-4">Añadir Nueva Actividad</h2>
        <form onSubmit={handleAddActivity} className="flex flex-wrap items-end gap-4">
          <input name="name" value={newActivity.name} onChange={handleNewActivityChange} required placeholder="Nombre de la actividad" className="flex-grow rounded bg-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input name="duration" value={newActivity.duration} onChange={handleNewActivityChange} required type="number" placeholder="Duración (min)" className="w-32 rounded bg-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <select name="priority" value={newActivity.priority} onChange={handleNewActivityChange} className="w-32 rounded bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
          <button type="submit" className="rounded bg-blue-500 px-6 py-2 font-bold text-white hover:bg-blue-600">Añadir</button>
        </form>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl mb-4">Tus Actividades</h2>
        <ul className="space-y-3">
          {activities.length > 0 ? activities.map(act => (
            <li key={act.id} className="bg-gray-700 p-4 rounded-md">
              {editingId === act.id ? (
                <div className="space-y-3">
                  <input type="text" name="name" value={editData.name} onChange={handleEditChange} className="bg-gray-600 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <div className="flex items-center gap-2">
                    <input type="number" name="duration" value={editData.duration} onChange={handleEditChange} className="bg-gray-600 rounded p-2 w-28 focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <select name="priority" value={editData.priority} onChange={handleEditChange} className="bg-gray-600 rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>
                    <button onClick={() => handleSaveEdit(act.id)} className="bg-green-500 hover:bg-green-600 font-bold py-2 px-4 rounded ml-auto">Guardar</button>
                    <button onClick={handleCancelEdit} className="bg-gray-500 hover:bg-gray-600 py-2 px-4 rounded">Cancelar</button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{act.name}</p>
                    <p className="text-sm text-gray-400">{act.duration} min - Prioridad: {act.priority}</p>
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