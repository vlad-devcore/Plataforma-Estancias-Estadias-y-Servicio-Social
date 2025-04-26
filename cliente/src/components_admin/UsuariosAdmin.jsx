import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Upload, Plus, Edit2 } from 'lucide-react';
import UserTable from '../components/admin/users/UserTable';
import UserForm from '../components/admin/users/UserForm';
import CSVUsuarios from '../components/admin/users/CSVUsuarios';
import useUsers from '../components/hooks/useUsers';
import Sidebar from './Sidebar';

const UserManagement = () => {
  const {
    filteredUsers,
    loading,
    error,
    success,
    setSearchTerm,
    createUser,
    updateUser,
    deleteUser,
    createUsersFromCSV,
    resetMessages,
    currentPage,
    setCurrentPage,
    totalPages,
    totalUsers,
    usersPerPage
  } = useUsers();

  const [formMode, setFormMode] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const [rolFilter, setRolFilter] = useState('Todos');

  // Extraer roles únicos de los usuarios
  const uniqueRoles = ['Todos', ...new Set(filteredUsers.map(user => user.role))];

  const handleSubmit = (data) => {
    setConfirmData(data);
    if (formMode === 'import') {
      setConfirmAction('import');
    } else if (formMode === 'create') {
      setConfirmAction('create');
    } else if (formMode === 'edit') {
      setConfirmAction('edit');
    }
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmAction === 'create') {
        await createUser(confirmData);
      } else if (confirmAction === 'edit') {
        await updateUser(selectedUser.id_user, confirmData);
      } else if (confirmAction === 'delete') {
        await deleteUser(confirmData);
      } else if (confirmAction === 'import') {
        await createUsersFromCSV(confirmData.file);
      }
      setFormMode(null);
      setSelectedUser(null);
      setConfirmAction(null);
      setConfirmData(null);
    } catch (err) {
      console.error('Error en acción:', err);
    }
  };

  const handleCancel = () => {
    setFormMode(null);
    setSelectedUser(null);
    setConfirmAction(null);
    setConfirmData(null);
  };

  // Filtrar usuarios por rol
  const filteredUsersWithRol = filteredUsers.filter((user) => {
    const matchesRol = rolFilter === 'Todos' || user.role === rolFilter;
    return matchesRol;
  });

  // Cambiar página
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generar números de página
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="w-full mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-semibold flex items-center text-gray-800">
              <Search className="text-purple-600 mr-2" size={24} />
              Gestión de Usuarios
            </h2>
          </motion.div>

          {/* Search, Filter, and Actions */}
          <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <motion.input
                  initial={{ width: '80%', opacity: 0 }}
                  animate={{ width: '100%', opacity: 1 }}
                  type="text"
                  placeholder="Buscar por correo..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              </div>
              <div className="relative">
                <motion.select
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  value={rolFilter}
                  onChange={(e) => setRolFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {uniqueRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </motion.select>
              </div>
            </div>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFormMode('create')}
                className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors shadow-sm"
              >
                <Plus size={18} className="mr-1" />
                Crear Usuario
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFormMode('import')}
                className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors shadow-sm"
              >
                <Upload size={18} className="mr-1" />
                Importar CSV
              </motion.button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
              <button onClick={resetMessages} className="ml-2 text-red-900 underline">
                Cerrar
              </button>
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
              <button onClick={resetMessages} className="ml-2 text-green-900 underline">
                Cerrar
              </button>
            </div>
          )}

          {/* Layout flexible: tabla y formulario */}
          <div className="flex flex-col lg:flex-row gap-6 w-full">
            <div className="fle
x-1 min-w-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm overflow-x-auto border border-gray-200"
              >
                <UserTable
                  users={filteredUsersWithRol}
                  loading={loading}
                  error={error}
                  onEdit={(user) => {
                    setSelectedUser(user);
                    setFormMode('edit');
                  }}
                  onDelete={(id_user) => {
                    setConfirmData(id_user);
                    setConfirmAction('delete');
                  }}
                />
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Mostrando {filteredUsersWithRol.length} de {totalUsers} registros
                  </p>
                </div>
                {/* Controles de paginación */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 flex justify-between items-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        currentPage === 1
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-purple-500 text-white hover:bg-purple-600'
                      }`}
                    >
                      Anterior
                    </motion.button>
                    <div className="flex space-x-2">
                      {getPageNumbers().map(page => (
                        <motion.button
                          key={page}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${
                            currentPage === page
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {page}
                        </motion.button>
                      ))}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        currentPage === totalPages
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-purple-500 text-white hover:bg-purple-600'
                      }`}
                    >
                      Siguiente
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </div>

            {(formMode === 'create' || formMode === 'edit' || formMode === 'import') && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 w-full lg:w-2/5 overflow-y-auto max-h-[calc(100vh-100px)]"
              >
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  {formMode === 'create' && <Plus className="text-purple-600 mr-2" />}
                  {formMode === 'edit' && <Edit2 className="text-orange-500 mr-2" />}
                  {formMode === 'import' && <Upload className="text-yellow-500 mr-2" />}
                  {formMode === 'create'
                    ? 'Crear Usuario'
                    : formMode === 'edit'
                    ? 'Editar Usuario'
                    : 'Importar Usuarios desde CSV'}
                </h3>
                {formMode === 'import' ? (
                  <CSVUsuarios onSubmit={handleSubmit} onCancel={handleCancel} />
                ) : (
                  <UserForm
                    mode={formMode}
                    initialData={selectedUser || {}}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                  />
                )}
              </motion.div>
            )}
          </div>

          {/* Confirmation Modal */}
          {confirmAction && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full mx-4"
              >
                <h3 className="text-lg font-semibold mb-3">Confirmar Acción</h3>
                <p className="text-gray-600 mb-6">
                  {confirmAction === 'delete'
                    ? '¿Estás seguro de que deseas eliminar este usuario?'
                    : confirmAction === 'import'
                    ? '¿Confirmas la importación de usuarios desde el archivo seleccionado?'
                    : `¿Confirmas ${confirmAction === 'create' ? 'la creación' : 'la actualización'} del usuario?`}
                </p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmAction}
                    className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                  >
                    Confirmar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;