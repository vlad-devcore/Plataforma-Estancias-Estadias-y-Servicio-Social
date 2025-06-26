import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:9999/api", // 🔹 Ajusta según el puerto de tu servidor
    withCredentials: true, // 🔹 Permite el envío de cookies o autenticación si es necesario
});

export default api;
 