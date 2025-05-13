import { useState, useEffect } from "react";
import axios from "axios";

const useProcesos = () => {
  const [procesos, setProcesos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  const fetchProcesos = async () => {
    if (!user?.id) return;

    try {
      const { data } = await axios.get(`http://localhost:9999/api/procesos/por-usuario/${user.id}`);
      setProcesos(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const mapTipoProceso = (tipo) => {
    switch (tipo) {
      case "Estancia I":
      case "Estancia II":
        return "Estancia";
      case "Estadía":
        return "Estadía";
      case "Servicio Social":
        return "Servicio Social";
      case "Estadía Nacional":
        return "Estadía Nacional";
      default:
        return null;
    }
  };

  const createProceso = async (formData, tipoProceso) => {
    if (!user?.id) throw new Error("Usuario no encontrado");

    const payload = {
      id_user: user.id,
      id_empresa: formData.empresa,
      id_asesor_academico: formData.asesorAcademico,
      id_programa: formData.programa,
      id_periodo: formData.periodo,
      tipo_proceso: mapTipoProceso(tipoProceso),
    };

    try {
      const { data } = await axios.post("http://localhost:9999/api/procesos", payload);
      await fetchProcesos();
      return data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  };

  const validarRegistroEnPeriodo = async (idPeriodo) => {
    if (!user?.id) throw new Error("Usuario no encontrado");

    try {
      const { data } = await axios.get(`http://localhost:9999/api/procesos/validar/${user.id}/${idPeriodo}`);
      return data; // { registrado: true, proceso: {...} } o { registrado: false }
    } catch (err) {
      throw err.response?.data || err.message;
    }
  };

  useEffect(() => {
    if (user) {
      fetchProcesos();
    }
  }, [user]);

  return {
    procesos,
    loading,
    error,
    fetchProcesos,
    createProceso,
    validarRegistroEnPeriodo,
    user,
  };
};

export default useProcesos;