import { useState, useEffect } from 'react';

const useUsers = () => {
  const [state, setState] = useState({
    users: [],
    loading: true,
    error: null,
    searchTerm: ''
  });

  const setData = (newState) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  const fetchUsers = async () => {
    try {
      setData({ loading: true, error: null });
      const response = await fetch('http://localhost:9999/api/users');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setData({ users: data, loading: false });
      
    } catch (err) {
      setData({ 
        error: err.message || 'Error al obtener usuarios',
        loading: false 
      });
      throw err;
    }
  };

  const getAsesores = () => {
    return state.users.filter(user => user.role === 'asesor_academico');
  };

  const updateUser = async (id_user, updatedData) => {
    try {
      setData({ loading: true, error: null });
      
      const currentUser = state.users.find(user => user.id_user === id_user);
      const fullData = { ...currentUser, ...updatedData };

      const response = await fetch(`http://localhost:9999/api/users/${id_user}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar usuario");
      }

      setData({
        users: state.users.map(user => 
          user.id_user === id_user ? fullData : user
        ),
        loading: false
      });

      return await response.json();
      
    } catch (err) {
      setData({ error: err.message, loading: false });
      throw err;
    }
  };

  const deleteUser = async (id_user) => {
    try {
      setData({ loading: true, error: null });
      
      const response = await fetch(`http://localhost:9999/api/users/${id_user}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar usuario');
      }

      setData({
        users: state.users.filter(user => user.id_user !== id_user),
        loading: false
      });

    } catch (err) {
      setData({ error: err.message, loading: false });
      throw err;
    }
  };

  const createUser = async (newUser) => {
    try {
      setData({ loading: true, error: null });
  
      const response = await fetch('http://localhost:9999/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear usuario");
      }
  
      const created = await response.json();
      await fetchUsers();
      return created;
    } catch (err) {
      setData({ error: err.message, loading: false });
      throw err;
    }
  };

  const createUsersFromCSV = async (file) => {
    try {
      setData({ loading: true, error: null });
  
      const formData = new FormData();
      formData.append('file', file);
  
      const response = await fetch('http://localhost:9999/api/users/upload', {
        method: 'POST',
        body: formData
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al subir archivo CSV");
      }
  
      const result = await response.json();
      await fetchUsers();
      return result;
    } catch (err) {
      setData({ error: err.message, loading: false });
      throw err;
    }
  };

  const filteredUsers = state.users.filter(user => 
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
    getAsesores // <-- aquí exportamos la función para obtener los asesores
  };
};

export default useUsers;
