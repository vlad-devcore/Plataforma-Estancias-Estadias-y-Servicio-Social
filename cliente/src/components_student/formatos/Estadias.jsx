import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PlantillaServicio from '../PlantillaServicio';
import { ChevronDown, Download, Edit2, Eye, FileText } from 'lucide-react';
import ModalRegistroProceso from '../../components/estudiante/ModalRegistroProceso'; // Asegúrate que la ruta sea correcta
import axios from 'axios';
import TablaDocumentos from '../../components_student/TablaDocumentoss'; // Asegúrate que la ruta sea correcta

const Estadias = () => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const documentos = [
    {
      registro: 'Carta de presentación',
      formato: 'descargar',
      estado: 'pendiente'
    },
    {
      registro: 'Carta de aceptacion',
      formato: 'descargar',
      estado: 'pendiente'
    },
    {
      registro: 'Cédula de registro',
      formato: 'llenar',
      estado: 'pendiente'
    },
    {
      registro: 'Definición de proyecto',
      formato: 'llenar',
      estado: 'pendiente'
    },
    {
      registro: 'Carta de liberación',
      formato: 'descargar',
      estado: 'pendiente'
    }
  ];

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    const checkRegistro = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        console.log("🔐 Usuario guardado en localStorage:", user);
        const { data } = await axios.get(`http://localhost:9999/api/procesos/por-usuario/${user.id}`);
        console.log("🔐 Procesos encontrados:", data);
        const yaRegistrado = data.some(p => p.tipo_proceso === "Estadias");
        console.log("🔐 Registro encontrado:", yaRegistrado);
        setIsRegistered(yaRegistrado);
      } catch (err) {
        console.error("Error al verificar registro:", err);
      }
    };

    checkRegistro();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <PlantillaServicio
      titulo="Estadías"
      descripcion="Gestiona tu proceso de Estadías, sube tus documentos y da seguimiento a tu progreso académico."
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6"
      >
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
          </div>
          
          {isRegistered ? (
            <div className="p-4">
              {/* Aquí se mostrarán los documentos */}
              <TablaDocumentos tipoProceso="Estadias" />
            </div>
          ) : (
            <div className="p-4 text-gray-500 italic">
              Debes registrarte para poder subir documentos.
            </div>
          )}
        </div>

        {isRegistered && (
          <motion.div 
            className="flex justify-center mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto bg-red-900 hover:bg-red-800 text-white px-4 sm:px-6 py-3 rounded-md transition-colors duration-200 shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <FileText className="w-5 h-5" />
              <span className="text-center">Realizar Evaluación Empresarial Estancias y Estadías</span>
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {showModal && (
        <ModalRegistroProceso
          open={showModal}
          onClose={handleCloseModal}
          tipoProceso="Estadias"
          onSuccess={() => {
            // Actualizar el estado al registrarse exitosamente
            setIsRegistered(true);
            handleCloseModal(); // Cerrar el modal después de un registro exitoso
          }}
        />
      )}
    </PlantillaServicio>
  );
};

export default Estadias;  