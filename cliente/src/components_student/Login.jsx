import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Mail, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import CreditsModal from '../components/CreditsModal';
import './Login.css';
 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorResetModal, setShowErrorResetModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [errorResetMessage, setErrorResetMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await login(email, password);

    if (!response || !response.success || !response.user) {
      setErrorMessage(response?.error || 'Error al iniciar sesión');
      setShowErrorModal(true);
      return;
    }

    const { id, role } = response.user;

    if (!role) {
      setErrorMessage('No se pudo determinar el rol del usuario');
      setShowErrorModal(true);
      return;
    }

    // ===== ESTUDIANTE =====
    if (role === 'estudiante') {
      try {
        const { data: estudiante } = await axios.get(
          `${process.env.REACT_APP_API_ENDPOINT}/api/estudiantes/by-user/${id}`
        );

        if (estudiante?.id_programa) {
          localStorage.setItem(
            'user',
            JSON.stringify({ ...response.user, id_programa: estudiante.id_programa })
          );
          navigate('/home');
        } else {
          navigate('/estudiante/programa');
        }
      } catch (err) {
        setErrorMessage('Error al verificar el programa educativo');
        setShowErrorModal(true);
      }
      return;
    }

    // ===== OTROS ROLES =====
    switch (role) {
      case 'administrador':
        navigate('/inicioadmin');
        break;

      case 'asesor_academico':
      case 'asesor_empresarial':
        navigate('/perfil');
        break;

      default:
        setErrorMessage('Rol no reconocido');
        setShowErrorModal(true);
    }

  } catch (error) {
    setErrorMessage('Error inesperado al iniciar sesión');
    setShowErrorModal(true);
  }
};


  const handleRequestReset = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/api/auth/request-password-reset`, { email: resetEmail });
      setShowForgotPassword(false);
      setResetEmail('');
      setShowSuccessModal(true);
    } catch (error) {
      setErrorResetMessage(error.response?.data?.error || 'Error al enviar el enlace');
      setShowErrorResetModal(true);
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
                    disabled={email === ''}
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
              <button
                type="button"
                onClick={() => setShowAccessModal(true)}
                className="text-orange-600 hover:underline"
              >
                Obtener Acceso
              </button>
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

      {/* Modal de acceso */}
      <AnimatePresence>
        {showAccessModal && (
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
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <UserPlus className="h-5 w-5 mr-2 text-orange-600" />
                Obtener Acceso
              </h2>
              <p className="text-gray-700 mb-6">
                Por favor, contacta al departamento de Gestion Empresarial.
              </p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAccessModal(false)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de error de login */}
      <AnimatePresence>
        {showErrorModal && (
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
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                Error de Inicio de Sesión
              </h2>
              <p className="text-gray-700 mb-6">{errorMessage}</p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowErrorModal(false)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de éxito de recuperación */}
      <AnimatePresence>
        {showSuccessModal && (
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
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                Enlace Enviado
              </h2>
              <p className="text-gray-700 mb-6">
                Enlace de recuperación enviado al correo.
              </p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de error de recuperación */}
      <AnimatePresence>
        {showErrorResetModal && (
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
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                Error en Recuperación
              </h2>
              <p className="text-gray-700 mb-6">{errorResetMessage}</p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowErrorResetModal(false)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de créditos */}
      <CreditsModal />
    </div>
  );
};

export default Login;