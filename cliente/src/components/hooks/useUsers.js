// src/hooks/useUsers.js
import { useState, useEffect } from 'react';

const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:9999/api/users');
      if (!response.ok) throw new Error('Error al obtener usuarios');
      setUsers(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id_user, updatedData) => {
    try {
      const currentUser = users.find(user => user.id_user === id_user);
      console.log("🔍 Usuario actual:", JSON.parse(JSON.stringify(currentUser)));
      
      const fullData = { ...currentUser, ...updatedData };
      console.log("🧩 Datos combinados:", fullData);
  
      const response = await fetch(`http://localhost:9999/api/users/${id_user}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullData)
      });
  
      console.log("📡 Respuesta del servidor:", {
        status: response.status,
        ok: response.ok
      });
  
      const responseData = await response.json();
      console.log("📦 Contenido de la respuesta:", responseData);
  
      if (!response.ok) throw new Error(responseData.error || "Error desconocido");
  
      setUsers(users.map(user => user.id_user === id_user ? fullData : user));
      return responseData;
      
    } catch (err) {
      console.error("🔥 Error en updateUser:", {
        id_user,
        updatedData,
        error: err.message
      });
      throw err;
    }
  };

const deleteUser = async (id_user) => {
  try {
    const response = await fetch(`http://localhost:9999/api/users/${id_user}`, { // Usar id_user
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar usuario');
    }

    setUsers(users.filter(user => id_user));
  } catch (err) {
    setError(err.message);
    throw err; // Propagar el error para manejo en UI
  }
};

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, updateUser, deleteUser, fetchUsers };
};

export default useUsers;