import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:9999/api/periodos";

const usePeriodos = () => {
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener todos los periodos
  const fetchPeriodos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setPeriodos(response.data);
      setError(null);
    } catch (err) {
      console.error("Error al obtener los periodos:", err);
      setError("Error al obtener los periodos");
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo periodo
  const createPeriodo = async (nuevoPeriodo) => {
    try {
      const response = await axios.post(API_URL, nuevoPeriodo);
      await fetchPeriodos();
      return response.data;
    } catch (err) {
      console.error("Error al crear periodo:", err);
      throw err;
    }
  };

  // Actualizar periodo
  const updatePeriodo = async (id, datosActualizados) => {
    try {
      await axios.put(`${API_URL}/${id}`, datosActualizados);
      await fetchPeriodos();
    } catch (err) {
      console.error("Error al actualizar periodo:", err);
      throw err;
    }
  };

  // Eliminar periodo
  const deletePeriodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      await fetchPeriodos();
    } catch (err) {
      console.error("Error al eliminar periodo:", err);
      throw err;
    }
  };

  // Obtener un periodo por ID
  const getPeriodoById = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (err) {
      console.error("Error al obtener periodo por ID:", err);
      throw err;
    }
  };

  // Obtener el periodo activo
const getPeriodoActivo = async () => {
  try {
    const response = await axios.get(`${API_URL}/activo`);
    return response.data;
  } catch (err) {
    console.error("Error al obtener el periodo activo:", err);
    throw err;
  }
};


  useEffect(() => {
    fetchPeriodos();
  }, []);

  return {
    periodos,
    loading,
    error,
    createPeriodo,
    updatePeriodo,
    deletePeriodo,
    getPeriodoById,
    fetchPeriodos,
    getPeriodoActivo, // aquí
  };
}  

export default usePeriodos;
