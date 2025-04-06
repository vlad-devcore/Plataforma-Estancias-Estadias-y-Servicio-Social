import { motion } from 'framer-motion';
import ManagementIcon from './icons/ManagementIcon';

const CrudLayout = ({ title, icon, children }) => (
  <div className="min-h-screen bg-gray-50 p-8">
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto"
    >
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-semibold flex items-center text-gray-800">
          <ManagementIcon icon={icon} />
          {title}
        </h2>
      </motion.div>
      {children}
    </motion.div>
  </div>
);

export default CrudLayout;