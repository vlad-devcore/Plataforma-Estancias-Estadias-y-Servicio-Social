import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_ENDPOINT}/api`,
  withCredentials: true,
});

// 🔑 Interceptor para enviar el token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // ajusta el nombre
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
