import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const PrivateRoute = ({ element, allowedRoles }) => {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      if (!user || !token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        await axios.get('http://189.203.249.19:9999/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!allowedRoles.includes(user.role)) {
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error al verificar token:', error);
        logout();
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    verifyAuth();
  }, [user, allowedRoles, logout]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-gray-600 text-lg animate-pulse">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={user && !allowedRoles.includes(user.role) ? "/unauthorized" : "/"} replace />;
  }

  return element;
};

export default PrivateRoute;