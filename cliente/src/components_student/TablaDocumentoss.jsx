import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Trash2,
  Download,
  MessageSquare,
  FileText,
  Eye,
  ExternalLink,
} from 'lucide-react';
import useDocumentosEstudiante from '../components/hooks/useDocumentosEstudiante';
import { motion, AnimatePresence } from 'framer-motion';

const TablaDocumentos = ({ tipoProceso, procesoId: procesoIdProp }) => {
  const navigate = useNavigate();
  const fileInputRefs = useRef({});

  const [modalSubirConfirm, setModalSubirConfirm] = useState({ open: false, idTipoDoc: null });
  const [modalSubir, setModalSubir] = useState({ open: false, idTipoDoc: null });
  const [modalEliminar, setModalEliminar] = useState({ open: false, idDocumento: null });
  const [modalFeedback, setModalFeedback] = useState({ open: false, comentario: '' });
  const [visorPdf, setVisorPdf] = useState({ open: false, url: null, nombre: '' });

  const {
    plantillas,
    documentos,
    loading,
    error,
    success,
    uploadDocumento,
    deleteDocumento,
    resetMessages,
  } = useDocumentosEstudiante(tipoProceso, procesoIdProp);

  const handleConfirmSubir = (idTipoDoc) => {
    setModalSubirConfirm({ open: false, idTipoDoc: null });
    setModalSubir({ open: true, idTipoDoc });
  };

  const handleUpload = async (idTipoDoc, file) => {
    if (file) {
      await uploadDocumento(idTipoDoc, file);
      setModalSubir({ open: false, idTipoDoc: null });
      if (fileInputRefs.current[idTipoDoc]) {
        fileInputRefs.current[idTipoDoc].value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (modalEliminar.idDocumento) {
      await deleteDocumento(modalEliminar.idDocumento);
      setModalEliminar({ open: false, idDocumento: null });
    }
  };

  const getDocumentoSubido = (idTipoDoc) =>
    documentos.find((doc) => doc.IdTipoDoc === idTipoDoc);

  const handlePlantillaClick = (nombreDocumento) => {
    const nombreLower = nombreDocumento.toLowerCase();

    if (nombreLower.includes('definición de proyecto') || nombreLower.includes('definicion de proyecto')) {
      navigate('/DefinicionProyectoForm');
    } else if (nombreLower.includes('cédula de registro') || nombreLower.includes('cedula de registro')) {
      navigate('/CedulaRegistroForm');
    } else if (nombreLower.includes('número nss')) {
      window.open('https://serviciosdigitales.imss.gob.mx/gestionAsegurados-web-externo/vigencia', '_blank');
    } else {
      const downloadUrl = `${process.env.REACT_APP_API_ENDPOINT}/api/documentosAdmin/download/${encodeURIComponent(nombreDocumento)}`;
      window.open(downloadUrl, '_blank');
    }
  };

  if (!procesoIdProp && !loading) {
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

      {loading && <div className="text-center text-gray-500 animate-pulse py-12">Cargando documentos...</div>}

      {!loading && plantillas.length === 0 && (
        <div className="text-center text-gray-600 bg-gray-50 p-10 rounded-lg">
          No hay plantillas disponibles para este proceso.
        </div>
      )}

      {!loading && plantillas.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-red-900 to-red-700 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Documento</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Plantilla</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Mi Documento</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Estatus</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Feedback</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {plantillas.map((p) => {
                const doc = getDocumentoSubido(p.IdTipoDoc);
                const nombreLower = p.nombre_documento.toLowerCase();
                const esVistaEspecial =
                  nombreLower.includes('definición de proyecto') ||
                  nombreLower.includes('definicion de proyecto') ||
                  nombreLower.includes('cédula de registro') ||
                  nombreLower.includes('cedula de registro');
                const esEnlaceExterno = nombreLower.includes('número nss');

                return (
                  <tr key={p.id_plantilla} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-800 font-medium">{p.nombre_documento}</td>

                    <td className="px-6 py-4">
                      {p.nombre_archivo || esEnlaceExterno ? (
                        <motion.button
                          onClick={() => handlePlantillaClick(p.nombre_documento)}
                          className={`inline-flex items-center justify-center w-10 h-10 ${
                            esVistaEspecial
                              ? 'bg-purple-500 hover:bg-purple-600'
                              : esEnlaceExterno
                              ? 'bg-blue-600 hover:bg-blue-700'
                              : 'bg-green-500 hover:bg-green-600'
                          } text-white rounded-full transition-colors`}
                          whileHover={{ rotate: esVistaEspecial || esEnlaceExterno ? 0 : 360, scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {esVistaEspecial ? <Eye size={20} /> : esEnlaceExterno ? <ExternalLink size={20} /> : <Download size={20} />}
                        </motion.button>
                      ) : (
                        <span className="text-gray-500 italic">No disponible</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {doc?.RutaArchivo ? (
                        (() => {
                          const extension = doc.RutaArchivo.split('.').pop()?.toLowerCase();
                          const esPdf = extension === 'pdf';
                          const url = `${process.env.REACT_APP_API_ENDPOINT}/api/documentos/download/${doc.id_Documento}`;

                          if (esPdf) {
                            return (
                              <motion.button
                                onClick={() => setVisorPdf({ open: true, url, nombre: p.nombre_documento })}
                                className="inline-flex items-center justify-center w-10 h-10 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors"
                                whileHover={{ scale: 1.1 }}
                                title="Ver PDF"
                              >
                                <FileText size={20} />
                              </motion.button>
                            );
                          } else {
                            return (
                              <motion.a
                                href={url}
                                download
                                className="inline-flex items-center justify-center w-10 h-10 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
                                whileHover={{ scale: 1.1 }}
                                title={`Descargar ${extension?.toUpperCase() || 'archivo'}`}
                              >
                                <Download size={20} />
                              </motion.a>
                            );
                          }
                        })()
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
                          className="inline-flex items-center justify-center w-10 h-10 bg-purple-500 text-white rounded-full hover:bg-purple-600"
                          whileHover={{ scale: 1.1 }}
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
                        onClick={() => setModalSubirConfirm({ open: true, idTipoDoc: p.IdTipoDoc })}
                        className={`inline-flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors ${
                          loading || p.estado === 'Bloqueado' ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        whileHover={{ scale: 1.1 }}
                        disabled={loading || p.estado === 'Bloqueado'}
                        title={p.estado === 'Bloqueado' ? 'Bloqueado' : 'Subir documento'}
                      >
                        <Upload size={20} />
                      </motion.button>

                      {doc && (
                        <motion.button
                          onClick={() => setModalEliminar({ open: true, idDocumento: doc.id_Documento })}
                          className={`inline-flex items-center justify-center w-10 h-10 bg-red-500 text-white rounded-full hover:bg-red-600 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          whileHover={{ x: [0, -3, 3, -3, 3, 0] }}
                          disabled={loading}
                          title="Eliminar"
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

      <AnimatePresence>
        {visorPdf.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4"
            onClick={() => setVisorPdf({ open: false, url: null, nombre: '' })}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-lg shadow-2xl w-full h-full max-w-6xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-[#f97316] to-[#fb923c] text-white border-b border-orange-400">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold truncate">{visorPdf.nombre}</h3>
                </div>
                <button
                  onClick={() => setVisorPdf({ open: false, url: null, nombre: '' })}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors ml-4 flex-shrink-0"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 bg-gray-100 p-4">
                <div className="w-full h-full bg-white rounded shadow-inner overflow-hidden">
                  <iframe src={visorPdf.url} className="w-full h-full border-0" title="PDF Viewer" allowFullScreen />
                </div>
              </div>
              <div className="px-6 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-600">UPQROO</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalSubirConfirm.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Confirmar subida</h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de subir el documento?<br />
                <strong>{plantillas.find(p => p.IdTipoDoc === modalSubirConfirm.idTipoDoc)?.nombre_documento}</strong>
                {getDocumentoSubido(modalSubirConfirm.idTipoDoc) && <span className="block text-orange-600 mt-2">Se reemplazará el archivo actual</span>}
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setModalSubirConfirm({ open: false, idTipoDoc: null })} className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
                  Cancelar
                </button>
                <button onClick={() => handleConfirmSubir(modalSubirConfirm.idTipoDoc)} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Continuar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalSubir.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Subir documento</h3>
              <p className="text-gray-600 mb-4">
                {plantillas.find(p => p.IdTipoDoc === modalSubir.idTipoDoc)?.nombre_documento}
              </p>
              <input
                type="file"
                ref={(el) => (fileInputRefs.current[modalSubir.idTipoDoc] = el)}
                onChange={(e) => e.target.files?.[0] && handleUpload(modalSubir.idTipoDoc, e.target.files[0])}
                accept=".pdf,.docx,.xlsx"
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition"
              />
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setModalSubir({ open: false, idTipoDoc: null })} className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalEliminar.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-red-600 mb-4">Eliminar documento</h3>
              <p className="text-gray-700 mb-6">¿Estás completamente seguro? Esta acción <strong>no se puede deshacer</strong>.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setModalEliminar({ open: false, idDocumento: null })} className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
                  Cancelar
                </button>
                <button onClick={handleDelete} className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                  Sí, eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalFeedback.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Feedback del administrador</h3>
              <div className="bg-gray-50 p-5 rounded-lg mb-6 max-h-96 overflow-y-auto whitespace-pre-wrap text-gray-700">
                {modalFeedback.comentario || 'Sin comentarios'}
              </div>
              <div className="flex justify-end">
                <button onClick={() => setModalFeedback({ open: false, comentario: '' })} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
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

export default TablaDocumentos;