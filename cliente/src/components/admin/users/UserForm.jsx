import { motion } from 'framer-motion';
import { Upload, Plus, X } from 'lucide-react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useState, useEffect } from 'react';

const UserForm = ({
  mode = 'create',
  initialData = {},
  onSubmit,
  onCancel, // Añadimos onCancel como prop
  onFileUpload, // Mantenemos por compatibilidad, pero no lo usaremos
}) => {
  const [formData, setFormData] = useState(initialData);
  const [fileName, setFileName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === 'edit' || mode === 'create') {
      setFormData({
        email: initialData.email || '',
        password: initialData.password || '',
        confirmPassword: '', // Nuevo campo para confirmar contraseña
        nombre: initialData.nombre || '',
        apellido_paterno: initialData.apellido_paterno || '',
        apellido_materno: initialData.apellido_materno || '',
        genero: initialData.genero || '',
        role: initialData.role || '',
      });
    } else {
      setFormData({});
    }
    setErrors({});
  }, [mode, initialData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      const file = files[0];
      setFormData({ ...formData, file });
      setFileName(file ? file.name : '');
      setErrors({ ...errors, file: file ? '' : 'Por favor, selecciona un archivo CSV.' });
    } else {
      setFormData({ ...formData, [name]: value });
      // Validar campos al cambiar
      if (name === 'email') {
        setErrors({ ...errors, email: value ? '' : 'El correo es obligatorio.' });
      }
      if (name === 'nombre') {
        setErrors({ ...errors, nombre: value ? '' : 'El nombre es obligatorio.' });
      }
      if (name === 'apellido_paterno') {
        setErrors({ ...errors, apellido_paterno: value ? '' : 'El apellido paterno es obligatorio.' });
      }
      if (name === 'role') {
        setErrors({ ...errors, role: value ? '' : 'El rol es obligatorio.' });
      }
      if (name === 'password' && mode === 'create') {
        setErrors({
          ...errors,
          password: value ? '' : 'La contraseña es obligatoria.',
          confirmPassword:
            formData.confirmPassword && value !== formData.confirmPassword
              ? 'Las contraseñas no coinciden.'
              : errors.confirmPassword,
        });
      }
      if (name === 'confirmPassword' && mode === 'create') {
        setErrors({
          ...errors,
          confirmPassword: value
            ? value === formData.password
              ? ''
              : 'Las contraseñas no coinciden.'
            : 'Debes confirmar la contraseña.',
        });
      }
    }
  };

  const handleClearFile = () => {
    setFormData({ ...formData, file: null });
    setFileName('');
    setErrors({ ...errors, file: 'Por favor, selecciona un archivo CSV.' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (mode !== 'import') {
      newErrors.email = !formData.email ? 'El correo es obligatorio.' : '';
      newErrors.nombre = !formData.nombre ? 'El nombre es obligatorio.' : '';
      newErrors.apellido_paterno = !formData.apellido_paterno ? 'El apellido paterno es obligatorio.' : '';
      newErrors.role = !formData.role ? 'El rol es obligatorio.' : '';
      if (mode === 'create') {
        newErrors.password = !formData.password ? 'La contraseña es obligatoria.' : '';
        newErrors.confirmPassword = !formData.confirmPassword
          ? 'Debes confirmar la contraseña.'
          : formData.password !== formData.confirmPassword
          ? 'Las contraseñas no coinciden.'
          : '';
      }
    } else {
      newErrors.file = !formData.file ? 'Por favor, selecciona un archivo CSV.' : '';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    const isValid = Object.values(validationErrors).every((error) => !error);
    if (isValid) {
      if (mode === 'import') {
        onSubmit({ file: formData.file });
      } else {
        // Excluir confirmPassword del objeto enviado
        const { confirmPassword, ...submitData } = formData;
        onSubmit(submitData);
      }
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
              {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
              <p className="text-sm text-gray-500 text-center">
                CSV hasta 10MB. Columnas requeridas: email, password, nombre, apellido_paterno, role
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!formData.file}
              className={`py-2 px-4 rounded-md flex items-center justify-center transition-colors ${
                formData.file
                  ? 'bg-purple-500 text-white hover:bg-purple-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Upload className="mr-2" size={18} />
              Importar Usuarios
            </motion.button>
          </div>
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.nombre ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.apellido_paterno ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.apellido_paterno && (
              <p className="text-red-500 text-sm mt-1">{errors.apellido_paterno}</p>
            )}
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.role ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Seleccionar rol</option>
              <option value="administrador">Administrador</option>
              <option value="asesor_academico">Asesor Académico</option>
              <option value="asesor_empresarial">Asesor Empresarial</option>
              <option value="estudiante">Estudiante</option>
            </motion.select>
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
          </div>
          {mode === 'create' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password || ''}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  <span
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </span>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword || ''}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  <span
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </span>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </>
          )}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition-colors flex items-center justify-center"
            >
              <Plus className="mr-2" size={18} />
              {mode === 'create' ? 'Crear Usuario' : 'Actualizar Usuario'}
            </motion.button>
          </div>
        </>
      )}
    </form>
  );
};

export default UserForm;