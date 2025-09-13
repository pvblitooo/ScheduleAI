import { useState, useEffect } from 'react';

// Hook personalizado para sincronizar un estado con el localStorage
function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const storedValue = localStorage.getItem(key);
      // Si hay algo guardado, lo usa. Si no, usa el valor por defecto.
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
      console.error(`Error al leer del localStorage: ${key}`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      // Cada vez que el estado 'value' cambia, lo guarda en localStorage
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error al guardar en localStorage: ${key}`, error);
    }
  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorage;