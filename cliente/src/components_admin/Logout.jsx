import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Asegúrate de que esta ruta sea correcta

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Asumiendo que tu AuthContext tiene una función logout
  
  useEffect(() => {
    // Función para manejar el cierre de sesión
    const handleLogout = async () => {
      try {
        // Si tu función logout devuelve una promesa
        await logout();
        
        // Limpia cualquier elemento del almacenamiento local relacionado con la autenticación
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        
        // Redirecciona a la página de inicio de sesión
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Error durante el cierre de sesión:', error);
        // De todas formas redirige al login aunque haya un error
        navigate('/', { replace: true });
      }
    };
    
    // Ejecuta el cierre de sesión cuando el componente se monta
    handleLogout();
  }, [logout, navigate]);
  
  return (
    <div className="logout-container">
      <h2>Cerrando sesión...</h2>
      <p>Por favor espere mientras se cierra su sesión.</p>
    </div>
  );
};

export default Logout;