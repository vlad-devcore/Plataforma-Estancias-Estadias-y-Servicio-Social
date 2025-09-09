import { motion } from 'framer-motion';
import { Plus, Save } from 'lucide-react';
import { useState } from 'react';

const EmpresaForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    empresa_nombre: initialData.empresa_nombre || '',
    empresa_direccion: initialData.empresa_direccion || '',
    empresa_email: initialData.empresa_email || '',
    empresa_telefono: initialData.empresa_telefono || '',
    empresa_tamano: initialData.empresa_tamano || 'Mediana',
    empresa_sociedad: initialData.empresa_sociedad || 'Privada',
    empresa_pagina_web: initialData.empresa_pagina_web || '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.empresa_nombre) newErrors.empresa_nombre = 'El nombre es obligatorio.';
    if (!formData.empresa_tamano) newErrors.empresa_tamano = 'El tamaño es obligatorio.';
    if (!formData.empresa_sociedad) newErrors.empresa_sociedad = 'La sociedad es obligatoria.';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: value ? '' : `${name.replace('empresa_', '').replace('_', ' ')} es obligatorio.` });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
        <motion.input
          whileFocus={{ scale: 1.02 }}
          type="text"
          name="empresa_nombre"
          value={formData.empresa_nombre}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md bg-blue-50 ${
            errors.empresa_nombre ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
        {errors.empresa_nombre && <p className="text-red-500 text-sm mt-1">{errors.empresa_nombre}</p>}
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
            className={`w-full px-3 py-2 border rounded-md bg-blue-50 ${
              errors.empresa_tamano ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Seleccionar tamaño</option>
            <option value="Pequeña">Pequeña</option>
            <option value="Mediana">Mediana</option>
            <option value="Grande">Grande</option>
          </motion.select>
          {errors.empresa_tamano && <p className="text-red-500 text-sm mt-1">{errors.empresa_tamano}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sociedad</label>
          <motion.select
            whileFocus={{ scale: 1.02 }}
            name="empresa_sociedad"
            value={formData.empresa_sociedad}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md bg-blue-50 ${
              errors.empresa_sociedad ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Seleccionar sociedad</option>
            <option value="Privada">Privada</option>
            <option value="Pública">Pública</option>
          </motion.select>
          {errors.empresa_sociedad && <p className="text-red-500 text-sm mt-1">{errors.empresa_sociedad}</p>}
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

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
        >
          Cancelar
        </button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center"
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
      </div>
    </form>
  );
};

export default EmpresaForm;