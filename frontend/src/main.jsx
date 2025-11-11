// En: frontend/src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import Modal from 'react-modal';
import { ThemeProvider } from './context/ThemeContext'; // <-- 1. IMPORTA EL PROVEEDOR

Modal.setAppElement('#root');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. ENVUELVE TU APP */}
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)