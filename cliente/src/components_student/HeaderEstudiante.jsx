import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const NavLink = ({ text, path, currentPath, onClick }) => {
  const isActive = currentPath === path;
  return (
    <motion.a
      onClick={onClick}
      className={`relative cursor-pointer px-4 py-2 group transition-all duration-300 text-white/90 hover:text-white`}
    >
      <span className={isActive ? 'text-white font-medium' : ''}>{text}</span>
      {isActive && <motion.div className="absolute inset-0 bg-white/20 rounded-lg" initial={false} animate={{ scale: 1 }} transition={{ duration: 0.2 }} />}
    </motion.a>
  );
};

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
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirmar Cierre de Sesión</h2>
          <p className="text-gray-600 mb-6">¿Estás seguro de que deseas cerrar tu sesión?</p>
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

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const navigation = [
    { text: "Inicio", path: '/home' },
    { text: "Empresas", path: '/empresas' },
    { text: "Perfil", path: '/perfil' },
    { text: "Cerrar Sesión", path: '/login', action: 'logout' }
  ];

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post('http://189.203.249.19:9999/api/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setSuccessMessage('¡Sesión cerrada con éxito!');
      logout();
      setTimeout(() => {
        setSuccessMessage(null);
      }, 1000);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setSuccessMessage('¡Sesión cerrada con éxito!');
      logout();
      setTimeout(() => {
        setSuccessMessage(null);
      }, 1000);
    }
  };

  const handleNavigation = (item) => {
    if (item.action === 'logout') {
      setIsLogoutModalOpen(true); // Abrir modal en lugar de logout directo
    } else {
      navigate(item.path);
      setIsMenuOpen(false);
    }
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    handleLogout();
  };

  const handleCancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16 sm:h-20">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <img src="/logo192.png" alt="Logo" className="h-16 sm:h-20 w-auto" />
        </motion.div>
        <div className="hidden md:flex space-x-2">
          {navigation.map((item) => (
            <NavLink
              key={item.text}
              text={item.text}
              path={item.path}
              currentPath={location.pathname}
              onClick={() => handleNavigation(item)}
            />
          ))}
        </div>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsMenuOpen(true)} className="md:hidden text-white">
          <Menu className="h-6 w-6" />
        </motion.button>
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-y-0 right-0 w-64 bg-orange-600 shadow-xl z-50"
          >
            <div className="flex justify-end p-4">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsMenuOpen(false)} className="text-white">
                <X className="h-6 w-6" />
              </motion.button>
            </div>
            <div className="flex flex-col">
              {navigation.map((item) => (
                <NavLink
                  key={item.text}
                  text={item.text}
                  path={item.path}
                  currentPath={location.pathname}
                  onClick={() => handleNavigation(item)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </nav>
  );
};

export default Header;