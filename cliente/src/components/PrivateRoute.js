import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext"; // Asegúrate de que este contexto funcione correctamente

const PrivateRoute = ({ element, allowedRoles }) => {
  const { user } = useAuth(); // Obtiene el usuario autenticado

  if (!user) {
    return <Navigate to="/" replace />; // Si no está autenticado, redirige al login
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />; // Si el rol no está permitido, redirige
  }

  return element;
};

export default PrivateRoute;
