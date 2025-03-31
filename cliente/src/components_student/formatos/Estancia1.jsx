import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PlantillaServicio from '../PlantillaServicio';
import { ChevronDown, Download, Edit2, Eye, FileText } from 'lucide-react';

const Estancia1 = () => {
  const [expandedRow, setExpandedRow] = useState(null);
  
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
      titulo="Estancia I"
      descripcion="Gestiona tu proceso de Estancia I, sube tus documentos y da seguimiento a tu progreso académico."
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6"
      >
        <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b gap-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Documentos Requeridos</h2>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span className="whitespace-nowrap">Registro en Proceso</span>
            </motion.button>
          </div>
          
          <div className="overflow-x-auto">
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="min-w-full"
            >
              {/* Mobile view */}
              <div className="sm:hidden">
                {documentos.map((doc, index) => (
                  <motion.div
                    key={index}
                    variants={item}
                    className="p-4 border-b last:border-b-0"
                  >
                    <h3 className="font-medium text-gray-900 mb-2">{doc.registro}</h3>
                    <div className="space-y-2">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        {doc.formato === 'descargar' ? (
                          <>
                            <Download className="w-4 h-4" />
                            Descargar
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4" />
                            Llenar
                          </>
                        )}
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                        className="w-full bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Estado
                        <ChevronDown 
                          className={`w-4 h-4 transition-transform duration-200 ${
                            expandedRow === index ? 'rotate-180' : ''
                          }`}
                        />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-full text-red-900 hover:text-red-800 transition-colors duration-200 flex items-center justify-center gap-1 py-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Desktop view */}
              <table className="hidden sm:table w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-sm font-medium text-gray-700">Registro</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-sm font-medium text-gray-700">Formato</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {documentos.map((doc, index) => (
                    <motion.tr
                      key={index}
                      variants={item}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-700">{doc.registro}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2"
                        >
                          {doc.formato === 'descargar' ? (
                            <>
                              <Download className="w-4 h-4" />
                              Descargar
                            </>
                          ) : (
                            <>
                              <FileText className="w-4 h-4" />
                              Llenar
                            </>
                          )}
                        </motion.button>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                          className="bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Ver Estado
                          <ChevronDown 
                            className={`w-4 h-4 transition-transform duration-200 ${
                              expandedRow === index ? 'rotate-180' : ''
                            }`}
                          />
                        </motion.button>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-red-900 hover:text-red-800 transition-colors duration-200 flex items-center gap-1"
                        >
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>
        </div>

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
      </motion.div>
    </PlantillaServicio>
  );
};

export default Estancia1;