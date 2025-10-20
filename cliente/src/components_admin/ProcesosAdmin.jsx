import { motion } from 'framer-motion';
import { Search, Briefcase, Edit2, X, ChevronDown, Download } from 'lucide-react';
import { useState } from 'react';
import useProcesos from '../components/hooks/useProcesos';
import ProcesoTable from '../components/admin/procesos/ProcesoTable';
import ProcesoForm from '../components/admin/procesos/ProcesoForm';
import Sidebar from '../components_admin/Sidebar';

const ProcesosAdmin = () => {
  const {
    filteredProcesos,
    loading,
    error,
    success,
    updateProceso,
    deleteProceso,
    resetMessages,
    currentPage,
    setCurrentPage,
    totalPages,
    totalProcesos,
    searchTerm,
    setSearchTerm,
    availablePeriodos,
    selectedPeriodo,
    setSelectedPeriodo,
    exportFilteredProcesos,
  } = useProcesos();

  const [formMode, setFormMode] = useState(null);
  const [selectedProceso, setSelectedProceso] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  const handleEdit = (proceso) => {
    setSelectedProceso(proceso);
    setFormMode('edit');
    resetMessages();
  };

  const handleDelete = (procesoId) => {
    setConfirmAction('delete');
    setConfirmData(procesoId);
    setShowConfirmation(true);
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmAction === 'delete') {
        await deleteProceso(confirmData);
      } else if (confirmAction === 'update') {
        await updateProceso(selectedProceso.id_proceso, confirmData);
      }
      setFormMode(null);
      setSelectedProceso(null);
      setShowConfirmation(false);
      setConfirmAction(null);
      setConfirmData(null);
    } catch (err) {
      console.error('Error al procesar la acción:', err);
    }
  };

  const handleCancelAction = () => {
    setShowConfirmation(false);
    setConfirmAction(null);
    setConfirmData(null);
    resetMessages();
  };

  const handleSubmit = async (data) => {
    setConfirmData(data);
    setConfirmAction('update');
    setShowConfirmation(true);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 overflow-x-auto">
        <div className="max-w-7xl mx-auto w-full">
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
                <Briefcase size={24} />
              </motion.div>
              Gestión de Procesos
            </h2>
          </motion.div>

          {/* 🆕 HEADER SIMPLIFICADO: BÚSQUEDA + PERIODO + EXPORT VERDE */}
          <div className="mb-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* 🔍 BÚSQUEDA */}
            <div className="relative flex-1 max-w-md">
              <motion.input
                initial={{ width: '80%', opacity: 0 }}
                animate={{ width: '100%', opacity: 1 }}
                type="text"
                placeholder="Buscar por matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>

            {/* 🆕 SOLO FILTRO DE PERIODOS (SIN "ACTIVO") */}
            <div className="relative w-full max-w-xs lg:max-w-sm">
              <motion.select
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                value={selectedPeriodo}
                onChange={(e) => setSelectedPeriodo(e.target.value)}
                disabled={loading || availablePeriodos.length === 0}
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none cursor-pointer"
              >
                <option value="">Todos los periodos</option>
                {availablePeriodos.map((periodo) => (
                  <option key={periodo.IdPeriodo} value={periodo.IdPeriodo}>
                    {periodo.Año} {periodo.Fase}
                  </option>
                ))}
              </motion.select>
              <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={18} />
            </div>

            {/* 🆕 BOTÓN EXPORT VERDE COMO ANTES */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={exportFilteredProcesos}
              disabled={loading || filteredProcesos.length === 0 || !selectedPeriodo}
              className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 whitespace-nowrap"
              title={`Exportar ${filteredProcesos.length} procesos del periodo ${selectedPeriodo}`}
            >
              <Download className="w-4 h-4" />
              Exportar {filteredProcesos.length}
            </motion.button>
          </div>

          {/* Mensajes */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <span>{error}</span>
              <button onClick={resetMessages} className="ml-2 text-red-900 underline">
                Cerrar
              </button>
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <span dangerouslySetInnerHTML={{ __html: success }} />
              <button onClick={resetMessages} className="ml-2 text-green-900 underline">
                Cerrar
              </button>
            </div>
          )}

          {/* Tabla */}
          <div className="w-full overflow-x-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 min-w-max"
            >
              <div className="overflow-x-auto">
                <ProcesoTable
                  procesos={filteredProcesos}
                  loading={loading}
                  error={error}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Mostrando {filteredProcesos.length} de {totalProcesos} registros 
                  {selectedPeriodo && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Periodo {selectedPeriodo}
                    </span>
                  )}
                </p>
              </div>
              {totalPages > 1 && (
                <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    Anterior
                  </motion.button>
                  <div className="flex flex-wrap justify-center gap-2">
                    {getPageNumbers().map(page => (
                      <motion.button
                        key={page}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {page}
                      </motion.button>
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      currentPage === totalPages
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    Siguiente
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Modal editar */}
          {formMode === 'edit' && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 w-full max-w-md"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Edit2 className="text-orange-500 mr-2" />
                    Editar Proceso
                  </h3>
                  <button
                    onClick={() => {
                      setFormMode(null);
                      setSelectedProceso(null);
                      resetMessages();
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                <ProcesoForm
                  initialData={selectedProceso || {}}
                  onSubmit={handleSubmit}
                  onCancel={() => {
                    setFormMode(null);
                    setSelectedProceso(null);
                    resetMessages();
                  }}
                />
              </motion.div>
            </div>
          )}

          {showConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full mx-4"
              >
                <h3 className="text-lg font-semibold mb-3">Confirmar Acción</h3>
                <p className="text-gray-600 mb-6">
                  {confirmAction === 'delete' &&
                    '¿Estás seguro de que deseas eliminar este proceso? Esta acción no se puede deshacer.'}
                  {confirmAction === 'update' &&
                    '¿Confirmas la actualización de los datos de este proceso?'}
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleCancelAction}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmAction}
                    className={`px-4 py-2 text-white rounded-md hover:bg-opacity-90 transition-colors ${
                      confirmAction === 'delete' ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                  >
                    Confirmar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcesosAdmin;