import { useState, useEffect } from "react";
import axios from "axios";


const API_URL = `${process.env.REACT_APP_API_ENDPOINT}/api/periodos`;

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
      const response = await axios.get(API_URL);
      setPeriodos(response.data);
    } catch (err) {
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
      const response = await axios.post(API_URL, nuevoPeriodo);
      setSuccess("Periodo creado con éxito.");
      await fetchPeriodos();
      return response.data;
    } catch (err) {
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
      await axios.put(`${API_URL}/${id}`, datosActualizados);
      setSuccess("Periodo actualizado con éxito.");
      await fetchPeriodos();
    } catch (err) {
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
      await axios.delete(`${API_URL}/${id}`);
      setSuccess("Periodo eliminado con éxito.");
      await fetchPeriodos();
    } catch (err) {
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
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (err) {
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
      const response = await axios.get(`${API_URL}/activo`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Error al obtener el periodo activo.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Limpiar mensajes de error y éxito
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