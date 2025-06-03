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
    const maxPagesToShow = window.innerWidth < 640 ? 3 : 5; // Menos páginas en móvil
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

      <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {/* HEADER RESPONSIVO */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 sm:mb-6"
          >
            <h2 className="text-xl sm:text-2xl font-semibold flex items-center text-gray-800">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2"
              >
                <Search size={20} className="sm:hidden" />
                <Search size={24} className="hidden sm:block" />
              </motion.div>
              <span className="truncate">Gestión de Usuarios</span>
            </h2>
          </motion.div>

          {/* CONTROLES SUPERIORES COMPLETAMENTE RESPONSIVOS */}
          <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
            {/* FILA 1: BÚSQUEDA Y FILTRO */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <motion.input
                  initial={{ width: '80%', opacity: 0 }}
                  animate={{ width: '100%', opacity: 1 }}
                  type="text"
                  placeholder="Buscar por correo..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
                <Search className="absolute left-2.5 sm:left-3 top-2 sm:top-2.5 text-gray-400" size={16} />
              </div>
              <div className="relative w-full sm:w-auto sm:min-w-[180px]">
                <motion.select
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  value={rolFilter}
                  onChange={(e) => setRolFilter(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                >
                  {uniqueRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </motion.select>
              </div>
            </div>
            
            {/* FILA 2: BOTONES DE ACCIÓN */}
            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFormMode('create')}
                className="flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-sm text-sm sm:text-base font-medium"
              >
                <Plus size={16} className="mr-1 sm:mr-2" />
                <span className="whitespace-nowrap">Crear Usuario</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFormMode('import')}
                className="flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors shadow-sm text-sm sm:text-base font-medium"
              >
                <Upload size={16} className="mr-1 sm:mr-2" />
                <span className="whitespace-nowrap">Importar CSV</span>
              </motion.button>
            </div>
          </div>

          {/* MENSAJES DE ERROR Y ÉXITO RESPONSIVOS */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-4 text-sm sm:text-base"
            >
              <div className="space-y-1">
                {error.split('. ').map((msg, index) => (
                  <p key={index} className="break-words">{msg}</p>
                ))}
              </div>
              <button 
                onClick={resetMessages} 
                className="mt-2 text-red-900 underline text-sm hover:no-underline"
              >
                Cerrar
              </button>
            </motion.div>
          )}
          
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-100 border border-green-400 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-4 text-sm sm:text-base"
            >
              <div className="space-y-1">
                {success.split('. ').map((msg, index) => (
                  <p key={index} className="break-words">{msg}</p>
                ))}
              </div>
              <button 
                onClick={resetMessages} 
                className="mt-2 text-green-900 underline text-sm hover:no-underline"
              >
                Cerrar
              </button>
            </motion.div>
          )}

          {/* TABLA CON SCROLL HORIZONTAL MEJORADO */}
          <div className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6"
            >
              {/* CONTENEDOR DE TABLA CON SCROLL OPTIMIZADO */}
              <div className="relative">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <div className="min-w-[800px] sm:min-w-[900px]">
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
                
                {/* INDICADOR DE SCROLL EN MÓVIL */}
                <div className="sm:hidden absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-50"></div>
              </div>
              
              {/* INFORMACIÓN DE REGISTROS */}
              <div className="px-3 sm:px-6 py-2 sm:py-3 bg-gray-50 border-t border-gray-200">
                <p className="text-xs sm:text-sm text-gray-500">
                  Mostrando <span className="font-medium">{filteredUsers.length}</span> de <span className="font-medium">{totalUsers}</span> registros
                </p>
              </div>
              
              {/* PAGINACIÓN RESPONSIVA */}
              {totalPages > 1 && (
                <div className="px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    Anterior
                  </motion.button>
                  
                  <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-1">
                    {getPageNumbers().map(page => (
                      <motion.button
                        key={page}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePageChange(page)}
                        className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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

          {/* MODAL COMPLETAMENTE RESPONSIVO */}
          {(formMode === 'create' || formMode === 'edit' || formMode === 'import') && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-3 sm:p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-[95vw] sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto"
              >
                {/* HEADER DEL MODAL */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base sm:text-lg font-medium flex items-center">
                      {formMode === 'create' ? (
                        <>
                          <Plus className="text-blue-600 mr-2 flex-shrink-0" size={18} />
                          <span className="truncate">Crear Nuevo Usuario</span>
                        </>
                      ) : formMode === 'edit' ? (
                        <>
                          <Edit2 className="text-orange-500 mr-2 flex-shrink-0" size={18} />
                          <span className="truncate">Editar Usuario</span>
                        </>
                      ) : (
                        <>
                          <Upload className="text-yellow-500 mr-2 flex-shrink-0" size={18} />
                          <span className="truncate">Importar CSV</span>
                        </>
                      )}
                    </h3>
                    <button
                      onClick={handleCancel}
                      className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                
                {/* CONTENIDO DEL MODAL */}
                <div className="px-4 sm:px-6 py-4 sm:py-6">
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
                </div>
              </motion.div>
            </div>
          )}

          {/* MODAL DE CONFIRMACIÓN RESPONSIVO */}
          {showConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-lg shadow-lg max-w-[90vw] sm:max-w-md w-full mx-4"
              >
                <div className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-3">Confirmar Acción</h3>
                  <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                    {confirmAction === 'delete' &&
                      '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.'}
                    {confirmAction === 'edit' &&
                      '¿Confirmas la actualización de los datos de este usuario?'}
                    {confirmAction === 'create' &&
                      '¿Confirmas la creación de este nuevo usuario?'}
                    {confirmAction === 'import' &&
                      '¿Confirmas la importación de usuarios desde el archivo seleccionado?'}
                  </p>
                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                    <button
                      onClick={handleCancelAction}
                      className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-sm sm:text-base"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmAction}
                      className={`w-full sm:w-auto px-4 py-2 text-white rounded-md hover:bg-opacity-90 transition-colors text-sm sm:text-base ${
                        confirmAction === 'delete' ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                    >
                      Confirmar
                    </button>
                  </div>
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