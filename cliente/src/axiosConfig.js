import axios from "axios";

// ✅ Crear instancia de axios
const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_ENDPOINT}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ INTERCEPTOR DE REQUEST - Agrega token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ INTERCEPTOR DE RESPONSE - Maneja errores de autenticación
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // ✅ Detectar errores de autenticación
    if (error.response?.status === 401 || error.response?.status === 403) {
      const currentPath = window.location.pathname;
      
      // ✅ Solo redirigir si no estamos ya en login
      if (currentPath !== '/login') {
        console.warn('⚠️ Sesión expirada o no autorizada');
        
        // Limpiar datos locales
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirigir a login
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;