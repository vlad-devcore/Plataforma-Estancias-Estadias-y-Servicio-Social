import { useState } from 'react';
import { FaInfoCircle, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const CreditsModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Botón de información */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleModal}
        className="fixed bottom-4 right-4 p-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors shadow-md z-50"
        aria-label="Ver créditos"
      >
        <FaInfoCircle className="w-5 h-5" />
      </motion.button>

      {/* Modal */}
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
              className="bg-white p-6 rounded-lg max-w-md w-full mx-4 relative shadow-lg"
            >
              {/* Botón de cerrar */}
              <button
                onClick={toggleModal}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                aria-label="Cerrar modal"
              >
                <FaTimes className="w-5 h-5" />
              </button>

              {/* Contenido */}
              <div className="text-center">
                <img
                  src="cliente/public/logoUNI.png"
                  alt="UPQROO Logo"
                  className="university-logo mx-auto h-16 mb-4"
                />
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Créditos</h2>
                <p className="text-gray-700 mb-4">
                  Desarrollado por estudiantes de la Universidad Politécnica de Quintana Roo
                </p>
                <ul className="text-left text-gray-700 space-y-2 mb-4">
                  <li>👨🏻‍💻 Alberto Castrejón - Desarrollador Frontend</li>
                  <li>👨🏾‍💻Juan Och - Desarrollador Backend</li>
                  <li>🎨 Vladimir Poot - Diseñador UI/UX</li>
                  <li>🎨 Zurisaday Guerrero - Diseñador UI/UX</li>
                  <li>🛠️ Yeriel Cupido - Tester QA</li>
                </ul>
                <p className="text-sm text-gray-500">
                  © 2025 UPQROO. Todos los derechos reservados.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence> 
    </>
  );
};

export default CreditsModal;