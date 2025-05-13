import { motion } from 'framer-motion';
import { Edit2, Trash2 } from 'lucide-react';

const ProcesoTable = ({ procesos, loading, error, onEdit, onDelete }) => {
  if (loading) return <div className="text-center py-8">Cargando procesos...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  if (!procesos.length) return <div className="text-center py-8">No hay procesos registrados</div>;

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matrícula</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asesor</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Programa</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Proceso</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periodo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {procesos.map((proceso, index) => (
            <motion.tr
              key={proceso.id_proceso}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="hover:bg-gray-50"
            >
              <td className="px-6 py-4 truncate max-w-[150px] font-medium text-gray-900">
                {proceso.matricula}
              </td>
              <td className="px-6 py-4 truncate max-w-[200px] text-gray-500">
                {proceso.empresa_nombre || '-'}
              </td>
              <td className="px-6 py-4 truncate max-w-[150px] text-gray-500">
                {proceso.asesor_nombre}
              </td>
              <td className="px-6 py-4 truncate max-w-[200px] text-gray-500">
                {proceso.programa_nombre}
              </td>
              <td className="px-6 py-4 truncate max-w-[150px] text-gray-500">
                {proceso.tipo_proceso}
              </td>
              <td className="px-6 py-4 truncate max-w-[150px] text-gray-500">
                {proceso.periodo_nombre}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex space-x-2">
                  {/* <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onEdit(proceso)}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium rounded shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none"
                  >
                    <Edit2 size={14} className="mr-1" />
                    Editar
                  </motion.button> */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onDelete(proceso.id_proceso)}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium rounded shadow-sm text-white bg-red-500 hover:bg-red-600 focus:outline-none"
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

export default ProcesoTable;