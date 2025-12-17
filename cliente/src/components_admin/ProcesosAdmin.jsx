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

          {/* Header */}
          <div className="mb-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-md">
              <motion.input
                initial={{ width: '80%', opacity: 0 }}
                animate={{ width: '100%', opacity: 1 }}
                type="text"
                placeholder="Buscar por matrícula..."
                value={searchTerm}
                onChange={(e) => {
                  setCurrentPage(1);
                  setSearchTerm(e.target.value);
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>

            {/* Periodos */}
            <div className="relative w-full max-w-xs lg:max-w-sm">
              <motion.select
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                value={selectedPeriodo}
                onChange={(e) => {
                  setCurrentPage(1);
                  setSelectedPeriodo(e.target.value);
                }}
                disabled={loading || availablePeriodos.length === 0}
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none cursor-pointer"
              >
                <option value="">Todos los periodos</option>
                {availablePeriodos.map((periodo) => (
                  <option
                    key={periodo.IdPeriodo}
                    value={String(periodo.IdPeriodo)}
                  >
                    {periodo.Año} {periodo.Fase}
                  </option>
                ))}
              </motion.select>
              <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={18} />
            </div>

            {/* Exportar */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={exportFilteredProcesos}
              disabled={loading || filteredProcesos.length === 0 || !selectedPeriodo}
              className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Exportar Procesos
            </motion.button>
          </div>

          {/* Mensajes */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
              <button onClick={resetMessages} className="ml-2 underline">
                Cerrar
              </button>
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
              <button onClick={resetMessages} className="ml-2 underline">
                Cerrar
              </button>
            </div>
          )}

          {/* Tabla */}
          <ProcesoTable
            procesos={filteredProcesos}
            loading={loading}
            error={error}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Anterior
              </button>
              <span>
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Siguiente
              </button>
            </div>
          )}

          {/* Modal edición */}
          {formMode === 'edit' && (
            <ProcesoForm
              initialData={selectedProceso || {}}
              onSubmit={handleSubmit}
              onCancel={() => {
                setFormMode(null);
                setSelectedProceso(null);
                resetMessages();
              }}
            />
          )}

          {/* Confirmación */}
          {showConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg">
                <p>
                  {confirmAction === 'delete'
                    ? '¿Eliminar este proceso?'
                    : '¿Confirmar actualización?'}
                </p>
                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={handleCancelAction}>Cancelar</button>
                  <button onClick={handleConfirmAction}>Confirmar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcesosAdmin;       
