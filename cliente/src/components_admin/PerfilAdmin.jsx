import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Key, 
  Book, 
  Globe, 
  Accessibility, 
  GraduationCap, 
  Eye, 
  EyeOff 
} from 'lucide-react';

// FormInput Component
const FormInput = ({ icon: Icon, label, type = "text", value, onChange, options = [] }) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <label className="block text-gray-700 text-sm font-semibold mb-2">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        {type === "select" ? (
          <select
            value={value}
            onChange={onChange}
            className="form-select block w-full pl-10 pr-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
          >
            {options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : (
          <div className="relative">
            <input
              type={inputType}
              value={value}
              onChange={onChange}
              className="block w-full pl-10 pr-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
            {type === "password" && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Profile Component
export default function Profile() {
  const [formData, setFormData] = useState({
    nombre: 'Vlad example',
    apellidos: 'Zuckerberg example',
    matricula: '202500123',
    genero: 'Hombre',
    discapacidad: 'No',
    lenguaIndigena: 'No',
    programaEducativo: 'Ingeniería en Software',
    correo: 'estudiante@example.com',
    contrasena: '********',
    antiguaContrasena: '',
    nuevaContrasena: ''
  });

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica para guardar cambios
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
    >
      <motion.main
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Perfil de Usuario</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                icon={User}
                label="Nombre"
                value={formData.nombre}
                onChange={handleChange('nombre')}
              />
              <FormInput
                icon={User}
                label="Apellidos"
                value={formData.apellidos}
                onChange={handleChange('apellidos')}
              />
              <FormInput
                icon={GraduationCap}
                label="Matrícula"
                value={formData.matricula}
                onChange={handleChange('matricula')}
              />
              <FormInput
                icon={User}
                label="Género"
                type="select"
                value={formData.genero}
                onChange={handleChange('genero')}
                options={['Hombre', 'Mujer', 'Otro']}
              />
              <FormInput
                icon={Accessibility}
                label="¿Tienes alguna discapacidad?"
                type="select"
                value={formData.discapacidad}
                onChange={handleChange('discapacidad')}
                options={['No', 'Sí']}
              />
              <FormInput
                icon={Globe}
                label="¿Hablas alguna lengua indígena?"
                type="select"
                value={formData.lenguaIndigena}
                onChange={handleChange('lenguaIndigena')}
                options={['No', 'Sí']}
              />
              <FormInput
                icon={Book}
                label="Programa Educativo"
                type="select"
                value={formData.programaEducativo}
                onChange={handleChange('programaEducativo')}
                options={[ 
                  'Ingeniería Financiera',
                  'Ingeniería en Software',
                  'Licenciatura en Terapia Fisica',
                  'Ingeniería en Biotecnología',
                  'Licenciatura en Administración y Gestión Empresarial',
                  'Ingeniería Biomédica'
                ]}
              />
              <FormInput
                icon={Mail}
                label="Correo Electrónico"
                type="email"
                value={formData.correo}
                onChange={handleChange('correo')}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="border-t border-gray-200 pt-6 mt-8"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Cambiar Contraseña</h2>
              <div className="space-y-4">
                <FormInput
                  icon={Key}
                  label="Contraseña Actual"
                  type="password"
                  value={formData.antiguaContrasena}
                  onChange={handleChange('antiguaContrasena')}
                />
                <FormInput
                  icon={Key}
                  label="Nueva Contraseña"
                  type="password"
                  value={formData.nuevaContrasena}
                  onChange={handleChange('nuevaContrasena')}
                />
              </div>
            </motion.div>

            <motion.div
              className="flex justify-end mt-8"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                type="submit"
                className="px-6 py-3 bg-orange-600 text-white rounded-lg shadow-lg hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                Guardar Cambios
              </button>
            </motion.div>
          </form>
        </div>
      </motion.main>
    </motion.div>
  );
}