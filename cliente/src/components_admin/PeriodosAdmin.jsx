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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  const handleEdit = (periodo) => {
    setSelectedPeriodo(periodo);
    setFormMode('edit');
  };

  const handleDelete = (periodoId) => {
    setConfirmAction('delete');
    setConfirmData(periodoId);
    setShowConfirmation(true);
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmAction === 'delete') {
        await deletePeriodo(confirmData);
      } else if (confirmAction === 'update') {
        await updatePeriodo(selectedPeriodo.IdPeriodo, confirmData);
        setFormMode(null);
        setSelectedPeriodo(null);
      } else if (confirmAction === 'create') {
        await createPeriodo(confirmData);
        setFormMode(null);
        setSelectedPeriodo(null);
      }
    } catch (err) {
      console.error(err);
    }
    setShowConfirmation(false);
    setConfirmAction(null);
    setConfirmData(null);
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
                  onDelete={handleDelete}
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
              {confirmAction === 'delete' && '¿Estás seguro de que deseas eliminar este periodo? Esta acción no se puede deshacer.'}
              {confirmAction === 'update' && '¿Confirmas la actualización de los datos de este periodo?'}
              {confirmAction === 'create' && '¿Confirmas la creación de este nuevo periodo?'}
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
                  confirmAction === 'delete' ? 'bg-red-500' : 'bg-purple-500'
                }`}
              >
                Confirmar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PeriodoManagement;