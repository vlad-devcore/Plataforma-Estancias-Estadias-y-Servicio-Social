import { motion } from 'framer-motion';
import { X, Save, Loader } from 'react-feather';
import { useState, useEffect } from 'react';

const EditUserModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState(user);
  const [loading, setLoading] = useState(false);

  // Loggear datos iniciales al abrir el modal
  useEffect(() => {
    console.log('🔄 Datos iniciales del usuario:', JSON.parse(JSON.stringify(user)));
    setFormData(user);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      console.log('📝 Campo modificado:', { 
        field: name, 
        valor: value,
        datosActuales: JSON.parse(JSON.stringify(newData))
      });
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('📤 Enviando datos al servidor:', JSON.parse(JSON.stringify(formData)));
      
      await onSave(formData);
      
      console.log('✅ Cambios guardados exitosamente');
      onClose();
    } catch (err) {
      console.error('❌ Error al guardar cambios:', {
        error: err.message,
        datosEnviados: JSON.parse(JSON.stringify(formData))
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-white rounded-lg p-6 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Editar Usuario</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            disabled={loading} 
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Correo electrónico</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Rol</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              disabled={loading}
            >
              <option value="estudiante">Estudiante</option>
              <option value="administrador">Administrador</option>
              <option value="asesor_academico">Asesor Académico</option>
              <option value="asesor_empresarial">Asesor Empresarial</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 flex items-center disabled:opacity-75"
            >
              {loading ? (
                <Loader className="animate-spin mr-2" size={18} />
              ) : (
                <Save className="mr-2" size={18} />
              )}
              Guardar Cambios
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditUserModal;