import React, { useRef, useState, useEffect } from 'react';
import { Upload, Trash2, FileText, MessageSquare } from 'lucide-react';
import useDocumentosEstudiante from '../components/hooks/useDocumentosEstudiante';
import { motion, AnimatePresence } from 'framer-motion';
 

const TablaReportesMensuales = ({ tipoProceso, procesoId: procesoIdProp, documentosRequeridos }) => {
  const fileInputRefs = useRef({});
  const [modalSubirConfirm, setModalSubirConfirm] = useState({ open: false, idTipoDoc: null, numeroReporte: null });
  const [modalSubir, setModalSubir] = useState({ open: false, idTipoDoc: null, numeroReporte: null });
  const [modalEliminar, setModalEliminar] = useState({ open: false, idDocumento: null });
  const [modalFeedback, setModalFeedback] = useState({ open: false, comentario: '' });
  const {
    documentos,
    procesoId,
    loading,
    error,
    success,
    uploadDocumento,
    deleteDocumento,
    resetMessages,
  } = useDocumentosEstudiante(tipoProceso, procesoIdProp);

  useEffect(() => {
    console.log("🔍 Depuración: documentosRequeridos:", documentosRequeridos);
    console.log("🔍 Depuración: documentos:", documentos);
    console.log("🔍 Depuración: procesoIdProp:", procesoIdProp, "procesoId:", procesoId);
    console.log("🔍 Depuración: loading:", loading, "error:", error, "success:", success);
  }, [documentosRequeridos, documentos, procesoIdProp, procesoId, loading, error, success]);

  const handleConfirmSubir = (idTipoDoc, numeroReporte) => {
    setModalSubirConfirm({ open: false, idTipoDoc: null, numeroReporte: null });
    setModalSubir({ open: true, idTipoDoc, numeroReporte });
    console.log("🔍 Depuración: Confirmando subida, idTipoDoc:", idTipoDoc, "numeroReporte:", numeroReporte);
  };

  const handleUpload = async (idTipoDoc, numeroReporte, file) => {
    if (file) {
      await uploadDocumento(idTipoDoc, file);
      setModalSubir({ open: false, idTipoDoc: null, numeroReporte: null });
      if (fileInputRefs.current[`${idTipoDoc}-${numeroReporte}`]) {
        fileInputRefs.current[`${idTipoDoc}-${numeroReporte}`].value = '';
      }
      console.log("🔍 Depuración: Documento subido, idTipoDoc:", idTipoDoc);
    }
  };

  const handleDelete = async () => {
    if (modalEliminar.idDocumento) {
      await deleteDocumento(modalEliminar.idDocumento);
      setModalEliminar({ open: false, idDocumento: null });
      console.log("🔍 Depuración: Documento eliminado, idDocumento:", modalEliminar.idDocumento);
    }
  };

  // Mapear documentos subidos por IdTipoDoc
  const getDocumentoSubido = (idTipoDoc) => {
    return documentos.find((doc) => doc.IdTipoDoc === idTipoDoc) || null;
  };

  if (!procesoIdProp && !loading) {
    console.log("🔍 Depuración: No hay proceso activo, mostrando mensaje");
    return (
      <div className="p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
          No tienes un proceso activo para el tipo "{tipoProceso}". Por favor, regístrate en el proceso.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Mensajes de error y éxito */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex justify-between items-center"
          >
            <span>{error}</span>
            <button onClick={resetMessages} className="text-red-900 hover:underline">
              Cerrar
            </button>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 flex justify-between items-center"
          >
            <span>{success}</span>
            <button onClick={resetMessages} className="text-green-900 hover:underline">
              Cerrar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicador de carga */}
      {loading && <div className="text-center text-gray-500 animate-pulse">Cargando reportes...</div>}

      {/* Mensaje si no hay documentos requeridos */}
      {!loading && documentosRequeridos.length === 0 && (
        <div className="text-center text-gray-600 bg-gray-50 p-4 rounded-lg">
          No hay reportes mensuales configurados para este proceso.
        </div>
      )}

      {/* Tabla de reportes */}
      {!loading && documentosRequeridos.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-red-900 to-red-700 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Reporte</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Mi Documento</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Estatus</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Feedback</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {documentosRequeridos.map((req) => {
                const doc = getDocumentoSubido(req.idTipoDoc);
                console.log("🔍 Depuración: Renderizando fila, req:", req, "doc:", doc);
                return (
                  <tr key={`${req.idTipoDoc}-${req.numeroReporte}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-800 font-medium">{req.nombre}</td>
                    <td className="px-6 py-4">
                      {doc?.RutaArchivo ? (
                        <motion.a
                          href={`${process.env.REACT_APP_API_ENDPOINT}/api/documentos/download/${doc.id_Documento}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-10 h-10 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                          title="Ver mi documento"
                        >
                          <FileText size={20} />
                        </motion.a>
                      ) : (
                        <span className="text-gray-500 italic">No subido</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {doc?.Estatus ? (
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            doc.Estatus === 'Aprobado'
                              ? 'bg-green-100 text-green-800'
                              : doc.Estatus === 'Rechazado'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {doc.Estatus}
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {doc?.Comentarios ? (
                        <motion.button
                          onClick={() => setModalFeedback({ open: true, comentario: doc.Comentarios })}
                          className="inline-flex items-center justify-center w-10 h-10 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                          title="Ver feedback"
                        >
                          <MessageSquare size={20} />
                        </motion.button>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex gap-3">
                      <motion.button
                        onClick={() => setModalSubirConfirm({ open: true, idTipoDoc: req.idTipoDoc, numeroReporte: req.numeroReporte })}
                        className={`inline-flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors ${
                          loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                        disabled={loading}
                        title="Subir reporte"
                      >
                        <Upload size={20} />
                      </motion.button>
                      {doc && (
                        <motion.button
                          onClick={() => setModalEliminar({ open: true, idDocumento: doc.id_Documento })}
                          className={`inline-flex items-center justify-center w-10 h-10 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          whileHover={{ x: [0, -3, 3, -3, 3, 0] }}
                          transition={{ duration: 0.3 }}
                          disabled={loading}
                          title="Eliminar reporte"
                        >
                          <Trash2 size={20} />
                        </motion.button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmación para subir reporte */}
      <AnimatePresence>
        {modalSubirConfirm.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Confirmar Subida
              </h3>
              <p className="text-gray-600 mb-4">
                ¿Estás seguro de que quieres subir el reporte "
                {documentosRequeridos.find(
                  (req) => req.idTipoDoc === modalSubirConfirm.idTipoDoc && req.numeroReporte === modalSubirConfirm.numeroReporte
                )?.nombre}
                "? {getDocumentoSubido(modalSubirConfirm.idTipoDoc) ? 'Esto reemplazará el reporte existente.' : ''}
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setModalSubirConfirm({ open: false, idTipoDoc: null, numeroReporte: null })}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleConfirmSubir(modalSubirConfirm.idTipoDoc, modalSubirConfirm.numeroReporte)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal para subir reporte */}
      <AnimatePresence>
        {modalSubir.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Subir Reporte
              </h3>
              <p className="text-gray-600 mb-4">
                Selecciona el archivo para{' '}
                {documentosRequeridos.find(
                  (req) => req.idTipoDoc === modalSubir.idTipoDoc && req.numeroReporte === modalSubir.numeroReporte
                )?.nombre}.
              </p>
              <input
                type="file"
                ref={(el) => (fileInputRefs.current[`${modalSubir.idTipoDoc}-${modalSubir.numeroReporte}`] = el)}
                onChange={(e) => handleUpload(modalSubir.idTipoDoc, modalSubir.numeroReporte, e.target.files[0])}
                accept=".pdf,.docx,.xlsx"
                className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setModalSubir({ open: false, idTipoDoc: null, numeroReporte: null })}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => fileInputRefs.current[`${modalSubir.idTipoDoc}-${modalSubir.numeroReporte}`]?.click()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Seleccionar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal para eliminar reporte */}
      <AnimatePresence>
        {modalEliminar.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Confirmar Eliminación
              </h3>
              <p className="text-gray-600 mb-4">
                ¿Estás seguro de que quieres eliminar este reporte? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setModalEliminar({ open: false, idDocumento: null })}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal para mostrar feedback */}
      <AnimatePresence>
        {modalFeedback.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Feedback del Administrador
              </h3>
              <p className="text-gray-600 mb-4">{modalFeedback.comentario}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => setModalFeedback({ open: false, comentario: '' })}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TablaReportesMensuales;