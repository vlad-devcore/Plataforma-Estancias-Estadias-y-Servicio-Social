import { useState, useEffect } from 'react';
import axios from 'axios';

const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [rolFilter, setRolFilter] = useState('Todos');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 10;

  // Obtener usuarios con paginación, búsqueda y filtro por rol
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const params = {
          page: currentPage,
          limit: usersPerPage,
          search: searchTerm || undefined,
          role: rolFilter !== 'Todos' ? rolFilter : undefined
        };
        console.log('Fetching users with params:', params);
        const response = await axios.get('http://localhost:9999/api/users', {
          headers: { Authorization: `Bearer ${token}` },
          params
        });
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
        setTotalPages(response.data.totalPages);
        setTotalUsers(response.data.total);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar usuarios');
        setUsers([]);
        setFilteredUsers([]);
        setTotalPages(1);
        setTotalUsers(0);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, searchTerm, rolFilter]);

  // Crear usuario
  const createUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:9999/api/users', userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refrescar datos para reflejar el nuevo usuario
      setCurrentPage(1); // Volver a la primera página
      setSuccess(response.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar usuario
  const updateUser = async (id_user, userData) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:9999/api/users/${id_user}`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refrescar datos
      setCurrentPage(1);
      setSuccess(response.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar usuario');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar usuario
  const deleteUser = async (id_user) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:9999/api/users/${id_user}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refrescar datos
      setCurrentPage(1);
      setSuccess('Usuario eliminado correctamente');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar usuario');
    } finally {
      setLoading(false);
    }
  };

  // Importar usuarios desde CSV
  const createUsersFromCSV = async (file) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post('http://localhost:9999/api/users/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      // Refrescar datos
      setCurrentPage(1);
      setSuccess(response.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al importar usuarios');
    } finally {
      setLoading(false);
    }
  };

  // Resetear mensajes
  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return {
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
  };
};

export default useUsers;