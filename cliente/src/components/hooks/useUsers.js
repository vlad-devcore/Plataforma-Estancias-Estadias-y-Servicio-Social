import { useState, useEffect } from 'react';
import axios from 'axios';

const useUsers = () => {
  const [state, setState] = useState({
    users: [],
    loading: false,
    error: null,
    success: null,
    searchTerm: '',
  });

  const setData = (newState) => {
    setState((prev) => ({ ...prev, ...newState }));
  };

  const fetchUsers = async () => {
    try {
      setData({ loading: true, error: null, success: null });
      const { data } = await axios.get('http://localhost:9999/api/users');
      setData({ users: data, loading: false });
    } catch (err) {
      setData({
        error: err.response?.data?.error || 'Error al obtener usuarios',
        loading: false,
      });
      throw err;
    }
  };

  const getAsesores = () => {
    return state.users.filter((user) => user.role === 'asesor_academico');
  };

  const updateUser = async (id_user, updatedData) => {
    try {
      setData({ loading: true, error: null, success: null });
      const currentUser = state.users.find((user) => user.id_user === id_user);
      const fullData = { ...currentUser, ...updatedData };

      const { data } = await axios.put(`http://localhost:9999/api/users/${id_user}`, fullData);
      setData({
        users: state.users.map((user) => (user.id_user === id_user ? fullData : user)),
        loading: false,
        success: 'Usuario actualizado correctamente',
      });
      return data;
    } catch (err) {
      setData({
        error: err.response?.data?.error || 'Error al actualizar usuario',
        loading: false,
      });
      throw err;
    }
  };

  const deleteUser = async (id_user) => {
    try {
      setData({ loading: true, error: null, success: null });
      await axios.delete(`http://localhost:9999/api/users/${id_user}`);
      setData({
        users: state.users.filter((user) => user.id_user !== id_user),
        loading: false,
        success: 'Usuario eliminado correctamente',
      });
    } catch (err) {
      setData({
        error: err.response?.data?.error || 'Error al eliminar usuario',
        loading: false,
      });
      throw err;
    }
  };

  const createUser = async (newUser) => {
    try {
      setData({ loading: true, error: null, success: null });
      const { data } = await axios.post('http://localhost:9999/api/users', newUser);
      await fetchUsers();
      setData({ loading: false, success: 'Usuario creado correctamente' });
      return data;
    } catch (err) {
      setData({
        error: err.response?.data?.error || 'Error al crear usuario',
        loading: false,
      });
      throw err;
    }
  };

  const createUsersFromCSV = async (file) => {
    try {
      console.log('Iniciando carga de CSV:', file.name);
      setData({ loading: true, error: null, success: null });
      const formData = new FormData();
      formData.append('file', file);
      console.log('FormData contiene:', Array.from(formData.entries()));

      const { data } = await axios.post('http://localhost:9999/api/users/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchUsers();
      setData({
        loading: false,
        success: `Se importaron ${data.total || 'varios'} usuarios correctamente`,
      });
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al importar usuarios';
      const errorDetails = err.response?.data?.details
        ? err.response.data.details.join('; ')
        : '';
      setData({
        error: errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage,
        loading: false,
      });
      throw err;
    }
  };

  const resetMessages = () => {
    setData({ error: null, success: null });
  };

  const filteredUsers = state.users.filter(
    (user) =>
      user.email.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      (user.role && user.role.toLowerCase().includes(state.searchTerm.toLowerCase()))
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    ...state,
    filteredUsers,
    setSearchTerm: (searchTerm) => setData({ searchTerm }),
    fetchUsers,
    updateUser,
    deleteUser,
    createUser,
    createUsersFromCSV,
    getAsesores,
    resetMessages,
  };
};

export default useUsers;