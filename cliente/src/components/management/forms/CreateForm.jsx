// src/components/management/forms/CreateForm.jsx
import React from 'react';
import { motion } from 'framer-motion';
import AnimatedIcon from '../icons/AnimatedIcon';
import { Plus } from 'react-feather'; // Importación directa del ícono

const CreateForm = ({ title, fields, icon = <Plus /> }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm p-6"
    >
      <motion.h3 className="text-lg font-medium mb-4 flex items-center">
        <AnimatedIcon>
          {React.cloneElement(icon, {
            className: `text-purple-600 ${icon.props.className || ''}`,
            size: 20
          })}
        </AnimatedIcon>
        {title}
      </motion.h3>

      {/* Resto del formulario */}
    </motion.div>
  );
};

export default CreateForm;