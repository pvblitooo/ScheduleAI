import React, { createContext, useState, useEffect, useContext } from 'react';

// Esta función determina el tema inicial
const getInitialTheme = () => {
  // 1. Revisa si el usuario ya guardó una preferencia en localStorage
  if (typeof window !== 'undefined') {
    const storedTheme = window.localStorage.getItem('theme');
    if (storedTheme) {
      return storedTheme;
    }
  
    // 2. Si no, revisa la preferencia de su sistema operativo
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
  
  // 3. Valor por defecto si todo falla
  return 'light';
};

// 1. Creamos el contexto
const ThemeContext = createContext();

// 2. Creamos el "Proveedor" (el componente que envolverá tu app)
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  // 3. Este efecto aplica el tema al HTML y lo guarda en localStorage
  useEffect(() => {
    const root = window.document.documentElement; // El tag <html>
    
    // Añade o quita la clase 'dark' del <html>
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Guarda la preferencia para la próxima visita
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  // 4. La función para cambiar el tema
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // 5. Compartimos el estado y la función con toda la app
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 6. Un "hook" personalizado para usar el contexto fácilmente
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};