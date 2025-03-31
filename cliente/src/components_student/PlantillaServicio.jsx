import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const PlantillaServicio = ({ titulo, descripcion, children }) => {
  const navigate = useNavigate();

  const volverAtras = () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
      navigate('/home');
      document.body.style.opacity = '1';
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20">
            <button
              onClick={volverAtras}
              className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
              <span>Volver</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{titulo}</h1>
          <p className="text-gray-600 text-lg">{descripcion}</p>
          
          <div className="mt-8">
            {children}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PlantillaServicio;
