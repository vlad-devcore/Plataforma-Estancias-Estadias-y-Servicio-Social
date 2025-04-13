import { motion } from 'framer-motion';
import { Search, Eye, CheckCircle, XCircle, File, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import Sidebar from './Sidebar';

const DocumentManagement = () => {
  const [documents, setDocuments] = useState([
    { id: 1, matricula: '202100389', nombre: 'Certificado de Estudios', fecha: '2025-04-10', estatus: 'pendiente' },
    { id: 2, matricula: '202100162', nombre: 'Comprobante de Pago', fecha: '2025-04-09', estatus: 'pendiente' },
    { id: 3, matricula: '202500987', nombre: 'Identificación Oficial', fecha: '2025-04-08', estatus: 'pendiente' },
    { id: 4, matricula: '202900987', nombre: 'Acta de Nacimiento', fecha: '2025-04-07', estatus: 'pendiente' },
    { id: 5, matricula: '202300547', nombre: 'Carta de Recomendación', fecha: '2025-04-06', estatus: 'pendiente' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [rejectionNote, setRejectionNote] = useState('');

  const handleViewDocument = (document) => {
    console.log('Ver documento', document);
    // Aquí se implementaría la lógica para visualizar el PDF
  };

  const handleApproveDocument = (documentId) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === documentId ? { ...doc, estatus: 'aprobado' } : doc
      )
    );
  };

  const openRejectionModal = (document) => {
    setSelectedDocument(document);
    setModalType('rejection');
    setModalOpen(true);
  };

  const handleRejectDocument = () => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === selectedDocument.id ? { ...doc, estatus: 'rechazado', notaRechazo: rejectionNote } : doc
      )
    );
    setModalOpen(false);
    setRejectionNote('');
  };

  const filteredDocuments = documents.filter(doc => 
    doc.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-semibold flex items-center text-gray-800">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 text-blue-600 mr-2"
              >
                <File size={24} />
              </motion.div>
              Gestión de Documentos
            </h2>
          </motion.div>

          {/* Search */}
          <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <motion.input
                initial={{ width: '80%', opacity: 0 }}
                animate={{ width: '100%', opacity: 1 }}
                type="text"
                placeholder="Buscar por matrícula o nombre de documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          {/* Table Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 mb-6"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Matrícula
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documento
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estatus
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {doc.matricula}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.nombre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.fecha}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {doc.estatus === 'pendiente' && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>}
                          {doc.estatus === 'aprobado' && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Aprobado</span>}
                          {doc.estatus === 'rechazado' && (
                            <div className="flex items-center">
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rechazado</span>
                              {doc.notaRechazo && (
                                <motion.div 
                                  whileHover={{ scale: 1.1 }}
                                  className="ml-2 cursor-pointer text-gray-500 hover:text-gray-700"
                                  onClick={() => {
                                    setSelectedDocument(doc);
                                    setModalType('viewNote');
                                    setModalOpen(true);
                                  }}
                                >
                                  <MessageSquare size={16} />
                                </motion.div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => handleViewDocument(doc)}
                            >
                              <Eye size={18} />
                            </motion.button>
                            
                            {doc.estatus === 'pendiente' && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="text-green-600 hover:text-green-800"
                                  onClick={() => handleApproveDocument(doc.id)}
                                >
                                  <CheckCircle size={18} />
                                </motion.button>
                                
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="text-red-600 hover:text-red-800"
                                  onClick={() => openRejectionModal(doc)}
                                >
                                  <XCircle size={18} />
                                </motion.button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        No se encontraron documentos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Mostrando {filteredDocuments.length} de {documents.length} registros
              </p>
            </div>
          </motion.div>

          {/* Modal para rechazo o visualización de notas */}
          {modalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 w-full max-w-md"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium flex items-center">
                    {modalType === 'rejection' ? (
                      <>
                        <XCircle className="text-red-500 mr-2" size={20} />
                        Rechazar Documento
                      </>
                    ) : (
                      <>
                        <MessageSquare className="text-blue-500 mr-2" size={20} />
                        Nota de Rechazo
                      </>
                    )}
                  </h3>
                  <button 
                    onClick={() => setModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
                
                {modalType === 'rejection' ? (
                  <>
                    <div className="mb-4">
                      <label htmlFor="rejection-note" className="block text-sm font-medium text-gray-700 mb-1">
                        Motivo del rechazo:
                      </label>
                      <textarea
                        id="rejection-note"
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ingrese el motivo del rechazo..."
                        value={rejectionNote}
                        onChange={(e) => setRejectionNote(e.target.value)}
                      ></textarea>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setModalOpen(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleRejectDocument}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                        disabled={!rejectionNote.trim()}
                      >
                        Rechazar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-4 bg-gray-50 p-3 rounded-md border border-gray-200">
                      <p className="text-gray-700">{selectedDocument?.notaRechazo}</p>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setModalOpen(false)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      >
                        Cerrar
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentManagement;