import { useState, useEffect } from "react";
import axios from "axios";

const useAsesoresAcademicos = () => {
  const [asesoresAcademicos, setAsesoresAcademicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAsesoresAcademicos = async () => {
    try {
      const { data } = await axios.get("http://189.203.249.19:9999/api/asesores/academicos");
      setAsesoresAcademicos(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsesoresAcademicos();
  }, []);

  return {
    asesoresAcademicos,
    loading,
    error,
    fetchAsesoresAcademicos,
  };
};

export default useAsesoresAcademicos;
