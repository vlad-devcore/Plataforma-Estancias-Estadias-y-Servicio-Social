import { useState, useEffect } from "react";
import axios from "axios";

const useAsesoresEmpresariales = () => {
  const [asesoresEmpresariales, setAsesoresEmpresariales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAsesoresEmpresariales = async () => {
    try {
      const { data } = await axios.get("http://189.203.249.19:9999/api/asesores/empresariales");
      setAsesoresEmpresariales(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsesoresEmpresariales();
  }, []);

  return {
    asesoresEmpresariales,
    loading,
    error,
    fetchAsesoresEmpresariales,
  };
};

export default useAsesoresEmpresariales;
