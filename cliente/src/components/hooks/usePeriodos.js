import { useState, useEffect } from "react";
import api from "../../axiosConfig"; // ✅ Instancia con interceptores y token

const usePeriodos = () => {
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ✅ Obtener todos los periodos
  const fetchPeriodos = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.get("/periodos"); // ✅ Ya incluye baseURL
      setPeriodos(response.data);
    } catch (err) {
      setError("Error al obtener los periodos");
      console.error("Error fetchPeriodos:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Crear nuevo periodo
  const createPeriodo = async (nuevoPeriodo) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.post("/periodos", nuevoPeriodo);
      setSuccess("Periodo creado con éxito.");
      await fetchPeriodos();
      return response.data;
    } catch (err) {
      const mensaje = err.response?.data?.error || "Error al crear el periodo.";
      setError(mensaje);
      console.error("Error createPeriodo:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Actualizar periodo
  const updatePeriodo = async (id, datosActualizados) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.put(`/periodos/${id}`, datosActualizados);
      setSuccess("Periodo actualizado con éxito.");
      await fetchPeriodos();
    } catch (err) {
      const mensaje = err.response?.data?.error || "Error al actualizar el periodo.";
      setError(mensaje);
      console.error("Error updatePeriodo:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Eliminar periodo
  const deletePeriodo = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/periodos/${id}`);
      setSuccess("Periodo eliminado con éxito.");
      await fetchPeriodos();
    } catch (err) {
      const mensaje = err.response?.data?.error || "Error al eliminar el periodo.";
      setError(mensaje);
      console.error("Error deletePeriodo:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Obtener un periodo por ID
  const getPeriodoById = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.get(`/periodos/${id}`);
      return response.data;
    } catch (err) {
      const mensaje = err.response?.data?.error || "Error al obtener el periodo.";
      setError(mensaje);
      console.error("Error getPeriodoById:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Obtener el periodo activo
  const getPeriodoActivo = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.get("/periodos/activo");
      return response.data;
    } catch (err) {
      const mensaje = err.response?.data?.error || "Error al obtener el periodo activo.";
      setError(mensaje);
      console.error("Error getPeriodoActivo:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Limpiar mensajes de error y éxito
  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  useEffect(() => {
    fetchPeriodos();
  }, []);

  return {
    periodos,
    loading,
    error,
    success,
    createPeriodo,
    updatePeriodo,
    deletePeriodo,
    getPeriodoById,
    fetchPeriodos,
    getPeriodoActivo,
    resetMessages,
  };
};

export default usePeriodos;