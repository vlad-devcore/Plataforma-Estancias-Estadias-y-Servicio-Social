import { useState } from 'react';
import { Search } from 'react-feather';
import CrudLayout from '../components/management/CrudLayout';
import CrudTable from '../components/management/CrudTable/CrudTable';
import EditUserModal from '../components/admin/modals/EditUserModal';
import ConfirmDeleteModal from '../components/admin/modals/ConfirmDeleteModal';
import useUsers from '../components/hooks/useUsers';
import Sidebar from '../components_admin/Sidebar';

const roleRenderer = (role) => {
  const roleTranslations = {
    estudiante: 'Estudiante',
    administrador: 'Administrador',
    asesor_academico: 'Asesor Académico',
    asesor_empresarial: 'Asesor Empresarial'
  };
  return <span className="capitalize">{roleTranslations[role] || role}</span>;
};

const UsuariosAdmin = () => {
  const { users, loading, error, updateUser, deleteUser } = useUsers();
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleEdit = (user) => {
    setSelectedUser(user);
  };

  const handleDeleteConfirmation = (id_user) => {
    const user = users.find(u => u.id_user === id_user);
    setUserToDelete(user);
  };

  const handleDelete = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete.id_user);
      setUserToDelete(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 fixed left-0 top-0 h-full bg-white shadow-lg">
        <Sidebar />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 ml-64 p-8">
        <CrudLayout title="Gestión de Usuarios" icon="users">
          {/* Barra de búsqueda */}
          <div className="mb-6 flex justify-end">
            <div className="relative w-full max-w-md">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Buscar usuario..."
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={20}
              />
            </div>
          </div>

          {/* Tabla */}
          <CrudTable
            data={filteredUsers}
            columns={[
              { key: "email", header: "Correo" },
              {
                key: "role",
                header: "Rol",
                render: (value) => roleRenderer(value),
              },
            ]}
            loading={loading}
            error={error}
            onEdit={handleEdit}
            onDelete={handleDeleteConfirmation}
          />

          {/* Modales */}
          {selectedUser && (
            <EditUserModal
              user={selectedUser}
              onClose={() => setSelectedUser(null)}
              onSave={async (updatedData) => {
                await updateUser(selectedUser.id_user, updatedData);
              }}
            />
          )}

          {userToDelete && (
            <ConfirmDeleteModal
              itemId={userToDelete.id_user} // ✅ ID específico para usuarios
              itemName={userToDelete.email}
              onClose={() => setUserToDelete(null)}
              onConfirm={deleteUser} // ✅ Función específica
            />
          )}
        </CrudLayout>
      </div>
    </div>
  );
};

export default UsuariosAdmin;