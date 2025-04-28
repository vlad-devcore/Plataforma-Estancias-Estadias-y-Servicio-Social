import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './Login.css';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const response = await login(email, password);

    if (response.success) {
      if (response.user.role === 'estudiante') {
        try {
          const { data: estudiante } = await axios.get(
            `http://localhost:9999/api/estudiantes/by-user/${response.user.id}`
          );
          if (estudiante.id_programa) {
            localStorage.setItem(
              'user',
              JSON.stringify({ ...response.user, id_programa: estudiante.id_programa })
            );
            navigate('/home');
          } else {
            navigate('/estudiante/programa');
          }
        } catch (err) {
          setError('Error al verificar el programa educativo.');
        }
      } else {
        switch (response.user.role) {
          case 'administrador':
            navigate('/inicioadmin');
            break;
          case 'asesor_academico':
          case 'asesor_empresarial':
            navigate('/perfil');
            break;
          default:
            setError('Rol no reconocido');
        }
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

            {error && <p className="error-message">{error}</p>}

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
                <div className="password-input-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    required
                  />
                  <span
                    className="password-toggle-icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </span>
                </div>
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