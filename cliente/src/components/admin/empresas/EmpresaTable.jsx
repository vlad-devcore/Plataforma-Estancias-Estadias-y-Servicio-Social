import { motion } from 'framer-motion';
import { Edit2, Trash2 } from 'lucide-react';

const EmpresaTable = ({ empresas, loading, error, onEdit, onDelete }) => {
  if (loading) return <div className="text-center py-8">Cargando empresas...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  if (!empresas.length) return <div className="text-center py-8">No hay empresas registradas</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RFC</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamaño</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
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
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {empresa.empresa_rfc}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {empresa.empresa_nombre}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {empresa.empresa_email || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {empresa.empresa_telefono || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {empresa.empresa_tamano}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex space-x-2">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onEdit(empresa)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none"
                  >
                    <Edit2 size={14} className="mr-1" />
                    Editar
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onDelete(empresa.id_empresa)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-500 hover:bg-red-600 focus:outline-none"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Eliminar
                  </motion.button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmpresaTable;