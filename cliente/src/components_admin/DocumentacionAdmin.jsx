import { motion } from 'framer-motion';
import { Search, Eye, CheckCircle, XCircle, File, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import Sidebar from './Sidebar';
import useDocumentosAdmin from '../components/hooks/useDocumentosAdmin';

const DocumentManagement = () => {
  const {
    documents,
    periodos,
    loading,
    error,
    success,
    approveDocument,
    rejectDocument,
    updateFilters,
    resetMessages,
  } = useDocumentosAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [rejectionNote, setRejectionNote] = useState('');
  
  // Nuevos estados para los mensajes de confirmación
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalType, setConfirmModalType] = useState('');

  const handleViewDocument = (document) => {
    console.log('Ver documento', document);
    window.open(`http://localhost:9999/api/documentos/download/${document.id_Documento}`, '_blank');
  };

<<<<<<< Updated upstream
  const openConfirmApproveModal = (document) => {
=======
  // Modificado para mostrar confirmación antes de aprobar
  const openApproveConfirmation = (document) => {
    setSelectedDocument(document);
    setConfirmModalType('approve');
    setConfirmModalOpen(true);
  };

  const handleApproveDocument = () => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === selectedDocument.id ? { ...doc, estatus: 'aprobado' } : doc
      )
    );
    setConfirmModalOpen(false);
  };

  const openRejectionModal = (document) => {
>>>>>>> Stashed changes
    setSelectedDocument(document);
    setModalType('confirmApprove');
    setModalOpen(true);
  };

  const openConfirmRejectModal = (document) => {
    setSelectedDocument(document);
    setModalType('confirmReject');
    setModalOpen(true);
  };

  const handleApproveDocument = async () => {
    if (selectedDocument) {
      await approveDocument(selectedDocument.id_Documento);
      setModalOpen(false);
    }
  };

  const openRejectionModal = () => {
    setModalType('rejection');
    // No cerramos el modal, solo cambiamos el tipo
  };

  const handleRejectDocument = async () => {
    if (selectedDocument) {
      await rejectDocument(selectedDocument.id_Documento, rejectionNote);
      setModalOpen(false);
      setRejectionNote('');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    updateFilters({ [name]: value === 'Todos' ? '' : value });
  };

  const filteredDocuments = documents.filter(doc => 
    doc.Matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.Nombre_TipoDoc.toLowerCase().includes(searchTerm.toLowerCase())
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

          {/* Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
              <button onClick={resetMessages} className="ml-2 text-red-900 underline">Cerrar</button>
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
              <button onClick={resetMessages} className="ml-2 text-green-900 underline">Cerrar</button>
            </div>
          )}

          {/* Filters and Search */}
          <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
            {/* Filtro por Estatus */}
            <div className="flex-1">
              <label htmlFor="estatus" className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por Estatus
              </label>
              <select
                id="estatus"
                name="estatus"
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Todos">Todos</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </div>

            {/* Filtro por Periodo */}
            <div className="flex-1">
              <label htmlFor="idPeriodo" className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por Periodo
              </label>
              <select
                id="idPeriodo"
                name="idPeriodo"
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Todos">Todos</option>
                {periodos.map((periodo) => (
                  <option key={periodo.IdPeriodo} value={periodo.IdPeriodo}>
                    {periodo.Año} - {periodo.Fase}
                  </option>
                ))}
              </select>
            </div>

            {/* Búsqueda */}
            <div className="relative flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <motion.input
                initial={{ width: '80%', opacity: 0 }}
                animate={{ width: '100%', opacity: 1 }}
                id="search"
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
                      Estatus
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                        Cargando...
                      </td>
                    </tr>
                  ) : filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc) => (
                      <tr key={doc.id_Documento} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {doc.Matricula}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.Nombre_TipoDoc}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {doc.Estatus === 'Pendiente' && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>}
                          {doc.Estatus === 'Aprobado' && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Aprobado</span>}
                          {doc.Estatus === 'Rechazado' && (
                            <div className="flex items-center">
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rechazado</span>
                              {doc.Comentarios && (
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
                              disabled={loading}
                            >
                              <Eye size={18} />
                            </motion.button>
                            
                            {doc.Estatus === 'Pendiente' && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="text-green-600 hover:text-green-800"
<<<<<<< Updated upstream
                                  onClick={() => openConfirmApproveModal(doc)}
                                  disabled={loading}
=======
                                  onClick={() => openApproveConfirmation(doc)}
>>>>>>> Stashed changes
                                >
                                  <CheckCircle size={18} />
                                </motion.button>
                                
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="text-red-600 hover:text-red-800"
                                  onClick={() => openConfirmRejectModal(doc)}
                                  disabled={loading}
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
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
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

          {/* Modal para confirmaciones, rechazo o visualización de notas */}
          {modalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 w-full max-w-md"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium flex items-center">
                    {modalType === 'confirmApprove' ? (
                      <>
                        <CheckCircle className="text-green-500 mr-2" size={20} />
                        Confirmar Aprobación
                      </>
                    ) : modalType === 'confirmReject' ? (
                      <>
                        <XCircle className="text-red-500 mr-2" size={20} />
                        Confirmar Rechazo
                      </>
                    ) : modalType === 'rejection' ? (
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
                
                {modalType === 'confirmApprove' ? (
                  <>
                    <p className="text-gray-700 mb-4">
                      ¿Estás seguro de que deseas aprobar el documento "{selectedDocument?.Nombre_TipoDoc}" de la matrícula {selectedDocument?.Matricula}?
                    </p>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setModalOpen(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleApproveDocument}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                        disabled={loading}
                      >
                        Aprobar
                      </button>
                    </div>
                  </>
                ) : modalType === 'confirmReject' ? (
                  <>
                    <p className="text-gray-700 mb-4">
                      ¿Estás seguro de que deseas rechazar el documento "{selectedDocument?.Nombre_TipoDoc}" de la matrícula {selectedDocument?.Matricula}?
                    </p>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setModalOpen(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={openRejectionModal}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                        disabled={loading}
                      >
                        Continuar
                      </button>
                    </div>
                  </>
                ) : modalType === 'rejection' ? (
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
                        disabled={!rejectionNote.trim() || loading}
                      >
                        Rechazar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-4 bg-gray-50 p-3 rounded-md border border-gray-200">
                      <p className="text-gray-700">{selectedDocument?.Comentarios}</p>
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

          {/* Modal de Confirmación para Aprobar/Rechazar */}
          {confirmModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 w-full max-w-md"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium flex items-center">
                    {confirmModalType === 'approve' && (
                      <>
                        <CheckCircle className="text-green-500 mr-2" size={20} />
                        Confirmar Aprobación
                      </>
                    )}
                  </h3>
                  <button 
                    onClick={() => setConfirmModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-700">
                    {confirmModalType === 'approve' && 
                      `¿Está seguro que desea aprobar el documento "${selectedDocument?.nombre}" con matrícula ${selectedDocument?.matricula}?`
                    }
                  </p>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setConfirmModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  {confirmModalType === 'approve' && (
                    <button
                      onClick={handleApproveDocument}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                      Confirmar
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentManagement;