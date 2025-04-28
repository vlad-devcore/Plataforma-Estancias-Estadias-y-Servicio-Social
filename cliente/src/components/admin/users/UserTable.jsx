import { motion } from 'framer-motion';
import { Edit2, Trash2 } from 'lucide-react';

const UserTable = ({ users, loading, error, onEdit, onDelete }) => {
  if (loading) return <div className="text-center py-8 text-gray-500">Cargando usuarios...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  if (!users.length) return <div className="text-center py-8 text-gray-500">No hay usuarios registrados</div>;

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Correo Electrónico
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rol
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user, index) => (
            <motion.tr
              key={user.id_user}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="hover:bg-gray-50"
            >
              <td className="px-6 py-4 truncate max-w-[200px] font-medium text-gray-900">
                {user.email}
              </td>
              <td className="px-6 py-4 truncate max-w-[200px] text-gray-500">
                {user.nombre} {user.apellido_paterno} {user.apellido_materno || ''}
              </td>
              <td className="px-6 py-4 truncate max-w-[120px] text-gray-500">
                {user.role}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onEdit(user)}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium rounded shadow-sm text-white bg-purple-500 hover:bg-purple-600 focus:outline-none"
                  >
                    <Edit2 size={14} className="mr-1" />
                    Editar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onDelete(user.id_user)}
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

export default UserTable;