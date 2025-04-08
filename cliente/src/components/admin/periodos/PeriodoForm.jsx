import { motion } from 'framer-motion';
import { Plus, Save } from 'lucide-react';
import { useState } from 'react';

const PeriodoForm = ({ initialData = {}, onSubmit }) => {
  const [formData, setFormData] = useState({
    Año: initialData.Año || '',
    FechaInicio: initialData.FechaInicio || '',
    FechaFin: initialData.FechaFin || '',
    EstadoActivo: initialData.EstadoActivo || 'Activo',
    Fase: initialData.Fase || 'ENERO-ABRIL',
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
        <motion.input
          whileFocus={{ scale: 1.02 }}
          type="number"
          name="Año"
          value={formData.Año}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50"
          required
        />
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin</label>
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="date"
            name="FechaFin"
            value={formData.FechaFin}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50"
            required
          />
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

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center"
      >
        {initialData.IdPeriodo ? (
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
    </form>
  );
};

export default PeriodoForm;
