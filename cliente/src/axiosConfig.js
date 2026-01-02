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

// 🔥 INTERCEPTOR DE RESPONSE MEJORADO - Maneja errores inteligentemente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const errorMessage = error.response?.data?.mensaje || "";

    // 🔐 REGLA 1: Solo cerrar sesión si el error viene de rutas de AUTH
    const isAuthEndpoint = url.includes("/auth/");
    
    // 🔐 REGLA 2: O si el backend explícitamente dice "token inválido"
    const isTokenInvalid = 
      errorMessage.toLowerCase().includes("token") &&
      (errorMessage.toLowerCase().includes("inválido") || 
       errorMessage.toLowerCase().includes("expirado"));

    // 🚪 Solo cerrar sesión en estos casos específicos
    if (
      (status === 401 || status === 403) &&
      (isAuthEndpoint || isTokenInvalid)
    ) {
      console.warn("⚠️ Sesión expirada o token inválido - Cerrando sesión");

      // Limpiar datos locales
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Redirigir a login
      window.location.href = "/login";
    }

    // ℹ️ Para otros errores 401/403 (permisos), solo rechazar sin cerrar sesión
    return Promise.reject(error);
  }
);

export default api;