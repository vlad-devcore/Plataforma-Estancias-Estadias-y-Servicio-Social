import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Key, Eye, EyeOff } from 'lucide-react';
import Sidebar from './Sidebar';

// Toast Component
const Toast = ({ message, type, onClose }) => (
  <AnimatePresence>
    {message && (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg flex items-center ${
          type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}
      >
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
          ×
        </button>
      </motion.div>
    )}
  </AnimatePresence>
);

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onConfirm, onCancel }) => (
  <AnimatePresence>
    {isOpen && (
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
          className="bg-white rounded-lg p-6 max-w-md w-full"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirmar Cambio de Contraseña</h2>
          <p className="text-gray-600 mb-6">¿Estás seguro de que deseas cambiar tu contraseña?</p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Confirmar
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// FormInput Component
const FormInput = ({ icon: Icon, label, type = "text", value, onChange, options = [], readOnly = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <label className="block text-gray-700 text-sm font-semibold mb-2">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        {type === "select" ? (
          <select
            value={value}
            onChange={onChange}
            disabled={readOnly}
            className={`form-select block w-full pl-10 pr-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
              readOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
            }`}
          >
            {options.map(option => (
              <option key={option} value={option.toLowerCase()}>{option}</option>
            ))}
          </select>
        ) : (
          <div className="relative">
            <input
              type={inputType}
              value={value}
              onChange={onChange}
              readOnly={readOnly}
              className={`block w-full pl-10 pr-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                readOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
              }`}
            />
            {type === "password" && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Profile Component
export default function Profile() {
  const { user, loading, changePassword } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    antiguaContrasena: '',
    nuevaContrasena: '',
  });
  const [toast, setToast] = useState({ message: '', type: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      setFormData({
        antiguaContrasena: '',
        nuevaContrasena: '',
      });
    }
  }, [user]);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const validateForm = () => {
    if (!formData.antiguaContrasena || !formData.nuevaContrasena) {
      setToast({ message: 'Ambas contraseñas son obligatorias', type: 'error' });
      return false;
    }
    if (formData.nuevaContrasena.length < 8) {
      setToast({ message: 'La nueva contraseña debe tener al menos 8 caracteres', type: 'error' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setToast({ message: '', type: '' });
    setIsModalOpen(true); // Abrir modal
  };

  const handleConfirm = async () => {
    setIsModalOpen(false);
    const passwordResult = await changePassword(formData.antiguaContrasena, formData.nuevaContrasena);
    if (!passwordResult.success) {
      setToast({ message: passwordResult.error, type: 'error' });
      return;
    }
    setFormData({
      antiguaContrasena: '',
      nuevaContrasena: '',
    });
    setToast({ message: 'Contraseña cambiada correctamente', type: 'success' });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-gray-600 text-lg animate-pulse">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 p-8"
          >
            <h1 className="text-2xl font-semibold text-gray-800 mb-8">Perfil de Administrador</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  icon={User}
                  label="Nombre"
                  value={user.nombre || ''}
                  readOnly={true}
                />
                <FormInput
                  icon={User}
                  label="Apellido Paterno"
                  value={user.apellido_paterno || ''}
                  readOnly={true}
                />
                <FormInput
                  icon={User}
                  label="Apellido Materno"
                  value={user.apellido_materno || ''}
                  readOnly={true}
                />
                <FormInput
                  icon={Mail}
                  label="Email"
                  type="email"
                  value={user.email || ''}
                  readOnly={true}
                />
                <FormInput
                  icon={User}
                  label="Género"
                  type="select"
                  value={user.genero || ''}
                  options={['Masculino', 'Femenino', 'Otro']}
                  readOnly={true}
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="border-t border-gray-200 pt-6 mt-8"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Cambiar Contraseña</h2>
                <div className="space-y-4">
                  <FormInput
                    icon={Key}
                    label="Contraseña Actual"
                    type="password"
                    value={formData.antiguaContrasena}
                    onChange={handleChange('antiguaContrasena')}
                  />
                  <FormInput
                    icon={Key}
                    label="Nueva Contraseña"
                    type="password"
                    value={formData.nuevaContrasena}
                    onChange={handleChange('nuevaContrasena')}
                  />
                </div>
              </motion.div>

              <motion.div
                className="flex justify-end mt-8"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  type="submit"
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg shadow hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                  Cambiar Contraseña
                </button>
              </motion.div>
            </form>
          </motion.div>
        </div>
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: '' })}
        />
        <ConfirmationModal
          isOpen={isModalOpen}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}