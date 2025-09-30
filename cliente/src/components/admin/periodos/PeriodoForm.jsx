import { motion } from 'framer-motion';
import { Plus, Save } from 'lucide-react';
import { useState } from 'react';

const PeriodoForm = ({ mode, initialData = {}, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    Año: initialData.Año || '',
    FechaInicio: initialData.FechaInicio || '',
    FechaFin: initialData.FechaFin || '',
    EstadoActivo: initialData.EstadoActivo || 'Activo',
    Fase: initialData.Fase || 'ENERO-ABRIL',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.Año) newErrors.Año = 'El año es obligatorio.';
    if (!formData.FechaInicio) newErrors.FechaInicio = 'La fecha de inicio es obligatoria.';
    if (!formData.FechaFin) newErrors.FechaFin = 'La fecha de fin es obligatoria.';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: value ? '' : `${name} es obligatorio.` });
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
        <motion.input
          whileFocus={{ scale: 1.02 }}
          type="number"
          name="Año"
          value={formData.Año}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md bg-blue-50 ${
            errors.Año ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
        {errors.Año && <p className="text-red-500 text-sm mt-1">{errors.Año}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="date"
            name="FechaInicio"
            value={formData.FechaInicio}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md bg-blue-50 ${
              errors.FechaInicio ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.FechaInicio && <p className="text-red-500 text-sm mt-1">{errors.FechaInicio}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin</label>
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="date"
            name="FechaFin"
            value={formData.FechaFin}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md bg-blue-50 ${
              errors.FechaFin ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.FechaFin && <p className="text-red-500 text-sm mt-1">{errors.FechaFin}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <motion.select
            whileFocus={{ scale: 1.02 }}
            name="EstadoActivo"
            value={formData.EstadoActivo}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50"
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </motion.select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fase</label>
          <motion.select
            whileFocus={{ scale: 1.02 }}
            name="Fase"
            value={formData.Fase}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50"
          >
            <option value="ENERO-ABRIL">ENERO-ABRIL</option>
            <option value="MAYO-AGOSTO">MAYO-AGOSTO</option>
            <option value="SEPTIEMBRE-DICIEMBRE">SEPTIEMBRE-DICIEMBRE</option>
          </motion.select>
        </div>
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
          {mode === 'edit' ? (
            <>
              <Save className="mr-2" size={18} />
              Guardar Cambios
            </>
          ) : (
            <>
              <Plus className="mr-2" size={18} />
              Crear Periodo
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
};

export default PeriodoForm;