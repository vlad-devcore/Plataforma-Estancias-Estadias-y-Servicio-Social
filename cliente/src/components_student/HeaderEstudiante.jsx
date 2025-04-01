// Header Component
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

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

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { text: "Inicio", path: '/home' },
    { text: "Empresas", path: '/empresas' },
    { text: "Perfil", path: '/perfil' },
    { text: "Cerrar Sesión", path: '/' }
  ];

  return (
    <nav className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16 sm:h-20">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <img src="/logo192.png" alt="Logo" className="h-16 sm:h-20 w-auto" />
        </motion.div>
        <div className="hidden md:flex space-x-2">
          {navigation.map((item) => (
            <NavLink key={item.text} text={item.text} path={item.path} currentPath={location.pathname} onClick={() => navigate(item.path)} />
          ))}
        </div>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsMenuOpen(true)} className="md:hidden text-white">
          <Menu className="h-6 w-6" />
        </motion.button>
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }} transition={{ type: "tween", duration: 0.3 }} className="fixed inset-y-0 right-0 w-64 bg-orange-600 shadow-xl z-50">
            <div className="flex justify-end p-4">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsMenuOpen(false)} className="text-white">
                <X className="h-6 w-6" />
              </motion.button>
            </div>
            <div className="flex flex-col">
              {navigation.map((item) => (
                <NavLink key={item.text} text={item.text} path={item.path} currentPath={location.pathname} onClick={() => { navigate(item.path); setIsMenuOpen(false); }} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Header;
