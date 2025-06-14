import { motion } from 'framer-motion';
import { Search, Plus, Building, Edit2, X, Upload } from 'lucide-react';
import { useState } from 'react';
import useEmpresas from '../components/hooks/useEmpresas';
import EmpresaTable from '../components/admin/empresas/EmpresaTable';
import EmpresaForm from '../components/admin/empresas/EmpresaForm';
import CSVEmpresas from '../components/admin/empresas/CSVEmpresas';
import Sidebar from '../components_admin/Sidebar';

const EmpresaManagement = () => {
  const {
    companies: empresas,
    loading,
    error,
    success,
    createEmpresa,
    updateEmpresa,
    deleteEmpresa,
    createEmpresasFromCSV,
    resetMessages,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCompanies,
    searchTerm,
    setSearchTerm,
    sociedadFilter,
    setSociedadFilter
  } = useEmpresas();

  const [formMode, setFormMode] = useState(null);
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  const handleEdit = (empresa) => {
    setSelectedEmpresa(empresa);
    setFormMode('edit');
  };

  const handleDelete = (empresaId) => {
    setConfirmAction('delete');
    setConfirmData(empresaId);
    setShowConfirmation(true);
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmAction === 'delete') {
        await deleteEmpresa(confirmData);
      } else if (confirmAction === 'update') {
        await updateEmpresa(selectedEmpresa.id_empresa, confirmData);
      } else if (confirmAction === 'create') {
        await createEmpresa(confirmData);
      } else if (confirmAction === 'import') {
        await createEmpresasFromCSV(confirmData.file);
      }
      setFormMode(null);
      setSelectedEmpresa(null);
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
    if (formMode === 'edit') {
      setConfirmAction('update');
    } else if (formMode === 'create') {
      setConfirmAction('create');
    } else if (formMode === 'import') {
      setConfirmAction('import');
    }
    setShowConfirmation(true);
  };

  const filteredEmpresas = Array.isArray(empresas) ? empresas.filter((empresa) => {
    const matchesSearch =
      empresa.empresa_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empresa.empresa_rfc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSociedad =
      sociedadFilter === 'Todas' || empresa.empresa_sociedad === sociedadFilter;
    return matchesSearch && matchesSociedad;
  }) : [];

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

      <div className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
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
                <Building size={24} />
              </motion.div>
              Gestión de Empresas
            </h2>
          </motion.div>

          <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <motion.input
                  initial={{ width: '80%', opacity: 0 }}
                  animate={{ width: '100%', opacity: 1 }}
                  type="text"
                  placeholder="Buscar por nombre o RFC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              </div>
              <div className="relative">
                <motion.select
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  value={sociedadFilter}
                  onChange={(e) => setSociedadFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Todas">Todas</option>
                  <option value="Privada">Privada</option>
                  <option value="Pública">Pública</option>
                </motion.select>
              </div>
            </div>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedEmpresa(null);
                  setFormMode('create');
                  resetMessages();
                }}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-sm"
              >
                <Plus size={18} className="mr-1" />
                Crear Empresa
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setFormMode('import');
                  resetMessages();
                }}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors shadow-sm"
              >
                <Upload size={18} className="mr-1" />
                Importar CSV
              </motion.button>
            </div>
          </div>

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

          {/* TABLA CON SCROLL HORIZONTAL CORREGIDA */}
          <div className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6"
            >
              <div className="relative overflow-x-auto">
                <div className="min-w-[900px] w-full">
                  <EmpresaTable
                    empresas={filteredEmpresas}
                    loading={loading}
                    error={error}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              </div>
              
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Mostrando {filteredEmpresas.length} de {totalCompanies} registros
                </p>
              </div>
              
              {totalPages > 1 && (
                <div className="px-6 py-4 flex justify-between items-center">
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
                  <div className="flex space-x-2">
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

          {(formMode === 'create' || formMode === 'edit' || formMode === 'import') && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 w-full max-w-md"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium flex items-center">
                    {formMode === 'create' ? (
                      <>
                        <Plus className="text-blue-600 mr-2" />
                        Crear Nueva Empresa
                      </>
                    ) : formMode === 'edit' ? (
                      <>
                        <Edit2 className="text-orange-500 mr-2" />
                        Editar Empresa
                      </>
                    ) : (
                      <>
                        <Upload className="text-yellow-500 mr-2" />
                        Importar Empresas desde CSV
                      </>
                    )}
                  </h3>
                  <button
                    onClick={() => {
                      setFormMode(null);
                      setSelectedEmpresa(null);
                      resetMessages();
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                {formMode === 'import' ? (
                  <CSVEmpresas
                    onSubmit={handleSubmit}
                    onCancel={() => {
                      setFormMode(null);
                      setSelectedEmpresa(null);
                      resetMessages();
                    }}
                  />
                ) : (
                  <EmpresaForm
                    initialData={selectedEmpresa || {}}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                      setFormMode(null);
                      setSelectedEmpresa(null);
                      resetMessages();
                    }}
                  />
                )}
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
                    '¿Estás seguro de que deseas eliminar esta empresa? Esta acción no se puede deshacer.'}
                  {confirmAction === 'update' &&
                    '¿Confirmas la actualización de los datos de esta empresa?'}
                  {confirmAction === 'create' &&
                    '¿Confirmas la creación de esta nueva empresa?'}
                  {confirmAction === 'import' &&
                    '¿Confirmas la importación de empresas desde el archivo seleccionado?'}
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

export default EmpresaManagement;