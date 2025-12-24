import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Función de logout memoizada
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  // ✅ Verificación de autenticación mejorada
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        setLoading(false);
        return;
      }

      try {
        // ✅ Usar la instancia configurada de axios
        const response = await api.get('/auth/verify');
        const verifiedUser = response.data.user;
        
        // ✅ Actualizar localStorage y estado
        localStorage.setItem('user', JSON.stringify(verifiedUser));
        setUser(verifiedUser);
      } catch (error) {
        console.error('❌ Error al verificar token:', error.response?.data || error.message);
        
        // ✅ Limpiar datos inválidos
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [logout]); // ✅ Incluir logout en dependencias

  // ✅ Login mejorado
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      const { token, user: userData } = response.data;

      // ✅ Guardar token y usuario
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ Error en login:', error);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Error al iniciar sesión';
      
      return { success: false, error: errorMessage };
    }
  };

  // ✅ updateUser corregido - usa respuesta del servidor
  const updateUser = async (userData) => {
    try {
      const response = await api.put(`/users/${userData.id}`, userData);
      
      // ✅ Usar datos del servidor en lugar de reconstruir manualmente
      const updatedUser = response.data.user || {
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

      return { 
        success: true, 
        message: response.data.message || 'Perfil actualizado correctamente' 
      };
    } catch (error) {
      console.error('❌ Error al actualizar usuario:', error);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Error al actualizar perfil';
      
      return { success: false, error: errorMessage };
    }
  };

  // ✅ changePassword mejorado
  const changePassword = async (oldPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', {
        oldPassword,
        newPassword
      });

      return { 
        success: true, 
        message: response.data.message || 'Contraseña cambiada correctamente' 
      };
    } catch (error) {
      console.error('❌ Error al cambiar contraseña:', error);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Error al cambiar contraseña';
      
      return { success: false, error: errorMessage };
    }
  };

  // ✅ Refrescar datos del usuario desde el servidor
  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/verify');
      const verifiedUser = response.data.user;
      
      localStorage.setItem('user', JSON.stringify(verifiedUser));
      setUser(verifiedUser);
      
      return { success: true, user: verifiedUser };
    } catch (error) {
      console.error('❌ Error al refrescar usuario:', error);
      return { success: false, error: 'Error al refrescar datos' };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading, 
      updateUser, 
      changePassword,
      refreshUser 
    }}>
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