import { motion } from 'framer-motion';
import { Upload, Plus, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const UserForm = ({
  mode = 'create',
  initialData = {},
  onSubmit,
  onFileUpload, // Mantenemos por compatibilidad, pero no lo usaremos
}) => {
  const [formData, setFormData] = useState(initialData);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (mode === 'edit' || mode === 'create') {
      setFormData({
        email: initialData.email || '',
        password: initialData.password || '',
        nombre: initialData.nombre || '',
        apellido_paterno: initialData.apellido_paterno || '',
        apellido_materno: initialData.apellido_materno || '',
        genero: initialData.genero || '',
        role: initialData.role || '',
      });
    } else {
      setFormData({});
    }
  }, [mode, initialData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      const file = files[0];
      setFormData({ ...formData, file });
      setFileName(file ? file.name : '');
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleClearFile = () => {
    setFormData({ ...formData, file: null });
    setFileName('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'import') {
      if (!formData.file) {
        alert('Por favor, selecciona un archivo CSV.');
        return;
      }
      onSubmit({ file: formData.file });
    } else {
      if (!formData.email || !formData.nombre || !formData.apellido_paterno || !formData.role) {
        alert('Por favor, completa todos los campos obligatorios.');
        return;
      }
      if (mode === 'create' && !formData.password) {
        alert('La contraseña es obligatoria para crear un usuario.');
        return;
      }
      console.log('Datos enviados:', formData);
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'import' ? (
        <>
          <div className="border-2 border-dashed rounded-lg p-6 bg-gray-50">
            <div className="flex flex-col items-center space-y-2">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
                className="p-3 rounded-full bg-gray-100"
              >
                <Upload className="h-8 w-8 text-purple-500" />
              </motion.div>
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-purple-500 hover:text-purple-600 font-medium"
              >
                Seleccionar archivo CSV
              </label>
              <input
                type="file"
                id="file-upload"
                name="file"
                accept=".csv"
                onChange={handleChange}
                className="hidden"
              />
              {fileName && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{fileName}</span>
                  <button
                    type="button"
                    onClick={handleClearFile}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <p className="text-sm text-gray-500 text-center">
                CSV hasta 10MB. Columnas requeridas: email, password, nombre, apellido_paterno, role
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!formData.file}
            className={`w-full py-2 px-4 rounded-md flex items-center justify-center transition-colors ${
              formData.file
                ? 'bg-purple-500 text-white hover:bg-purple-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Upload className="mr-2" size={18} />
            Importar Usuarios
          </motion.button>
        </>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              name="nombre"
              value={formData.nombre || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido Paterno
            </label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              name="apellido_paterno"
              value={formData.apellido_paterno || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido Materno
            </label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              name="apellido_materno"
              value={formData.apellido_materno || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Género
            </label>
            <motion.select
              whileFocus={{ scale: 1.02 }}
              name="genero"
              value={formData.genero || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Seleccionar género</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </motion.select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <motion.select
              whileFocus={{ scale: 1.02 }}
              name="role"
              value={formData.role || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Seleccionar rol</option>
              <option value="administrador">Administrador</option>
              <option value="asesor_academico">Asesor Académico</option>
              <option value="asesor_empresarial">Asesor Empresarial</option>
              <option value="estudiante">Estudiante</option>
            </motion.select>
          </div>
          {mode === 'create' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="password"
                name="password"
                value={formData.password || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition-colors flex items-center justify-center"
          >
            <Plus className="mr-2" size={18} />
            {mode === 'create' ? 'Crear Usuario' : 'Actualizar Usuario'}
          </motion.button>
        </>
      )}
    </form>
  );
};

export default UserForm;