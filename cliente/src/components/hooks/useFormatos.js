import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const useFormatos = () => {
  const { user, token } = useAuth();

  const [formatos, setFormatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const API_BASE = `${process.env.REACT_APP_API_ENDPOINT}/api/documentosAdmin`;

  /* =========================
     TIPOS DE DOCUMENTOS
     ========================= */
  const tiposDocumentos = [
    "Número NSS",
    "Carta de presentación",
    "Carta de aceptación",
    "Cédula de registro",
    "Definición de proyecto",
    "Carta de liberación",
    "Guía de uso",
    "Reporte Mensual",
  ];

  /* =========================
     AXIOS CON AUTH
     ========================= */
  const axiosAuth = axios.create({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  /* =========================
     OBTENER FORMATOS
     ========================= */
  const fetchFormatos = useCallback(async () => {
    if (!user || !token) return;

    setLoading(true);
    setError(null);

    try {
      const { data } = await axiosAuth.get(API_BASE);

      const combined = tiposDocumentos.map((tipo) => {
        const formato = data.find((f) => f.nombre_documento === tipo);
        return {
          id: formato?.id || null,
          nombre_documento: tipo,
          nombre_archivo: formato?.nombre_archivo || null,
          estado: formato?.estado || "Activo",
          ultima_modificacion_manual:
            formato?.ultima_modificacion_manual || null,
        };
      });

      setFormatos(combined);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar formatos");
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  /* =========================
     SUBIR / ACTUALIZAR FORMATO
     ========================= */
  const uploadFormato = async (nombreDocumento, archivo) => {
    if (!archivo || !token) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("archivo", archivo);
      formData.append("nombre_documento", nombreDocumento);

      await axiosAuth.post(`${API_BASE}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Formato subido correctamente");
      fetchFormatos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al subir formato");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     CAMBIAR ESTADO
     ========================= */
  const updateEstadoFormato = async (nombreDocumento, nuevoEstado) => {
    if (!token) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axiosAuth.put(`${API_BASE}/estado`, {
        nombre_documento: nombreDocumento,
        estado: nuevoEstado,
      });

      setSuccess(`Estado actualizado a "${nuevoEstado}"`);
      fetchFormatos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar estado");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     DESCARGAR
     ========================= */
  const downloadFormato = (nombreDocumento) => {
    if (!nombreDocumento) return;

    window.open(
      `${API_BASE}/download/${encodeURIComponent(nombreDocumento)}`,
      "_blank"
    );
  };

  /* =========================
     ELIMINAR
     ========================= */
  const deleteFormato = async (nombreDocumento) => {
    if (!token) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axiosAuth.delete(
        `${API_BASE}/${encodeURIComponent(nombreDocumento)}`
      );

      setSuccess("Formato eliminado correctamente");
      fetchFormatos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar formato");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     HELPERS
     ========================= */
  const getFileExtension = (filename) => {
    if (!filename) return null;
    return filename.split(".").pop().toLowerCase();
  };

  /* =========================
     EFFECT
     ========================= */
  useEffect(() => {
    fetchFormatos();
  }, [fetchFormatos]);

  return {
    formatos,
    loading,
    error,
    success,
    tiposDocumentos,
    fetchFormatos,
    uploadFormato,
    updateEstadoFormato,
    downloadFormato,
    deleteFormato,
    getFileExtension,
    resetMessages: () => {
      setError(null);
      setSuccess(null);
    },
  };
};

export default useFormatos;
