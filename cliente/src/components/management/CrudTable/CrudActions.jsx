// CrudActions.jsx debe tener este código
import { motion } from 'framer-motion';
import { Edit2, Trash2 } from 'react-feather';

const CrudActions = ({ onEdit, onDelete }) => (
  <div className="flex space-x-2">
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onEdit}
      className="flex items-center px-3 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
    >
      <Edit2 size={16} className="mr-1" />
      Editar
    </motion.button>
    
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onDelete}
      className="flex items-center px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
    >
      <Trash2 size={16} className="mr-1" />
      Eliminar
    </motion.button>
  </div>
);

export default CrudActions; // Asegurar exportación default    