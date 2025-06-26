import React, { useRef, useState } from 'react';
import useFormatos from '../components/hooks/useFormatos';
import { Upload, Download, Trash2 } from 'lucide-react';
import Sidebar from '../components_admin/Sidebar';
import { motion } from 'framer-motion';

const FormatosAdmin = () => {
  const fileInputRef = useRef(null);
  const {
    formatos,
    loading,
    error,
    success,
    uploadFormato,
    downloadFormato,
    deleteFormato,
    getFileExtension,
    resetMessages
  } = useFormatos();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
                                                                        
  const handleFileChange = async (e, nombreDocumento) => {
    if (e.target.files.length > 0) {
      try {
        await uploadFormato(nombreDocumento, e.target.files[0]);
      } catch (error) {
        console.error('Error al subir archivo:', error);
      }
      e.target.value = ''; // Resetear input
    }
  };

  const handleDeleteClick = (nombreDocumento) => {
    setConfirmAction('delete');
    setConfirmData(nombreDocumento);
    setShowConfirmation(true);
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmAction === 'delete') {
        await deleteFormato(confirmData);
      }
    } catch (err) {
      console.error(err);
    }
    setShowConfirmation(false);
    setConfirmAction(null);
    setConfirmData(null);
  };

  const handleCancelAction = () => {
    setShowConfirmation(false);
    setConfirmAction(null);
    setConfirmData(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Contenido principal con scroll horizontal */}
      <div className="flex-1 p-4 md:p-8 overflow-x-auto">
        <div className="max-w-7xl mx-auto w-full">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold mb-6 flex items-center"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-6 h-6 text-blue-600 mr-2"
            >
              📄
            </motion.div>
            Gestión de Formatos
          </motion.h1>
          
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
            >
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button onClick={resetMessages} className="text-red-900 underline">
                  Cerrar
                </button>
              </div>
            </motion.div>
          )}
          
          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
            >
              <div className="flex justify-between items-center">
                <span>{success}</span>
                <button onClick={resetMessages} className="text-green-900 underline">
                  Cerrar
                </button>
              </div>
            </motion.div>
          )}

          {/* Contenedor de tabla con scroll horizontal */}
          <div className="w-full overflow-x-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow border border-gray-200 min-w-max"
            >
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Archivo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formatos.map((formato) => (
                    <tr key={formato.nombre_documento} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formato.nombre_documento}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formato.nombre_archivo ? (
                          <div className="flex items-center">
                            <span className="mr-2">
                              {getFileExtension(formato.nombre_archivo) === 'pdf' ? '📄' : '📝'}
                            </span>
                            <span>{formato.nombre_archivo}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">No subido</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-2">
                          {formato.nombre_archivo && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => downloadFormato(formato.nombre_documento)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                                disabled={loading}
                              >
                                <Download size={14} className="mr-1" />
                                Descargar
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => window.open(`http://localhost:9999/api/documentosAdmin/view/${encodeURIComponent(formato.nombre_documento)}`, '_blank')}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700"
                                disabled={loading}
                              >
                                👁️ Ver
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDeleteClick(formato.nombre_documento)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700"
                                disabled={loading}
                              >
                                <Trash2 size={14} className="mr-1" />
                                Eliminar
                              </motion.button>
                            </>
                          )}
                          <motion.label
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                          >
                            <Upload size={14} className="mr-1" />
                            Subir
                            <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              onChange={(e) => handleFileChange(e, formato.nombre_documento)}
                              accept=".pdf,.doc,.docx"
                            />
                          </motion.label>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold mb-3">Confirmar Eliminación</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar este formato? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancelAction}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConfirmAction}
                className="px-4 py-2 text-white rounded-md hover:bg-opacity-90 transition-colors bg-red-500"
              >
                Eliminar
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default FormatosAdmin;