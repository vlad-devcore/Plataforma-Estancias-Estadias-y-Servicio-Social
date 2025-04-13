import { motion } from 'framer-motion';
import { Plus, CalendarClock } from 'lucide-react';
import { useState } from 'react';
import Sidebar from '../components_admin/Sidebar';
import PeriodoTable from '../components/admin/periodos/PeriodoTable';
import PeriodoForm from '../components/admin/periodos/PeriodoForm';
import usePeriodos from '../components/hooks/usePeriodos';

const PeriodoManagement = () => {
  const {
    periodos,
    loading,
    error,
    createPeriodo,
    updatePeriodo,
    deletePeriodo,
  } = usePeriodos();

  const [formMode, setFormMode] = useState(null);
  const [selectedPeriodo, setSelectedPeriodo] = useState(null);

  const handleEdit = (periodo) => {
    setSelectedPeriodo(periodo);
    setFormMode('edit');
  };

  const handleSubmit = async (data) => {
    try {
      if (formMode === 'edit') {
        await updatePeriodo(selectedPeriodo.IdPeriodo, data);
      } else if (formMode === 'create') {
        await createPeriodo(data);
      }

      setFormMode(null);
      setSelectedPeriodo(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="w-full mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-semibold flex items-center text-gray-800">
              <CalendarClock className="text-purple-600 mr-2" size={24} />
              Gestión de Periodos
            </h2>
          </motion.div>

          {/* Botón de Crear */}
          <div className="mb-6 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFormMode('create')}
              className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors shadow-sm"
            >
              <Plus size={18} className="mr-1" />
              Crear Periodo
            </motion.button>
          </div>

          {/* Layout flexible: la tabla ocupa todo el ancho si no se muestra el formulario; si se muestra, usamos flex */}
          <div className="flex flex-col lg:flex-row gap-8 w-full">
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm overflow-x-auto border border-gray-200 w-full"
              >
                <PeriodoTable
                  periodos={periodos}
                  loading={loading}
                  error={error}
                  onEdit={handleEdit}
                  onDelete={deletePeriodo}
                />
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Mostrando {periodos.length} de {periodos.length} registros
                  </p>
                </div>
              </motion.div>
            </div>

            {formMode && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 w-full lg:w-1/3"
              >
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  {formMode === 'create' && <Plus className="text-purple-600 mr-2" />}
                  {formMode === 'edit' && <CalendarClock className="text-orange-500 mr-2" />}
                  {formMode === 'create' ? 'Crear Periodo' : 'Editar Periodo'}
                </h3>
                <PeriodoForm
                  mode={formMode}
                  initialData={selectedPeriodo || {}}
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

export default PeriodoManagement;
