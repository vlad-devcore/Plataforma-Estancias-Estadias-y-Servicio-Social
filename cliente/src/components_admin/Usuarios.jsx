import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Upload, Plus, Edit2, Trash2 } from 'lucide-react';

const UserTable = () => {
  const users = [
    { email: 'armand.franecki@example.org', role: 'Administrador' },
    { email: 'asesor@example.org', role: 'Asesor Academico' },
    { email: 'marcos.vladimir@example.org', role: 'Asesor Empresarial' },
    { email: 'marcos@prueba.org', role: 'Estudiantes' },
    { email: 'testestudiante@outlook.es', role: 'Estudiantes' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-lg shadow-sm overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-gray-500 font-medium tracking-wider">Correo Electrónico</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium tracking-wider">Rol</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user, index) => (
              <motion.tr 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.role}</td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center px-3 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                    >
                      <Edit2 size={16} className="mr-1" />
                      Editar
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Eliminar
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="px-6 py-3 bg-gray-50 border-t"
      >
        <p className="text-sm text-gray-500">Mostrando 1 a 5 de 5 registros</p>
      </motion.div>
    </motion.div>
  );
};

const CreateUserForm = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white rounded-lg shadow-sm p-6"
    >
      <motion.h3 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="text-lg font-medium mb-4 flex items-center"
      >
        <Plus className="text-purple-600 mr-2" />
        Crear Usuario Individual
      </motion.h3>
      <motion.form 
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo Electrónico
          </label>
          <motion.input
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50"
            placeholder="armand.franecki@example.org"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <motion.input
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50"
            placeholder="********"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de usuario
          </label>
          <motion.select
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50"
          >
            <option>Administrador</option>
            <option>Asesor Academico</option>
            <option>Asesor Empresarial</option>
            <option>Estudiantes</option>
          </motion.select>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
          type="submit"
          className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center"
        >
          <Plus className="mr-2" />
          Crear Usuario
        </motion.button>
      </motion.form>
    </motion.div>
  );
};

const ImportUsers = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-white rounded-lg shadow-sm p-6"
    >
      <motion.h3 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="text-lg font-medium mb-4 flex items-center"
      >
        <Upload className="text-yellow-500 mr-2" />
        Importar Usuarios
      </motion.h3>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="border-2 border-dashed rounded-lg p-8"
      >
        <div className="flex flex-col items-center space-y-2">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
            className="p-3 rounded-full bg-gray-50"
          >
            <Upload className="h-8 w-8 text-gray-400" />
          </motion.div>
          <span className="text-orange-500">Seleccionar archivo</span>
          <span className="text-sm text-gray-500">CSV hasta 10MB</span>
        </div>
      </motion.div>
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full mt-4 bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center"
      >
        <Upload className="mr-2" />
        Importar Usuarios
      </motion.button>
    </motion.div>
  );
};

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-7xl mx-auto"
      >
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-semibold flex items-center text-gray-800">
            <motion.svg 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="w-6 h-6 text-purple-600 mr-2" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </motion.svg>
            Gestión de Usuarios
          </h2>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-6 flex justify-end"
        >
          <div className="relative">
            <motion.input
              initial={{ width: '80%', opacity: 0 }}
              animate={{ width: '100%', opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-8"
        >
          <UserTable />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="grid md:grid-cols-2 gap-8"
        >
          <CreateUserForm />
          <ImportUsers />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UserManagement;