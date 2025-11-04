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
  <div className="text-white p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
    
    {/* --- FORMULARIO PARA AÑADIR ACTIVIDADES --- */}
    <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
        Añadir Nueva Actividad
      </h2>
      <form onSubmit={handleAddActivity} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
        
        <div className="sm:col-span-2 lg:col-span-2">
          <label htmlFor="new-name" className="block text-sm font-medium text-slate-300 mb-1.5">Nombre</label>
          <input 
            id="new-name" 
            name="name" 
            value={newActivity.name} 
            onChange={handleNewActivityChange} 
            required 
            placeholder="Ej: Estudiar para el examen" 
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
          />
        </div>

        <div>
          <label htmlFor="new-duration" className="block text-sm font-medium text-slate-300 mb-1.5">Duración (min)</label>
          <input 
            id="new-duration" 
            name="duration" 
            value={newActivity.duration} 
            onChange={handleNewActivityChange} 
            required 
            type="number" 
            placeholder="60" 
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
          />
        </div>

        <div>
          <label htmlFor="new-priority" className="block text-sm font-medium text-slate-300 mb-1.5">Prioridad</label>
          <select 
            id="new-priority" 
            name="priority" 
            value={newActivity.priority} 
            onChange={handleNewActivityChange} 
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>

        <div>
          <label htmlFor="new-category" className="block text-sm font-medium text-slate-300 mb-1.5">Categoría</label>
          <select 
            id="new-category" 
            name="category" 
            value={newActivity.category} 
            onChange={handleNewActivityChange} 
            required 
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            <option value="" disabled>Seleccionar...</option>
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sección de Recurrencia */}
        <div className="sm:col-span-2 lg:col-span-5 bg-slate-800/50 border border-slate-700/50 p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="is_recurrent_toggle_new" className="text-white font-medium cursor-pointer select-none flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actividad Recurrente
            </label>
            <label htmlFor="is_recurrent_toggle_new" className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="is_recurrent_toggle_new"
                name="is_recurrent"
                className="sr-only peer"
                checked={newActivity.is_recurrent}
                onChange={handleNewActivityChange}
              />
              <div className="w-14 h-7 bg-slate-700 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {newActivity.is_recurrent && (
            <div className="pt-4 border-t border-slate-700/50">
              <label className="block text-sm font-medium text-slate-300 mb-3">Repetir los días:</label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleDayToggle(day.value, 'new')}
                    className={`w-10 h-10 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center ${
                      (newActivity.recurrent_days || []).includes(day.value)
                        ? 'bg-purple-600 text-white shadow-lg scale-105 border-2 border-purple-400'
                        : 'bg-slate-700 border-2 border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-slate-500'
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
          <button 
            type="submit" 
            className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 px-6 py-3 font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-purple-500/50 hover:scale-[1.02]"
          >
            Añadir Actividad
          </button>
        </div>
      </form>
    </section>

    {/* --- LISTA DE ACTIVIDADES EXISTENTES --- */}
    <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
        Tus Actividades
      </h2>
      <ul className="space-y-3">
        {activities.length > 0 ? activities.map(act => (
          <li key={act.id} className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-xl transition-all duration-300 hover:border-purple-500/30">
            {editingId === act.id ? (
              <div className="space-y-4">
                <input 
                  type="text" 
                  name="name" 
                  value={editData.name} 
                  onChange={handleEditChange} 
                  className="w-full rounded-lg bg-slate-700 border border-slate-600 px-4 py-3 text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Duración (min)</label>
                    <input 
                      type="number" 
                      name="duration" 
                      value={editData.duration} 
                      onChange={handleEditChange} 
                      className="w-full rounded-lg bg-slate-700 border border-slate-600 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Prioridad</label>
                    <select 
                      name="priority" 
                      value={editData.priority} 
                      onChange={handleEditChange} 
                      className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    >
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Categoría</label>
                    <select 
                      name="category" 
                      value={editData.category} 
                      onChange={handleEditChange} 
                      required 
                      className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    >
                      <option value="" disabled>Seleccionar...</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-slate-700/50 border border-slate-600/50 p-4 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <label htmlFor={`is_recurrent_toggle_edit_${act.id}`} className="text-white font-medium cursor-pointer select-none flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
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
                      <div className="w-14 h-7 bg-slate-600 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-500/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  {editData.is_recurrent && (
                    <div className="pt-4 border-t border-slate-600/50">
                      <label className="block text-sm font-medium text-slate-300 mb-3">Repetir los días:</label>
                      <div className="flex flex-wrap gap-2">
                        {DAYS_OF_WEEK.map(day => (
                          <button 
                            key={day.value} 
                            type="button" 
                            onClick={() => handleDayToggle(day.value, 'edit')}
                            className={`w-10 h-10 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center ${
                              (editData.recurrent_days || []).includes(day.value) 
                                ? 'bg-green-600 text-white shadow-lg scale-105 border-2 border-green-400' 
                                : 'bg-slate-600 border-2 border-slate-500 text-slate-300 hover:bg-slate-500 hover:border-slate-400'
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                  <button 
                    onClick={handleCancelEdit} 
                    className="w-full sm:w-auto bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white font-semibold py-2.5 px-5 rounded-lg transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => handleSaveEdit(act.id)} 
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white font-semibold py-2.5 px-5 rounded-lg transition-all shadow-lg hover:shadow-green-500/50"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-grow space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-semibold text-lg text-white">{act.name}</p>
                    {act.is_recurrent && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold rounded-lg">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Recurrente
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {act.duration} min
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      act.priority === 'alta' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                      act.priority === 'media' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                      'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {act.priority === 'alta' ? '🔴 Alta' : act.priority === 'media' ? '🟡 Media' : '🔵 Baja'}
                    </span>
                    <span className="text-slate-300 font-medium">
                      {CATEGORIES.find(c => c.id === act.category)?.icon} {CATEGORIES.find(c => c.id === act.category)?.name}
                    </span>
                  </div>

                  {act.is_recurrent && act.recurrent_days && act.recurrent_days.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs font-semibold text-slate-400">Días:</span>
                      <div className="flex gap-1">
                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((dayLabel, index) => (
                          <span 
                            key={index}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                              act.recurrent_days.includes(index + 1)
                                ? 'bg-purple-600 text-white border-2 border-purple-400'
                                : 'bg-slate-700 text-slate-500 border border-slate-600'
                            }`}
                          >
                            {dayLabel}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 self-end sm:self-start">
                  <button 
                    onClick={() => handleEditClick(act)} 
                    className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-semibold text-sm transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDeleteActivity(act.id, act.name)} 
                    className="flex items-center gap-1.5 text-red-400 hover:text-red-300 font-semibold text-sm transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </li>
        )) : (
          <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/30">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-slate-400 text-lg font-medium">Aún no tienes actividades</p>
            <p className="text-slate-500 mt-2">¡Añade tu primera tarea para empezar a organizar tu semana!</p>
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