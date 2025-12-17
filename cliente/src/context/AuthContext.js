import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API = process.env.REACT_APP_API_ENDPOINT;

  // 🔐 Verificar token SOLO una vez al iniciar
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(`${API}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } catch (error) {
        console.error('Token inválido o expirado');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [API]);

  // 🔑 Login
  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${API}/api/auth/login`, {
        email,
        password,
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al iniciar sesión',
      };
    }
  };

  // 🚪 Logout (SIN navegar)
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // 👤 Actualizar perfil
  const updateUser = async (userData) => {
    try {
      const token = localStorage.getItem('token');

      const { data } = await axios.put(
        `${API}/api/users/${userData.id}`,
        userData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true, message: data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al actualizar perfil',
      };
    }
  };

  // 🔐 Cambiar contraseña
  const changePassword = async (oldPassword, newPassword) => {
    try {
      const token = localStorage.getItem('token');

      const { data } = await axios.post(
        `${API}/api/auth/change-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return { success: true, message: data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al cambiar contraseña',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
        changePassword,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
