import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, Users, Flag, HeartHandshake } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import useEstadisticas from '../components/hooks/useEstadisticas';

const StatCard = ({ title, value, subtitle, icon: Icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: delay }}
    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center justify-center"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3, delay: delay + 0.2 }}
      className="text-orange-500 mb-2"
    >
      <Icon className="h-6 w-6" />
    </motion.div>
    <h3 className="text-gray-700 font-medium text-sm mb-1">{title}</h3>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: delay + 0.3 }}
      className="text-orange-500 text-3xl font-bold mb-1"
    >
      {value}
    </motion.p>
    <p className="text-gray-500 text-xs">{subtitle}</p>
  </motion.div>
);

const StatSection = ({ title, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className="bg-white rounded-lg shadow-lg p-6 mb-6"
  >
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: delay + 0.2 }}
      className="flex items-center mb-4"
    >
      <BarChart2 className="text-orange-500 h-5 w-5 mr-2" />
      <h2 className="text-gray-700 font-medium">{title}</h2>
    </motion.div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {React.Children.map(children, (child, index) =>
        React.cloneElement(child, { delay: delay + 0.1 * index })
      )}
    </div>
  </motion.div>
);

const EstadisticasGlobales = () => {
  const location = useLocation();
  const { estadisticas, loading, error } = useEstadisticas();

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      {/* Main Content */}
      <main className="flex-1 p-6 ml-0 md:ml-30">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
            >
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-gray-500 animate-pulse"
                >
                  Cargando estadísticas...
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex justify-between items-center"
                >
                  <span>{error}</span>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-red-900 hover:underline"
                  >
                    Reintentar
                  </button>
                </motion.div>
              )}

              {!loading && !error && (
                <>
                  <StatSection title="Periodo Cuatrimestre Actual" delay={0.2}>
                    <StatCard
                      title="Estancia I"
                      value={estadisticas.periodoActual.EstanciaI}
                      subtitle="usuarios activos"
                      icon={Users}
                    />
                    <StatCard
                      title="Estancia II"
                      value={estadisticas.periodoActual.EstanciaII}
                      subtitle="usuarios activos"
                      icon={Users}
                    />
                    <StatCard
                      title="Estadías"
                      value={estadisticas.periodoActual.Estadias}
                      subtitle="usuarios activos"
                      icon={Users}
                    />
                    <StatCard
                      title="Servicio Social"
                      value={estadisticas.periodoActual.ServicioSocial}
                      subtitle="usuarios activos"
                      icon={HeartHandshake}
                    />
                    <StatCard
                      title="Estadías Nacionales"
                      value={estadisticas.periodoActual.EstadiasNacionales}
                      subtitle="usuarios activos"
                      icon={Flag}
                    />
                  </StatSection>

                  <StatSection title="Estadísticas Globales" delay={0.4}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="col-span-full bg-orange-50 rounded-lg p-4 mb-4 text-center"
                    >
                      <h3 className="text-gray-700 mb-1">Total de Usuarios en Plataforma</h3>
                      <motion.p
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                        className="text-orange-500 text-4xl font-bold mb-1"
                      >
                        {estadisticas.globales.totalUsuarios}
                      </motion.p>
                      <p className="text-gray-500 text-sm">usuarios registrados</p>
                    </motion.div>
                    <StatCard
                      title="Estancia I"
                      value={estadisticas.globales.EstanciaI}
                      subtitle="usuarios totales"
                      icon={Users}
                    />
                    <StatCard
                      title="Estancia II"
                      value={estadisticas.globales.EstanciaII}
                      subtitle="usuarios totales"
                      icon={Users}
                    />
                    <StatCard
                      title="Estadías"
                      value={estadisticas.globales.Estadias}
                      subtitle="usuarios totales"
                      icon={Users}
                    />
                    <StatCard
                      title="Servicio Social"
                      value={estadisticas.globales.ServicioSocial}
                      subtitle="usuarios totales"
                      icon={HeartHandshake}
                    />
                    <StatCard
                      title="Estadías Nacionales"
                      value={estadisticas.globales.EstadiasNacionales}
                      subtitle="usuarios totales"
                      icon={Flag}
                    />
                  </StatSection>
                </>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default EstadisticasGlobales;