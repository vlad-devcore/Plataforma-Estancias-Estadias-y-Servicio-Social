import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Upload } from 'lucide-react';
import UserTable from '../components/admin/users/UserTable'
import UserForm from '../components/admin/users/UserForm';
import useUsers from '../components/hooks/useUsers';

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
  } = useUsers();

  const [formMode, setFormMode] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

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

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Usuarios</h1>

      <div className="mb-4 flex justify-between items-center">
        <div className="relative w-1/3">
          <input
            type="text"
            placeholder="Buscar por correo o rol..."
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFormMode('create')}
            className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
          >
            Crear Usuario
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFormMode('import')}
            className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 flex items-center"
          >
            <Upload className="mr-2" size={16} />
            Importar CSV
          </motion.button>
        </div>
      </div>

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
        }}
      />

      {(formMode === 'create' || formMode === 'edit' || formMode === 'import') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4">
              {formMode === 'create'
                ? 'Crear Nuevo Usuario'
                : formMode === 'edit'
                ? 'Editar Usuario'
                : 'Importar Usuarios desde CSV'}
            </h2>
            <UserForm
              mode={formMode}
              initialData={selectedUser || {}}
              onSubmit={handleSubmit}
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-lg w-full max-w-sm"
          >
            <h2 className="text-lg font-bold mb-4">Confirmar Acción</h2>
            <p>
              {confirmAction === 'delete'
                ? '¿Estás seguro de que deseas eliminar este usuario?'
                : confirmAction === 'import'
                ? '¿Confirmas la importación de usuarios desde el archivo seleccionado?'
                : `¿Confirmas ${confirmAction === 'create' ? 'la creación' : 'la actualización'} del usuario?`}
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
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