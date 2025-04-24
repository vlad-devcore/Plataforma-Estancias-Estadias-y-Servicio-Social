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
        error: 'No se pudieron cargar los usuarios. Por favor, intenta de nuevo.',
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
        success: 'Usuario actualizado con éxito.',
      });
      return data;
    } catch (err) {
      setData({
        error: err.response?.data?.error || 'No se pudo actualizar el usuario. Por favor, intenta de nuevo.',
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
        success: 'Usuario eliminado con éxito.',
      });
    } catch (err) {
      setData({
        error: err.response?.data?.error || 'No se pudo eliminar el usuario. Por favor, intenta de nuevo.',
        loading: false,
      });
      throw err;
    }
  };

  const createUser = async (newUser) => {
    try {
      console.log('Creando usuario con datos:', newUser);
      setData({ loading: true, error: null, success: null });
      const { data } = await axios.post('http://localhost:9999/api/users', newUser);
      await fetchUsers();
      setData({ loading: false, success: 'Usuario creado con éxito.' });
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'No se pudo crear el usuario. Por favor, verifica los datos e intenta de nuevo.';
      console.error('Error al crear usuario:', errorMessage);
      setData({
        error: errorMessage,
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

      // Construir mensaje amigable
      let successMessage = `Se importaron ${data.insertedCount || 0} usuarios con éxito.`;
      const maxDisplay = 5; // Limitar a 5 correos en la lista
      if (data.existingEmails?.length > 0) {
        const displayedEmails = data.existingEmails.slice(0, maxDisplay);
        successMessage += `\n${data.existingEmails.length} usuarios ya estaban registrados: ${displayedEmails.join(', ')}${data.existingEmails.length > maxDisplay ? ' y otros.' : '.'}`;
      }
      if (data.duplicateEmails?.length > 0) {
        const displayedEmails = data.duplicateEmails.slice(0, maxDisplay);
        successMessage += `\n${data.duplicateEmails.length} usuarios estaban repetidos en el archivo: ${displayedEmails.join(', ')}${data.duplicateEmails.length > maxDisplay ? ' y otros.' : '.'}`;
      }
      if (data.errors?.length > 0) {
        successMessage += `\n${data.errors.length} registros tenían problemas en los datos. Por favor, revisa el archivo.`;
      }

      setData({
        loading: false,
        success: successMessage,
      });
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'No se pudieron importar los usuarios. Por favor, revisa el archivo e intenta de nuevo.';
      setData({
        error: errorMessage,
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