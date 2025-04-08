import { motion } from 'framer-motion';
import { Search, Plus, Building, Edit2 } from 'lucide-react';
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
    updateEmpresa,
    deleteEmpresa
  } = useEmpresas();

  const [formMode, setFormMode] = useState(null);
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleEdit = (empresa) => {
    setSelectedEmpresa(empresa);
    setFormMode('edit');
  };

  const handleSubmit = async (data) => {
    try {
      if (formMode === 'edit') {
        await updateEmpresa(selectedEmpresa.id_empresa, data);
      }
      setFormMode(null);
      setSelectedEmpresa(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredEmpresas = empresas.filter(empresa => 
    empresa.empresa_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.empresa_rfc.toLowerCase().includes(searchTerm.toLowerCase())
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
                <Building size={24} />
              </motion.div>
              Gestión de Empresas
            </h2>
          </motion.div>

          {/* Search and Actions */}
          <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
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
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Table Section */}
            <div className={`lg:col-span-${formMode ? '2' : '3'}`}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
              >
                <EmpresaTable 
                  empresas={filteredEmpresas} 
                  loading={loading}
                  error={error}
                  onEdit={handleEdit}
                  onDelete={deleteEmpresa}
                />
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Mostrando {filteredEmpresas.length} de {empresas.length} registros
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Form Sidebar */}
            {formMode && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
              >
                <h3 className="text-lg font-medium mb-4 flex items-center">
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
                <EmpresaForm 
                  initialData={selectedEmpresa || {}} 
                  onSubmit={handleSubmit}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpresaManagement;