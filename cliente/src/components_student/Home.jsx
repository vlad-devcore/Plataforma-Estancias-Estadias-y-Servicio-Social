import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { DocumentTextIcon, VideoCameraIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Header from './HeaderEstudiante';
import useProgramas from '../components/hooks/useProgramasEducativos';

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
  const { procesosPermitidos, loading, error } = useProgramas();

  const procesoRoutes = {
    'Estancia I': '/formatos/Estancia1',
    'Estancia II': '/formatos/Estancia2',
    'Estadía': '/formatos/Estadias',
    'Servicio Social': '/formatos/ServicioSocial',
    'Estadia Nacional': '/formatos/EstadiasNacionales',
  };

  const services = procesosPermitidos.map((proceso, index) => ({
    title: proceso,
    icon: <DocumentTextIcon className="w-7 h-7 text-white" />,
    delay: 0.5 + index * 0.1,
    path: procesoRoutes[proceso] || '#',
  }));

  useEffect(() => {
    setMounted(true);
    console.log('Services:', services); // Depuración
  }, [services]);

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
        {/* Header Component */}
        <Header />

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

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8 text-center"
            >
              {error}
            </motion.div>
          )}

          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-600"
            >
              Cargando procesos...
            </motion.div>
          ) : services.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-600"
            >
              No hay procesos disponibles para tu programa educativo.
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {services.map((service) => (
                <ServiceCard
                  key={service.title}
                  {...service}
                  navigate={navigate}
                />
              ))}
            </motion.div>
          )}

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