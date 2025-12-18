// frontend/src/axiosConfig.js
import axios from "axios";

const api = axios.create({
    baseURL: `${process.env.REACT_APP_API_ENDPOINT}/api`,
    withCredentials: true,
});

// ✅ INTERCEPTOR: Adjunta automáticamente el token JWT a cada petición
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        
        console.log('🔐 Interceptor Request:', {
            url: config.url,
            method: config.method,
            hasToken: !!token,
            token: token ? token.substring(0, 20) + '...' : 'NO TOKEN'
        });
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn('⚠️ No hay token en localStorage');
        }
        
        return config;
    },
    (error) => {
        console.error('❌ Error en interceptor request:', error);
        return Promise.reject(error);
    }
);

// ✅ INTERCEPTOR DE RESPUESTA: Maneja errores de autenticación globalmente
api.interceptors.response.use(
    (response) => {
        console.log('✅ Response exitosa:', response.config.url, response.status);
        return response;
    },
    (error) => {
        console.error('❌ Error en response:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.response?.data?.error
        });
        
        // Si recibimos 401 (no autorizado) o 403 (prohibido) y el token expiró
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            const errorMessage = error.response.data?.error || '';
            
            // Si el token expiró o es inválido, limpiar y redirigir al login
            if (errorMessage.includes('Token expirado') || 
                errorMessage.includes('Token inválido') ||
                errorMessage.includes('Token no proporcionado') ||
                errorMessage.includes('Usuario no encontrado')) {
                
                console.warn('🔐 Sesión expirada o inválida. Redirigiendo al login...');
                
                // Limpiar datos de autenticación
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                // Redirigir al login solo si no estamos ya en la página de login
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;