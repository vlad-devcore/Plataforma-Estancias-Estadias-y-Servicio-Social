import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';  // Importar el AuthProvider
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom';  // Importar Router

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>  {/* Colocamos Router aquí */}
      <AuthProvider>  {/* Ahora envolvemos la aplicación con AuthProvider dentro del Router */}
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
