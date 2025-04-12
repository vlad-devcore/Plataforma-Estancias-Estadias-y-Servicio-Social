import { useState, useEffect } from "react";
import axios from "axios";

const useProgramasEducativos = () => {
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgramas = async () => {
    try {
      const { data } = await axios.get("http://localhost:9999/api/programas");
      setProgramas(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgramas();
  }, []);

  return {
    programas,
    loading,
    error,
    fetchProgramas,
  };
};

export default useProgramasEducativos;
