import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';
import '../components_student/Login.css'; // Asegúrate de que la ruta sea correcta
 

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const token = searchParams.get('token');

  // Validar token al cargar
  useEffect(() => {
    if (!token) {
      setToast({ message: 'Token inválido', type: 'error' });
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [token, navigate]);

  // Limpiar toast después de 3 segundos
  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => setToast({ message: '', type: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setToast({ message: 'La contraseña debe tener al menos 8 caracteres', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setToast({ message: 'Las contraseñas no coinciden', type: 'error' });
      return;
    }
    try {
      await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/api/auth/reset-password`, { token, newPassword });
      setToast({ message: 'Contraseña restablecida correctamente', type: 'success' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setToast({
        message: error.response?.data?.error || 'Error al restablecer la contraseña',
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
            <h2>Restablecer Contraseña</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nueva Contraseña</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
              </div>
              <div className="form-group">
                <label>Confirmar Contraseña</label>
                <div className="password-input-container">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    required
                  />
                  <span
                    className="password-toggle-icon"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="login-button"
              >
                Restablecer Contraseña
              </motion.button>
            </form>

            <div className="register-link">
              <span>Volver a </span>
              <a href="/login">Iniciar Sesión</a>
            </div>
          </div>
        </div>
      </div>

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

export default ResetPassword;