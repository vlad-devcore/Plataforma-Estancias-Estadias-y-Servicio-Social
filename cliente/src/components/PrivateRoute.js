import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ element, allowedRoles }) => {
  const { user, loading } = useAuth();

  // ⏳ Esperar a que AuthContext termine
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-gray-600 text-lg animate-pulse">
          Cargando...
        </div>
      </div>
    );
  }

  // 🚪 No autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ⛔ Rol no autorizado
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Acceso permitido
  return element;
};

export default PrivateRoute;
