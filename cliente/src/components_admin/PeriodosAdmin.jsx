import { motion } from 'framer-motion';
import { Plus, CalendarClock, X } from 'lucide-react';
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
    success,
    createPeriodo,
    updatePeriodo,
    deletePeriodo,
    resetMessages,
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
      } else if (confirmAction === 'create') {
        await createPeriodo(confirmData);
      }
      setFormMode(null);
      setSelectedPeriodo(null);
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

  const handleCancelForm = () => {
    setFormMode(null);
    setSelectedPeriodo(null);
    resetMessages();
  };

  const handleSubmit = (data) => {
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

      {/* Contenedor principal responsivo */}
      <div className="flex-1 p-4 md:p-8 overflow-x-auto">
        <div className="max-w-7xl mx-auto w-full">
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
                className="w-6 h-6 text-purple-600 mr-2"
              >
                <CalendarClock size={24} />
              </motion.div>
              Gestión de Periodos
            </h2>
          </motion.div>

          {/* Botón de Crear */}
          <div className="mb-6 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedPeriodo(null);
                setFormMode('create');
                resetMessages();
              }}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-sm"
            >
              <Plus size={18} className="mr-1" />
              Crear Periodo
            </motion.button>
          </div>

          {/* Messages */}
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
              <span>{success}</span>
              <button onClick={resetMessages} className="ml-2 text-green-900 underline">
                Cerrar
              </button>
            </div>
          )}

          {/* Sección de la tabla con scroll horizontal */}
          <div className="w-full overflow-x-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 min-w-max"
            >
              {/* Contenedor de la tabla con scroll horizontal */}
              <div className="overflow-x-auto">
                <PeriodoTable
                  periodos={periodos}
                  loading={loading}
                  error={error}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
              
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Mostrando {periodos.length} de {periodos.length} registros
                </p>
              </div>
            </motion.div>
          </div>

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
                        Crear Nuevo Periodo
                      </>
                    ) : (
                      <>
                        <CalendarClock className="text-orange-500 mr-2" />
                        Editar Periodo
                      </>
                    )}
                  </h3>
                  <button
                    onClick={handleCancelForm}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                <PeriodoForm
                  mode={formMode}
                  initialData={formMode === 'create' ? {} : selectedPeriodo}
                  onSubmit={handleSubmit}
                  onCancel={handleCancelForm}
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

export default PeriodoManagement;