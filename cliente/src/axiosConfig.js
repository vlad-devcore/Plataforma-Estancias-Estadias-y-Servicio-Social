import axios from "axios";

// Crear instancia de axios
const api = axios.create({
    baseURL: `${process.env.REACT_APP_API_ENDPOINT}/api`,
    withCredentials: true,
});

// 🔹 INTERCEPTOR: Agrega el token automáticamente a TODAS las peticiones
api.interceptors.request.use(
    (config) => {
        // Obtener el token de localStorage
        const token = localStorage.getItem('token');
        
        // Si existe el token, agregarlo al header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        // Manejar errores antes de enviar la petición
        return Promise.reject(error);
    }
);

// 🔹 INTERCEPTOR DE RESPUESTA: Maneja errores 401 (token expirado/inválido)
api.interceptors.response.use(
    (response) => {
        // Si la respuesta es exitosa, simplemente la devuelve
        return response;
    },
    (error) => {
        // Si el error es 401 (no autorizado)
        if (error.response?.status === 401) {
            // Solo limpia el localStorage, NO redirige aquí
            // (Para evitar loops infinitos)
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // El componente que use esto debe manejar el error
            console.warn('Token inválido o expirado. Se limpió el localStorage.');
        }
        
        return Promise.reject(error);
    }
);

export default api;