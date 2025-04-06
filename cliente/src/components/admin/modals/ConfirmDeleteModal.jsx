import { motion } from 'framer-motion';
import { Trash2, X, Loader } from 'react-feather';
import { useState } from 'react';

const ConfirmDeleteModal = ({ itemId, itemName, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirm(itemId); // ✅ Recibe el ID específico
      onClose();
    } catch (err) {
      console.error('Error al eliminar:', err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-white rounded-lg p-6 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Confirmar Eliminación</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <p className="mb-6">
          ¿Estás seguro de eliminar al usuario: 
          <span className="font-semibold text-red-600"> {itemName}</span>?
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
          >
            {loading ? (
              <Loader className="animate-spin mr-2" size={18} />
            ) : (
              <Trash2 className="mr-2" size={18} />
            )}
            Eliminar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmDeleteModal;