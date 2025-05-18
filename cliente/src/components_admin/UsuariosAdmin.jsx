import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Upload, Plus, Edit2, X } from 'lucide-react';
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
    usersPerPage,
    rolFilter,
    setRolFilter
  } = useUsers();

  const [formMode, setFormMode] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  const uniqueRoles = ['Todos', 'estudiante', 'administrador', 'asesor_academico', 'asesor_empresarial'];

  const handleSubmit = (data) => {
    setConfirmData(data);
    if (formMode === 'import') {
      setConfirmAction('import');
    } else if (formMode === 'create') {
      setConfirmAction('create');
    } else if (formMode === 'edit') {
      setConfirmAction('edit');
    }
    setShowConfirmation(true);
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
      setShowConfirmation(false);
      setConfirmAction(null);
      setConfirmData(null);
    } catch (err) {
      console.error('Error en acción:', err);
    }
  };

  const handleCancelAction = () => {
    setShowConfirmation(false);
    setConfirmAction(null);
    setConfirmData(null);
  };

  const handleCancel = () => {
    setFormMode(null);
    setSelectedUser(null);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
      <Sidebar />

      <div className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-semibold flex items-center text-gray-800">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 text-blue-600 mr-2"
              >
                <Search size={24} />
              </motion.div>
              Gestión de Usuarios
            </h2>
          </motion.div>

          <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <motion.input
                  initial={{ width: '80%', opacity: 0 }}
                  animate={{ width: '100%', opacity: 1 }}
                  type="text"
                  placeholder="Buscar por correo..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              </div>
              <div className="relative">
                <motion.select
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  value={rolFilter}
                  onChange={(e) => setRolFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-sm"
              >
                <Plus size={18} className="mr-1" />
                Crear Usuario
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFormMode('import')}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors shadow-sm"
              >
                <Upload size={18} className="mr-1" />
                Importar CSV
              </motion.button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <div>
                {error.split('. ').map((msg, index) => (
                  <p key={index}>{msg}</p>
                ))}
              </div>
              <button onClick={resetMessages} className="mt-2 text-red-900 underline">
                Cerrar
              </button>
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <div>
                {success.split('. ').map((msg, index) => (
                  <p key={index}>{msg}</p>
                ))}
              </div>
              <button onClick={resetMessages} className="mt-2 text-green-900 underline">
                Cerrar
              </button>
            </div>
          )}

          {/* TABLA CON SCROLL HORIZONTAL FUNCIONAL */}
          <div className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6"
            >
              <div className="relative overflow-x-auto">
                <div className="min-w-[900px] w-full">
                  <UserTable
                    users={filteredUsers}
                    loading={loading}
                    error={error}
                    onEdit={(user) => {
                      setSelectedUser(user);
                      setFormMode('edit');
                    }}
                    onDelete={(id_user) => {
                      setConfirmData(id_user);
                      setConfirmAction('delete');
                      setShowConfirmation(true);
                    }}
                  />
                </div>
              </div>
              
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Mostrando {filteredUsers.length} de {totalUsers} registros
                </p>
              </div>
              
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
                        : 'bg-blue-500 text-white hover:bg-blue-600'
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
                            ? 'bg-blue-600 text-white'
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
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    Siguiente
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>

          {(formMode === 'create' || formMode === 'edit' || formMode === 'import') && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 w-full max-w-md"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium flex items-center">
                    {formMode === 'create' ? (
                      <>
                        <Plus className="text-blue-600 mr-2" />
                        Crear Nuevo Usuario
                      </>
                    ) : formMode === 'edit' ? (
                      <>
                        <Edit2 className="text-orange-500 mr-2" />
                        Editar Usuario
                      </>
                    ) : (
                      <>
                        <Upload className="text-yellow-500 mr-2" />
                        Importar Usuarios desde CSV
                      </>
                    )}
                  </h3>
                  <button
                    onClick={handleCancel}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                {formMode === 'import' ? (
                  <CSVUsuarios
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                  />
                ) : (
                  <UserForm
                    mode={formMode}
                    initialData={selectedUser || {}}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                  />
                )}
              </motion.div>
            </div>
          )}

          {showConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full mx-4"
              >
                <h3 className="text-lg font-semibold mb-3">Confirmar Acción</h3>
                <p className="text-gray-600 mb-6">
                  {confirmAction === 'delete' &&
                    '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.'}
                  {confirmAction === 'edit' &&
                    '¿Confirmas la actualización de los datos de este usuario?'}
                  {confirmAction === 'create' &&
                    '¿Confirmas la creación de este nuevo usuario?'}
                  {confirmAction === 'import' &&
                    '¿Confirmas la importación de usuarios desde el archivo seleccionado?'}
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleCancelAction}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmAction}
                    className={`px-4 py-2 text-white rounded-md hover:bg-opacity-90 transition-colors ${
                      confirmAction === 'delete' ? 'bg-red-500' : 'bg-blue-500'
                    }`}
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