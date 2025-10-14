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

// --- NUEVO ---: Constante para los días de la semana, facilitando la creación de los botones.
const DAYS_OF_WEEK = [
  { label: 'L', value: 1 }, { label: 'M', value: 2 }, { label: 'X', value: 3 },
  { label: 'J', value: 4 }, { label: 'V', value: 5 }, { label: 'S', value: 6 },
  { label: 'D', value: 7 }
];

const ActivitiesPage = () => {
  // --- ESTADOS ---
  const [activities, setActivities] = useState([]);
  const initialActivityState = {
    name: '', duration: 60, priority: 'media', category: '',
    is_recurrent: false,
    recurrent_days: []
  };
  const [newActivity, setNewActivity] = useState(initialActivityState);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(initialActivityState);

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
      // --- NUEVO ---: Preparamos el payload asegurando que recurrent_days sea null si no es recurrente.
      const payload = {
        ...newActivity,
        recurrent_days: newActivity.is_recurrent ? newActivity.recurrent_days : null
      };
      await apiClient.post('/activities/', payload);
      setNewActivity(initialActivityState); // Resetea el formulario al estado inicial completo.
      fetchActivities();
    } catch (error) {
      console.error("Error al añadir actividad:", error);
    }
  };

  const handleSaveEdit = async (activityId) => {
    if (!editData.name.trim() || !editData.category) return;
    try {
      // --- NUEVO ---: Lógica similar al añadir, para asegurar que los datos son consistentes.
      const payload = {
        ...editData,
        recurrent_days: editData.is_recurrent ? editData.recurrent_days : null
      };
      await apiClient.put(`/activities/${activityId}`, payload);
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
  const handleStateChange = (e, updater) => {
    const { name, value, type, checked } = e.target;
    updater(prev => ({
      ...prev,
      // Asigna el valor correcto si es un checkbox o cualquier otro input
      [name]: type === 'checkbox' ? checked : (name === 'duration' ? parseInt(value) : value),
      // Lógica extra: si el checkbox que cambia es 'is_recurrent' y se desactiva,
      // reseteamos los días seleccionados.
      ...((name === 'is_recurrent' && !checked) && { recurrent_days: [] })
    }));
  };

  const handleNewActivityChange = (e) => handleStateChange(e, setNewActivity);
  const handleEditChange = (e) => handleStateChange(e, setEditData);
  
  const handleDayToggle = (dayValue, formType) => {
    const updater = formType === 'new' ? setNewActivity : setEditData;
    updater(prev => {
        const currentDays = prev.recurrent_days || [];
        const newDays = currentDays.includes(dayValue)
            ? currentDays.filter(d => d !== dayValue)
            : [...currentDays, dayValue].sort((a,b) => a - b);
        return { ...prev, recurrent_days: newDays };
    });
  };


  const handleEditClick = (activity) => {
    setEditingId(activity.id);
    setEditData({
      ...initialActivityState,
      ...activity,
      is_recurrent: !!activity.is_recurrent, // Convierte a booleano por si viene null
      recurrent_days: Array.isArray(activity.recurrent_days) ? activity.recurrent_days : [] // Asegura que sea un array
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // --- NUEVO ---: Componente reutilizable para el selector de días, para no repetir código.
  const DaySelector = ({ recurrent, selectedDays, onDayToggle }) => {
    if (!recurrent) return null;
    return (
        <div className="mt-4 sm:col-span-2 lg:col-span-5">
            <label className="block text-sm font-medium text-gray-400 mb-2">Repetir los días:</label>
            <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(day => (
                    <button
                        key={day.value}
                        type="button"
                        onClick={() => onDayToggle(day.value)}
                        className={`btn btn-sm btn-circle transition-colors duration-200 ${
                            selectedDays.includes(day.value)
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                    >
                        {day.label}
                    </button>
                ))}
            </div>
        </div>
    );
  };

  // --- RENDERIZADO DEL COMPONENTE ---
  return (
  <div className="text-white p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
    
    {/* --- FORMULARIO PARA AÑADIR ACTIVIDADES --- */}
    <section className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
      <h2 className="text-2xl font-bold mb-6">Añadir Nueva Actividad</h2>
      <form onSubmit={handleAddActivity} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-start">
        
        {/* --- Campos existentes --- */}
        <div className="sm:col-span-2 lg:col-span-2">
          <label htmlFor="new-name" className="block text-sm font-medium text-gray-400 mb-1">Nombre</label>
          <input id="new-name" name="name" value={newActivity.name} onChange={handleNewActivityChange} required placeholder="Ej: Estudiar para el examen" className="w-full rounded bg-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner" />
        </div>
        <div>
          <label htmlFor="new-duration" className="block text-sm font-medium text-gray-400 mb-1">Duración (min)</label>
          <input id="new-duration" name="duration" value={newActivity.duration} onChange={handleNewActivityChange} required type="number" placeholder="60" className="w-full rounded bg-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner" />
        </div>
        <div>
          <label htmlFor="new-priority" className="block text-sm font-medium text-gray-400 mb-1">Prioridad</label>
          <select id="new-priority" name="priority" value={newActivity.priority} onChange={handleNewActivityChange} className="w-full rounded bg-gray-700 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>
        <div>
          <label htmlFor="new-category" className="block text-sm font-medium text-gray-400 mb-1">Categoría</label>
          <select id="new-category" name="category" value={newActivity.category} onChange={handleNewActivityChange} required className="w-full rounded bg-gray-700 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="" disabled>Seleccionar...</option>
            {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>

        {/* --- MEJORA: SECCIÓN DE RECURRENCIA UNIFICADA --- */}
        {/* --- CAMBIO 1: ESTRUCTURA DEL TOGGLE CORREGIDA --- */}
          <div className="sm:col-span-2 lg:col-span-5 bg-gray-700/50 p-4 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="is_recurrent_toggle_new" className="text-white font-medium cursor-pointer select-none">
                Actividad Recurrente
              </label>
              {/* Se envuelve el input y los divs de estilo en un solo label */}
              <label htmlFor="is_recurrent_toggle_new" className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="is_recurrent_toggle_new"
                  name="is_recurrent"
                  className="sr-only peer"
                  checked={newActivity.is_recurrent}
                  onChange={handleNewActivityChange}
                />
                <div className="w-14 h-7 bg-gray-600 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

          {/* Selector de días condicional con animación */}
          {newActivity.is_recurrent && (
            <div className="pt-4 border-t border-gray-600/70">
              <label className="block text-sm font-medium text-gray-400 mb-3">Repetir los días:</label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleDayToggle(day.value, 'new')}
                    className={`w-10 h-10 rounded-full font-bold text-sm transition-colors duration-200 flex items-center justify-center ${
                      (newActivity.recurrent_days || []).includes(day.value)
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Botón Submit */}
        <div className="sm:col-span-2 lg:col-span-5 pt-2">
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
              // --- FORMULARIO DE EDICIÓN MODIFICADO ---
              <div className="space-y-4">
                <input 
                  type="text" name="name" value={editData.name} onChange={handleEditChange} 
                  className="w-full rounded bg-gray-600 px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 shadow-inner" 
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Duración (min)</label>
                    <input 
                      type="number" name="duration" value={editData.duration} onChange={handleEditChange} 
                      className="w-full rounded bg-gray-600 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-inner" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Prioridad</label>
                    <select name="priority" value={editData.priority} onChange={handleEditChange} className="w-full rounded bg-gray-600 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Categoría</label>
                    <select name="category" value={editData.category} onChange={handleEditChange} required className="w-full rounded bg-gray-600 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="" disabled>Seleccionar...</option>
                      {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* --- MEJORA: SECCIÓN DE RECURRENCIA PARA EDICIÓN --- */}
                <div className="bg-gray-600/50 p-4 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <label htmlFor={`is_recurrent_toggle_edit_${act.id}`} className="text-white font-medium cursor-pointer select-none">
                        Actividad Recurrente
                      </label>
                      <label htmlFor={`is_recurrent_toggle_edit_${act.id}`} className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          id={`is_recurrent_toggle_edit_${act.id}`}
                          name="is_recurrent"
                          className="sr-only peer"
                          checked={editData.is_recurrent}
                          onChange={handleEditChange}
                        />
                        <div className="w-14 h-7 bg-gray-500 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                  {editData.is_recurrent && (
                    <div className="pt-4 border-t border-gray-500/70">
                      <label className="block text-sm font-medium text-gray-400 mb-3">Repetir los días:</label>
                      <div className="flex flex-wrap gap-2">
                        {DAYS_OF_WEEK.map(day => (
                          <button key={day.value} type="button" onClick={() => handleDayToggle(day.value, 'edit')}
                            className={`w-10 h-10 rounded-full font-bold text-sm transition-colors duration-200 flex items-center justify-center ${
                              (editData.recurrent_days || []).includes(day.value) 
                                ? 'bg-green-600 text-white shadow-lg' 
                                : 'bg-gray-500 text-gray-300 hover:bg-gray-400'
                            }`}>
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                  <button onClick={handleCancelEdit} className="w-full sm:w-auto bg-gray-500 hover:bg-gray-400 text-gray-900 font-bold py-2 px-4 rounded-lg transition-colors">Cancelar</button>
                  <button onClick={() => handleSaveEdit(act.id)} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Guardar Cambios</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex-grow">
                  <p className="font-semibold text-lg flex items-center gap-3">
                    {act.name}
                    {act.is_recurrent && (
                      <span className="badge badge-primary badge-outline text-xs">Recurrente</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-400">
                    {act.duration} min | Prioridad: {act.priority} | <span className="font-medium text-gray-300">Categoría: {act.category}</span>
                  </p>
                  {act.is_recurrent && act.recurrent_days && act.recurrent_days.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-400">Días:</span>
                      <div className="flex gap-1.5">
                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((dayLabel, index) => (
                      <span 
                        key={index}
                        className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                          act.recurrent_days.includes(index + 1)
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-600 text-gray-400'
                        }`}
                      >
                        {dayLabel}
                      </span>
                    ))}
                  </div>
                </div>
              )}
                </div>
                <div className="flex gap-4 self-end sm:self-auto">
                  <button onClick={() => handleEditClick(act)} className="text-blue-400 hover:text-blue-200 font-semibold">Editar</button>
                  <button onClick={() => handleDeleteActivity(act.id, act.name)} className="text-red-400 hover:text-red-200 font-semibold">Eliminar</button>
                </div>
              </div>
            )}
          </li>
        )) : (
          <div className="text-center py-10 border-2 border-dashed border-gray-700 rounded-lg">
            <p className="text-gray-400 text-lg">Aún no tienes actividades.</p>
            <p className="text-gray-500 mt-1">¡Añade tu primera tarea para empezar a organizar tu semana!</p>
          </div>
        )}
      </ul>
    </section>

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