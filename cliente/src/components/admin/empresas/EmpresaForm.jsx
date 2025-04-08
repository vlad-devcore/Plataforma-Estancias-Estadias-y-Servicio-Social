import { motion } from 'framer-motion';
import { Plus, Save } from 'lucide-react';
import { useState } from 'react';

const EmpresaForm = ({ 
  initialData = {}, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState({
    empresa_rfc: initialData.empresa_rfc || '',
    empresa_nombre: initialData.empresa_nombre || '',
    empresa_direccion: initialData.empresa_direccion || '',
    empresa_email: initialData.empresa_email || '',
    empresa_telefono: initialData.empresa_telefono || '',
    empresa_tamano: initialData.empresa_tamano || 'Mediana',
    empresa_sociedad: initialData.empresa_sociedad || 'SA de CV',
    empresa_pagina_web: initialData.empresa_pagina_web || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">RFC</label>
        <motion.input
          whileFocus={{ scale: 1.02 }}
          type="text"
          name="empresa_rfc"
          value={formData.empresa_rfc}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
        <motion.input
          whileFocus={{ scale: 1.02 }}
          type="text"
          name="empresa_nombre"
          value={formData.empresa_nombre}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
        <motion.input
          whileFocus={{ scale: 1.02 }}
          type="text"
          name="empresa_direccion"
          value={formData.empresa_direccion}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="email"
            name="empresa_email"
            value={formData.empresa_email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="tel"
            name="empresa_telefono"
            value={formData.empresa_telefono}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tamaño</label>
          <motion.select
            whileFocus={{ scale: 1.02 }}
            name="empresa_tamano"
            value={formData.empresa_tamano}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50"
          >
            <option value="Pequeña">Pequeña</option>
            <option value="Mediana">Mediana</option>
            <option value="Grande">Grande</option>
          </motion.select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sociedad</label>
          <motion.select
            whileFocus={{ scale: 1.02 }}
            name="empresa_sociedad"
            value={formData.empresa_sociedad}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50"
          >
            <option value="SA de CV">SA de CV</option>
            <option value="S de RL">S de RL</option>
            <option value="SC">SC</option>
            <option value="Otro">Otro</option>
          </motion.select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Página Web</label>
        <motion.input
          whileFocus={{ scale: 1.02 }}
          type="url"
          name="empresa_pagina_web"
          value={formData.empresa_pagina_web}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50"
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center"
      >
        {initialData.id_empresa ? (
          <>
            <Save className="mr-2" size={18} />
            Guardar Cambios
          </>
        ) : (
          <>
            <Plus className="mr-2" size={18} />
            Crear Empresa
          </>
        )}
      </motion.button>
    </form>
  );
};

export default EmpresaForm;