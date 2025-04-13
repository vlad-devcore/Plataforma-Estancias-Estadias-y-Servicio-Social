import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PlantillaServicio from '../PlantillaServicio';
import { ChevronDown, Download, Edit2, Eye, FileText } from 'lucide-react';
import ModalRegistro from './ModalRegistro'; // Importar el Modal de Registro

const Estancia1 = () => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false); // Estado para verificar si el estudiante está registrado
  const [showModal, setShowModal] = useState(false); // Estado para controlar la visibilidad del modal de registro

  const documentos = [
    { registro: 'Carta de presentación', formato: 'descargar', estado: 'pendiente' },
    { registro: 'Carta de aceptación', formato: 'descargar', estado: 'pendiente' },
    { registro: 'Cédula de registro', formato: 'llenar', estado: 'pendiente' },
    { registro: 'Definición de proyecto', formato: 'llenar', estado: 'pendiente' },
    { registro: 'Carta de liberación', formato: 'descargar', estado: 'pendiente' }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Función para abrir el modal
  const handleOpenModal = () => {
    setShowModal(true);
  };

  // Función para cerrar el modal y marcar como registrado
  const handleCloseModal = () => {
    setShowModal(false);
    setIsRegistered(true); // Marcar al estudiante como registrado
  };

  useEffect(() => {
    // Aquí verificamos si el estudiante ya está registrado en el proceso
    // Esto puede ser con una llamada a la API o verificando en el localStorage
    // Aquí, por simplicidad, vamos a simular que no está registrado.
    const checkRegistration = false; // Simulamos que el estudiante no está registrado
    setIsRegistered(checkRegistration);
  }, []);

  return (
    <PlantillaServicio
      titulo="Estancia I"
      descripcion="Gestiona tu proceso de Estancia I, sube tus documentos y da seguimiento a tu progreso académico."
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6"
      >
        {/* Botón para abrir el modal si no está registrado */}
        {!isRegistered && (
          <motion.button
            onClick={handleOpenModal}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 mb-4"
          >
            <FileText className="w-4 h-4" />
            <span>Registrar para subir documentos</span>
          </motion.button>
        )}

        <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b gap-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Documentos Requeridos</h2>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Registro en Proceso</span>
            </motion.button>
          </div>

          {/* Aquí vendría la lógica para la tabla de documentos */}

        </div>
      </motion.div>

      {/* Modal de registro */}
      {showModal && <ModalRegistro onClose={handleCloseModal} />}
    </PlantillaServicio>
  );
};

export default Estancia1;
