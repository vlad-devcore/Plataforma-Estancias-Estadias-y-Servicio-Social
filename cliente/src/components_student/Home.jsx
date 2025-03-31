import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { DocumentTextIcon, VideoCameraIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Menu, X } from 'lucide-react';

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    x: -20,
    scale: 0.98
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1
  },
  exit: {
    opacity: 0,
    x: 20,
    scale: 0.98
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

// NavLink Component
const NavLink = memo(({ text, path, currentPath, onClick, isMobile = false }) => {
  const isActive = currentPath === path;
  
  return (
    <motion.a
      onClick={onClick}
      whileHover={{ scale: isMobile ? 1 : 1.05 }}
      className={`relative cursor-pointer transition-all duration-300 ${
        isMobile 
          ? 'block w-full px-4 py-3 text-white hover:bg-white/20' 
          : 'px-4 py-2 group'
      }`}
    >
      <span className={`relative z-10 ${
        isMobile 
          ? isActive ? 'text-white font-medium' : 'text-white/90'
          : 'text-white/90 group-hover:text-white transition-colors'
      }`}>
        {text}
      </span>
      {!isMobile && (
        <motion.div 
          className={`absolute inset-0 ${isActive ? 'bg-white/20' : 'bg-white/10'} rounded-lg`}
          initial={false}
          animate={{ scale: isActive ? 1 : 1 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        />
      )}
      {isMobile && isActive && (
        <motion.div 
          className="absolute inset-0 bg-white/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.a>
  );
});

// MobileMenu Component
const MobileMenu = memo(({ isOpen, onClose, navigation, currentPath }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, x: "100%" }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className="fixed inset-y-0 right-0 w-64 bg-orange-600 shadow-xl z-50"
      >
        <div className="flex justify-end p-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-white"
          >
            <X className="h-6 w-6" />
          </motion.button>
        </div>
        <div className="flex flex-col">
          {navigation.map((item) => (
            <NavLink
              key={item.text}
              text={item.text}
              path={item.path}
              currentPath={currentPath}
              onClick={() => {
                item.onClick();
                onClose();
              }}
              isMobile
            />
          ))}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
));

// ServiceCard Component
const ServiceCard = memo(({ title, icon, delay, path, navigate }) => {
  const handleClick = useCallback(() => {
    navigate(path);
  }, [navigate, path]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5 }}
      onClick={handleClick}
      className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center transform transition-transform duration-300 group-hover:rotate-6">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
            {title}
          </h3>
        </div>
        <ChevronRightIcon className="w-6 h-6 text-orange-500 transform transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </motion.div>
  );
});

// GuideButton Component
const GuideButton = memo(({ icon, text, gradient }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`${gradient} text-white px-8 py-4 rounded-xl flex items-center justify-center gap-3 font-medium shadow-lg transition-shadow duration-300 hover:shadow-xl`}
  >
    <div className="p-2 bg-white/20 rounded-lg">
      {icon}
    </div>
    <span className="text-lg">{text}</span>
  </motion.button>
));

// Main Home component
export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  const navigation = [
    { text: "Inicio", path: '/home', onClick: () => handleNavigation('/home') },
    { text: "Empresas", path: '/empresas', onClick: () => handleNavigation('/empresas') },
    { text: "Perfil", path: '/perfil', onClick: () => handleNavigation('/perfil') },
    { text: "Cerrar Sesión", path: '/', onClick: () => handleNavigation('/') }
  ];

  const services = [
    {
      title: 'Estancia I',
      icon: <DocumentTextIcon className="w-7 h-7 text-white" />,
      delay: 0.5,
      path: '/formatos/Estancia1'
    },
    {
      title: 'Estancia II',
      icon: <DocumentTextIcon className="w-7 h-7 text-white" />,
      delay: 0.6,
      path: '/formatos/Estancia2'
    },
    {
      title: 'Estadías',
      icon: <DocumentTextIcon className="w-7 h-7 text-white" />,
      delay: 0.7,
      path: '/formatos/Estadias'
    },
    {
      title: 'Servicio Social',
      icon: <DocumentTextIcon className="w-7 h-7 text-white" />,
      delay: 0.8,
      path: '/formatos/ServicioSocial'
    },
    {
      title: 'Estadías Nacionales',
      icon: <DocumentTextIcon className="w-7 h-7 text-white" />,
      delay: 0.9,
      path: '/formatos/EstadiasNacionales'
    }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
      >
        {/* Navigation */}
        <nav className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 sm:h-20">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-4"
              >
                <img src="/logo192.png" alt="Logo" className="h-16 sm:h-20 w-auto" />
              </motion.div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-2">
                {navigation.map((item) => (
                  <NavLink
                    key={item.text}
                    text={item.text}
                    path={item.path}
                    currentPath={location.pathname}
                    onClick={item.onClick}
                  />
                ))}
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMenuOpen(true)}
                className="md:hidden text-white"
              >
                <Menu className="h-6 w-6" />
              </motion.button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <MobileMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          navigation={navigation}
          currentPath={location.pathname}
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <AnimatePresence>
            {mounted && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
              >
                <motion.h1
                  className="text-5xl font-bold text-gray-900 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Bienvenido al Portal del Estudiante
                </motion.h1>
                <motion.p
                  className="text-xl text-gray-600 max-w-3xl mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Acceda a todos sus documentos y procesos académicos en un solo lugar
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {services.map((service) => (
              <ServiceCard
                key={service.title}
                {...service}
                navigate={navigate}
              />
            ))}
          </div>

          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center bg-white p-12 rounded-2xl shadow-xl"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-10">
              Guía de usuarios
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <GuideButton
                icon={<VideoCameraIcon className="w-6 h-6" />}
                text="Guía en video"
                gradient="bg-gradient-to-r from-blue-500 to-blue-600"
              />
              <GuideButton
                icon={<DocumentTextIcon className="w-6 h-6" />}
                text="Guía en PDF"
                gradient="bg-gradient-to-r from-red-500 to-red-600"
              />
            </div>
          </motion.section>
        </main>
      </motion.div>
    </AnimatePresence>
  );
}