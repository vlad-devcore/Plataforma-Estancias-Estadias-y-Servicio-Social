import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importa el contexto de autenticación
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth(); // Usa el contexto de autenticación
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    
    

    const response = await login(email, password);

    if (response.success) {
      // Redirección basada en el rol
      switch (response.user.role) {
        case 'administrador':
          navigate('/inicioadmin');
          break;
        case 'estudiante':
          navigate('/home');
          break;
        case 'asesor_academico':
        case 'asesor_empresarial':
          navigate('/perfil'); // Ajusta según la vista correcta
          break;
        default:
          setError('Rol no reconocido');
      }
    } else {
      setError(response.error);
    }
  };

  

  return (
    <div className="login-container">
      <div className="login-form-container">
        <div className="logo-section">
          <img src="/logo192.png" alt="UPQROO Logo" className="university-logo" />
        </div>
        <div className="login-form-section">
          <div className="login-form-content">
            <h2>Bienvenidos a la Plataforma de Estancias, Estadías y Servicio Social</h2>
            
            {error && <p className="error-message">{error}</p>} {/* Muestra el error si existe */}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Correo Institucional</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  required
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
