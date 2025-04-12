import { useState, useEffect } from "react";
import axios from "axios";

const useProcesos = () => {
  const [procesos, setProcesos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProcesos = async () => {
    try {
      const { data } = await axios.get("http://localhost:9999/api/procesos");
      setProcesos(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const createProceso = async (nuevoProceso) => {
    try {
      const { data } = await axios.post("http://localhost:9999/api/procesos", nuevoProceso);
      await fetchProcesos();
      return data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  };

  const getProcesoByEstudiante = async (idEstudiante) => {
    try {
      const { data } = await axios.get(`http://localhost:9999/api/procesos/estudiante/${idEstudiante}`);
      return data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  };

  useEffect(() => {
    fetchProcesos();
  }, []);

  return {
    procesos,
    loading,
    error,
    fetchProcesos,
    createProceso,
    getProcesoByEstudiante,
  };
};

export default useProcesos;
