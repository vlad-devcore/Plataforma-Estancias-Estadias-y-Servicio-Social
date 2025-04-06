// src/components/management/forms/ImportForm.jsx
import { motion } from 'framer-motion';
import AnimatedIcon from '../icons/AnimatedIcon';
import { Upload } from 'react-feather'; // Importación faltante

const ImportForm = ({ title, description, onImport, icon }) => ( // Quitar Upload de los props
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-lg shadow-sm p-6"
  >
    <motion.h3 className="text-lg font-medium mb-4 flex items-center">
      <AnimatedIcon>
        {icon || <Upload className="text-yellow-500 mr-2" size={20} />}
      </AnimatedIcon>
      {title}
    </motion.h3>
    
    <motion.div className="border-2 border-dashed rounded-lg p-8">
      <div className="flex flex-col items-center space-y-2">
        <motion.div whileHover={{ scale: 1.1 }} className="p-3 rounded-full bg-gray-50">
          <Upload className="h-8 w-8 text-gray-400" />
        </motion.div>
        <span className="text-orange-500">Seleccionar archivo</span>
        <span className="text-sm text-gray-500">{description}</span>
      </div>
    </motion.div>
    
    <motion.button 
      whileHover={{ scale: 1.05 }}
      className="w-full mt-4 bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600"
    >
      <Upload className="mr-2" />
      Importar
    </motion.button>
  </motion.div>
);

export default ImportForm;