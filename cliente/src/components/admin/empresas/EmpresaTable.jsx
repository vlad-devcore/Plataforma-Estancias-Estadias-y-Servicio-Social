import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';

const EmpresaTable = ({ empresas, loading, error, onEdit, onDelete }) => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);

  const handleOpenModal = (empresa) => {
    setSelectedEmpresa(empresa);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedEmpresa(null);
  };

  if (loading) return <div className="text-center py-8">Cargando empresas...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  if (!empresas.length) return <div className="text-center py-8">No hay empresas registradas</div>;

  return (
    <>
      <div className="w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RFC</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {empresas.map((empresa, index) => (
              <motion.tr
                key={empresa.id_empresa}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 truncate max-w-[150px] font-medium text-gray-900">
                  {empresa.empresa_rfc}
                </td>
                <td className="px-6 py-4 truncate max-w-[200px] text-gray-500">
                  {empresa.empresa_nombre}
                </td>
                <td className="px-6 py-4 truncate max-w-[200px] text-gray-500">
                  {empresa.empresa_email || '-'}
                </td>
                <td className="px-6 py-4 truncate max-w-[150px] text-gray-500">
                  {empresa.empresa_telefono || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onEdit(empresa)}
                      className="inline-flex items-center px-3 py-1 text-xs font-medium rounded shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none"
                    >
                      <Edit2 size={14} className="mr-1" />
                      Editar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onDelete(empresa.id_empresa)}
                      className="inline-flex items-center px-3 py-1 text-xs font-medium rounded shadow-sm text-white bg-red-500 hover:bg-red-600 focus:outline-none"
                    >
                      <Trash2 size={14} className="mr-1" />
                      Eliminar
                    </motion.button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleOpenModal(empresa)}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium rounded shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none"
                  >
                    <Eye size={14} className="mr-1" />
                     Detalles
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalles */}
      <AnimatePresence>
        {openModal && selectedEmpresa && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-800">Detalles de la Empresa</h3>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>RFC:</strong> {selectedEmpresa.empresa_rfc}
                </p>
                <p>
                  <strong>Nombre:</strong> {selectedEmpresa.empresa_nombre}
                </p>
                <p>
                  <strong>Email:</strong> {selectedEmpresa.empresa_email || '-'}
                </p>
                <p>
                  <strong>Teléfono:</strong> {selectedEmpresa.empresa_telefono || '-'}
                </p>
                <p>
                  <strong>Tamaño:</strong> {selectedEmpresa.empresa_tamano}
                </p>
                <p>
                  <strong>Sociedad:</strong> {selectedEmpresa.empresa_sociedad}
                </p>
              </div>
              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCloseModal}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded shadow-sm text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none"
                >
                  Cerrar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EmpresaTable;