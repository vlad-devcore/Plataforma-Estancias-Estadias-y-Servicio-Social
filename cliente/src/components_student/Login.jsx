import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica de autenticación real
    if (email && password) {
      navigate('/home');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <div className="logo-section">
          <img 
            src="/logo192.png"
            alt="UPQROO Logo  " 
            className="university-logo"
          />
        </div>
        
        <div className="login-form-section">
          <div className="login-form-content">
            <h2>Bienvenidos a la Plataforma de Estancias, Estadías y Servicio Social</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Correo Institucional</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                />
                <div className="forgot-password">
                  <a href="/forgot-password">¿Olvidaste tu contraseña?</a>
                </div>
              </div>
              
              <button type="submit" className="login-button">
                Iniciar Sesión
              </button>
            </form>
            
            <div className="register-link">
              <span>¿No tienes cuenta o no puedes ingresar? </span>
              <a href="/register">Obtener Acceso</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;