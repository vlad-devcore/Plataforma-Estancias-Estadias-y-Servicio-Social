import { useState, useEffect } from 'react';
import axios from 'axios';

const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 10;

  // Obtener usuarios con paginación
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:9999/api/users?page=${currentPage}&limit=${usersPerPage}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
        setTotalPages(response.data.totalPages);
        setTotalUsers(response.data.total);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar usuarios');
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage]);

  // Filtrar usuarios por búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Crear usuario
  const createUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:9999/api/users', userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(prev => [...prev, { ...userData, id_user: response.data.id_user }]);
      setFilteredUsers(prev => [...prev, { ...userData, id_user: response.data.id_user }]);
      setSuccess(response.data.message);
      setTotalUsers(prev => prev + 1);
      setTotalPages(Math.ceil((totalUsers + 1) / usersPerPage));
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
      setUsers(prev =>
        prev.map(user => (user.id_user === id_user ? { ...user, ...userData } : user))
      );
      setFilteredUsers(prev =>
        prev.map(user => (user.id_user === id_user ? { ...user, ...userData } : user))
      );
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
      setUsers(prev => prev.filter(user => user.id_user !== id_user));
      setFilteredUsers(prev => prev.filter(user => user.id_user !== id_user));
      setSuccess('Usuario eliminado correctamente');
      setTotalUsers(prev => prev - 1);
      setTotalPages(Math.ceil((totalUsers - 1) / usersPerPage));
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
      const newUsers = response.data.insertedEmails.map(email => ({
        email,
        id_user: Math.random().toString(), // ID temporal, idealmente obtén IDs reales
        nombre: 'Usuario',
        apellido_paterno: 'Importado',
        role: 'estudiante' // Asume estudiante por defecto, ajusta según tu lógica
      }));
      setUsers(prev => [...newUsers, ...prev]);
      setFilteredUsers(prev => [...newUsers, ...prev]);
      setSuccess(response.data.message);
      setTotalUsers(prev => prev + response.data.insertedCount);
      setTotalPages(Math.ceil((totalUsers + response.data.insertedCount) / usersPerPage));
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
    usersPerPage
  };
};

export default useUsers;