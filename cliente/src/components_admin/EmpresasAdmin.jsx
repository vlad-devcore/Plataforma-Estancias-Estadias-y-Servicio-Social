import { motion } from 'framer-motion';
import { Search, Plus, Building, Edit2, X, Upload } from 'lucide-react';
import { useState } from 'react';
import useEmpresas from '../components/hooks/useEmpresas';
import EmpresaTable from '../components/admin/empresas/EmpresaTable';
import EmpresaForm from '../components/admin/empresas/EmpresaForm';
import Sidebar from '../components_admin/Sidebar';

const EmpresaManagement = () => {
  const {
    companies: empresas,
    loading,
    error,
    createEmpresa,
    updateEmpresa,
    deleteEmpresa,
  } = useEmpresas();

  const [formMode, setFormMode] = useState(null);
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sociedadFilter, setSociedadFilter] = useState('Todas');
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
  };

  const handleSubmit = async (data) => {
    setConfirmData(data);
    if (formMode === 'edit') {
      setConfirmAction('update');
    } else if (formMode === 'create') {
      setConfirmAction('create');
    }
    setShowConfirmation(true);
  };

  const filteredEmpresas = empresas.filter((empresa) => {
    const matchesSearch =
      empresa.empresa_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empresa.empresa_rfc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSociedad =
      sociedadFilter === 'Todas' || empresa.empresa_sociedad === sociedadFilter;
    return matchesSearch && matchesSociedad;
  });

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
                <Building size={24} />
              </motion.div>
              Gestión de Empresas
            </h2>
          </motion.div>

          {/* Search, Filter, and Actions */}
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
                }}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-sm"
              >
                <Plus size={18} className="mr-1" />
                Crear Empresa
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFormMode('import')}
                className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors shadow-sm"
              >
                <Upload size={18} className="mr-1" />
                Importar CSV
              </motion.button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Table Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 mb-6"
          >
            <EmpresaTable
              empresas={filteredEmpresas}
              loading={loading}
              error={error}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Mostrando {filteredEmpresas.length} de {empresas.length} registros
              </p>
            </div>
          </motion.div>

          {/* Form Modal */}
          {(formMode === 'create' || formMode === 'edit') && (
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
                    ) : (
                      <>
                        <Edit2 className="text-orange-500 mr-2" />
                        Editar Empresa
                      </>
                    )}
                  </h3>
                  <button
                    onClick={() => {
                      setFormMode(null);
                      setSelectedEmpresa(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                <EmpresaForm
                  initialData={selectedEmpresa || {}}
                  onSubmit={handleSubmit}
                  onCancel={() => {
                    setFormMode(null);
                    setSelectedEmpresa(null);
                  }}
                />
              </motion.div>
            </div>
          )}

          {/* Modal de Confirmación */}
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