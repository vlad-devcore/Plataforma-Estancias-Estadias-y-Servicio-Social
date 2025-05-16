import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://189.203.249.19:3011/api/periodos";

const usePeriodos = () => {
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Obtener todos los periodos
  const fetchPeriodos = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      console.log('Fetching periodos from', API_URL);
      const response = await axios.get(API_URL);
      setPeriodos(response.data);
    } catch (err) {
      console.error("Error al obtener los periodos:", err);
      setError("Error al obtener los periodos");
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo periodo
  const createPeriodo = async (nuevoPeriodo) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      console.log('Creando periodo con datos:', nuevoPeriodo);
      const response = await axios.post(API_URL, nuevoPeriodo);
      setSuccess("Periodo creado con éxito.");
      await fetchPeriodos();
      return response.data;
    } catch (err) {
      console.error("Error al crear periodo:", err);
      setError(err.response?.data?.error || "Error al crear el periodo.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar periodo
  const updatePeriodo = async (id, datosActualizados) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      console.log(`Actualizando periodo ${id} con datos:`, datosActualizados);
      await axios.put(`${API_URL}/${id}`, datosActualizados);
      setSuccess("Periodo actualizado con éxito.");
      await fetchPeriodos();
    } catch (err) {
      console.error("Error al actualizar periodo:", err);
      setError(err.response?.data?.error || "Error al actualizar el periodo.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar periodo
  const deletePeriodo = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      console.log(`Eliminando periodo ${id}`);
      await axios.delete(`${API_URL}/${id}`);
      setSuccess("Periodo eliminado con éxito.");
      await fetchPeriodos();
    } catch (err) {
      console.error("Error al eliminar periodo:", err);
      setError(err.response?.data?.error || "Error al eliminar el periodo.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener un periodo por ID
  const getPeriodoById = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      console.log(`Obteniendo periodo ${id}`);
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (err) {
      console.error("Error al obtener periodo por ID:", err);
      setError(err.response?.data?.error || "Error al obtener el periodo.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener el periodo activo
  const getPeriodoActivo = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      console.log('Obteniendo periodo activo');
      const response = await axios.get(`${API_URL}/activo`);
      return response.data;
    } catch (err) {
      console.error("Error al obtener el periodo activo:", err);
      setError(err.response?.data?.error || "Error al obtener el periodo activo.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Limpiar mensajes de error y éxito
  const resetMessages = () => {
    console.log('Reseteando mensajes de error y éxito');
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