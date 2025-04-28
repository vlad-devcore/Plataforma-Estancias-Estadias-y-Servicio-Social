import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  // Limpiar toast después de 3 segundos
  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => setToast({ message: '', type: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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

  const handleRequestReset = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:9999/api/auth/request-password-reset', { email: resetEmail });
      setToast({ message: 'Enlace de recuperación enviado al correo', type: 'success' });
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error) {
      setToast({
        message: error.response?.data?.error || 'Error al enviar el enlace',
        type: 'error'
      });
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
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="forgot-password-link"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
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

      {/* Modal de recuperación */}
      <AnimatePresence>
        {showForgotPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white p-6 rounded-lg max-w-md w-full"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Recuperar Contraseña</h2>
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Correo Institucional
                  </label>
                  <div className="relative">
                    <Mail className="absolute h-5 w-5 text-gray-400 top-3 left-3" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Enviar Enlace
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast.message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-4 right-4 p-3 rounded-lg text-white ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;