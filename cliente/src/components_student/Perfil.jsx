import React, { useState } from 'react'; 
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Key, 
  Book, 
  Globe, 
  Accessibility, 
  GraduationCap, 
  Eye, 
  EyeOff, 
  Menu, 
  X 
  
} from 'lucide-react';


const NavLink = ({ text, to, isMobile = false, isActive, onClick }) => (
  <motion.a
    onClick={onClick}
    whileHover={{ scale: isMobile ? 1 : 1.05 }}
    className={`relative cursor-pointer ${isMobile ? 'block w-full px-4 py-3 text-white hover:bg-white/10 transition-colors text-lg' : 'px-4 py-2 group text-sm md:text-base'}`}
    style={{
      color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
      backgroundColor: isActive ? '#FF7F32' : 'transparent',
      borderRadius: '0.375rem',
    }}
  >
    <span className={`relative z-10 ${isMobile ? '' : 'group-hover:text-white transition-colors'}`}>
      {text}
    </span>
    {!isMobile && (
      <motion.div
        className="absolute inset-0 bg-white/10 rounded-lg"
        initial={false}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      />
    )}
  </motion.a>
);


const MobileMenu = ({ isOpen, onClose, onNavigate, activePath }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, x: "100%" }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className="fixed inset-y-0 right-0 w-64 bg-orange-600 shadow-xl z-50" //color de barra de menu 
      >
        <div className="flex justify-end p-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-white"
          >
            <X className="h-6 w-6" />
          </motion.button>
        </div>
        <div className="flex flex-col">
          <NavLink text="Inicio" to="/home" isMobile isActive={activePath === '/home'} onClick={() => onNavigate('/home')} />
          <NavLink text="Empresas" to="/empresas" isMobile isActive={activePath === '/empresas'} onClick={() => onNavigate('/empresas')} />
          <NavLink text="Perfil" to="/perfil" isMobile isActive={activePath === '/perfil'} onClick={() => onNavigate('/perfil')} />
          <NavLink text="Cerrar Sesión" to="/" isMobile isActive={activePath === '/'} onClick={() => onNavigate('/')} />
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);


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

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const handleNavigation = (path) => {
    setIsMobileMenuOpen(false);
    document.body.style.opacity = '0';
    setTimeout(() => {
      navigate(path);
      document.body.style.opacity = '1';
    }, 200);
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
    >
      <nav className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16 sm:h-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <img src="/logo192.png" alt="Logo" className="h-16 sm:h-20 w-auto" />
            </motion.div>
            
            
            <div className="hidden md:flex space-x-2">
              <NavLink text="Inicio" to="/home" isActive={location.pathname === '/home'} onClick={() => handleNavigation('/home')} />
              <NavLink text="Empresas" to="/empresas" isActive={location.pathname === '/empresas'} onClick={() => handleNavigation('/empresas')} />
              <NavLink text="Perfil" to="/perfil" isActive={location.pathname === '/perfil'} onClick={() => handleNavigation('/perfil')} />
              <NavLink text="Cerrar Sesión" to="/" isActive={location.pathname === '/'} onClick={() => handleNavigation('/')} />
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-white"
            >
              <Menu className="h-6 w-6" />
            </motion.button>
          </div>
        </div>
      </nav>

     
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onNavigate={handleNavigation}
        activePath={location.pathname}
      />

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
