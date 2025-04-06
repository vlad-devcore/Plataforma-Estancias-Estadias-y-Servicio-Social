// src/components/management/CrudTable/CrudPagination.jsx
import React from 'react';
import { motion } from 'framer-motion';

const CrudPagination = ({ total }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="px-6 py-3 bg-gray-50 border-t"
  >
    <p className="text-sm text-gray-500">
      Mostrando 1 a {total} de {total} registros
    </p>
  </motion.div>
);

export default CrudPagination;