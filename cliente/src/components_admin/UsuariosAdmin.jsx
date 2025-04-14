import { motion } from 'framer-motion';
import { Search, Plus, Upload, Users, Edit2 } from 'lucide-react';
import { useState } from 'react';
import useUsers from '../components/hooks/useUsers';
import UserTable from '../components/admin/users/UserTable';
import UserForm from '../components/admin/users/UserForm';
import Sidebar from '../components_admin/Sidebar';


const UserManagement = () => {
  const {
    filteredUsers,
    searchTerm,
    setSearchTerm,
    loading,
    error,
    updateUser,
    deleteUser,
    createUser,
    onFileUpload // Función para la importación de CSV
  } = useUsers();

  const [formMode, setFormMode] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormMode('edit');
  };

  const handleDelete = (userId) => {
    setConfirmAction('delete');
    setConfirmData(userId);
    setShowConfirmation(true);
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmAction === 'delete') {
        await deleteUser(confirmData);
      } else if (confirmAction === 'update') {
        await updateUser(selectedUser.id_user, confirmData);
        setFormMode(null);
        setSelectedUser(null);
      } else if (confirmAction === 'create') {
        await createUser(confirmData);
        setFormMode(null);
        setSelectedUser(null);
      } else if (confirmAction === 'import') {
        if (confirmData && confirmData.file) {
          await onFileUpload(confirmData.file);
        } else {
          console.error('No se seleccionó un archivo CSV');
        }
        setFormMode(null);
      }
    } catch (err) {
      console.error(err);
    }
    setShowConfirmation(false);
    setConfirmAction(null);
    setConfirmData(null);
  };

  const handleCancelAction = () => {
    setShowConfirmation(false);
    setConfirmAction(null);
    setConfirmData(null);
  };

  const handleSubmit = async (data) => {
    setConfirmData(data);
    
    if (formMode === 'edit') {
      setConfirmAction('update');
    } else if (formMode === 'create') {
      setConfirmAction('create');
    } else if (formMode === 'import') {
      setConfirmAction('import');
    }
    
    setShowConfirmation(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="w-full mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-semibold flex items-center text-gray-800">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 text-purple-600 mr-2"
              >
                <Users size={24} />
              </motion.div>
              Gestión de Usuarios
            </h2>
          </motion.div>

          {/* Search & Acciones */}
          <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <motion.input
                initial={{ width: '80%', opacity: 0 }}
                animate={{ width: '100%', opacity: 1 }}
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
            <div className="flex gap-2">
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
                Importar
              </motion.button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
            {/* Table Section */}
            <div className={formMode ? "lg:col-span-2 w-full" : "lg:col-span-3 w-full"}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 w-full"
              >
                <UserTable 
                  users={filteredUsers} 
                  loading={loading}
                  error={error}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Mostrando {filteredUsers.length} de {filteredUsers.length} registros
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Form Sidebar */}
            {formMode && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 w-full lg:col-span-1"
              >
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  {formMode === 'create' && <Plus className="text-purple-600 mr-2" />}
                  {formMode === 'edit' && <Edit2 className="text-orange-500 mr-2" />}
                  {formMode === 'import' && <Upload className="text-yellow-500 mr-2" />}
                  {formMode === 'create' && 'Crear Usuario'}
                  {formMode === 'edit' && 'Editar Usuario'}
                  {formMode === 'import' && 'Importar Usuarios'}
                </h3>
                <UserForm 
                  mode={formMode} 
                  initialData={selectedUser || {}} 
                  onSubmit={handleSubmit}
                  onFileUpload={(e) => onFileUpload(e.target.files[0])}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Confirmación */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold mb-3">Confirmar Acción</h3>
            <p className="text-gray-600 mb-6">
              {confirmAction === 'delete' && '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.'}
              {confirmAction === 'update' && '¿Confirmas la actualización de los datos de este usuario?'}
              {confirmAction === 'create' && '¿Confirmas la creación de este nuevo usuario?'}
              {confirmAction === 'import' && '¿Confirmas la importación de usuarios desde el archivo seleccionado?'}
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
                  confirmAction === 'delete' ? 'bg-red-500' : 'bg-purple-500'
                }`}
              >
                Confirmar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;