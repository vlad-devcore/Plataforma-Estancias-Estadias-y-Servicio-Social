import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          const response = await axios.get('http://189.203.249.19:3011/auth/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const verifiedUser = response.data.user;
          localStorage.setItem('user', JSON.stringify(verifiedUser));
          setUser(verifiedUser);
        } catch (error) {
          console.error('Error al verificar token:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const login = async (email, password) => {
    try {
      const response = await axios.post('http://189.203.249.19:3011/auth/login', {
        email,
        password
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);

      console.log("🔐 Usuario guardado en localStorage:", response.data.user);

      return { success: true, user: response.data.user };
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al iniciar sesión' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const updateUser = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://189.203.249.19:3011/users/${userData.id}`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedUser = {
        id: userData.id,
        email: userData.email,
        nombre: userData.nombre,
        apellido_paterno: userData.apellido_paterno,
        apellido_materno: userData.apellido_materno,
        role: userData.role,
        genero: userData.genero,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al actualizar perfil'
      };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://189.203.249.19:3011/auth/change-password',
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al cambiar contraseña'
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser, changePassword }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};