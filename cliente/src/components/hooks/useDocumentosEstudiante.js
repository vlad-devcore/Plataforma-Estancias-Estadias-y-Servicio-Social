import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const useDocumentosEstudiante = (tipoProceso, procesoIdProp) => {
  const { user, token } = useAuth();

  const [plantillas, setPlantillas] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [procesoId, setProcesoId] = useState(procesoIdProp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  /* =========================
     CONFIGURACIÓN DE TIPOS
     ========================= */

  const tiposDocumentos =
    tipoProceso === "Servicio Social"
      ? [
          "Reporte Mensual 1",
          "Reporte Mensual 2",
          "Reporte Mensual 3",
          "Reporte Mensual 4",
          "Reporte Mensual 5",
          "Reporte Mensual 6",
          "Reporte Mensual 7",
          "Reporte Mensual 8",
          "Reporte Mensual 9",
          "Reporte Mensual 10",
          "Reporte Mensual 11",
          "Reporte Mensual 12",
        ]
      : [
          "Número NSS",
          "Carta de presentación",
          "Carta de aceptación",
          "Cédula de registro",
          "Definición de proyecto",
          "Carta de liberación",
        ];

  const tipoDocumentoMap =
    tipoProceso === "Servicio Social"
      ? {
          "Reporte Mensual 1": 7,
          "Reporte Mensual 2": 8,
          "Reporte Mensual 3": 9,
          "Reporte Mensual 4": 10,
          "Reporte Mensual 5": 11,
          "Reporte Mensual 6": 12,
          "Reporte Mensual 7": 13,
          "Reporte Mensual 8": 14,
          "Reporte Mensual 9": 15,
          "Reporte Mensual 10": 16,
          "Reporte Mensual 11": 17,
          "Reporte Mensual 12": 18,
        }
      : {
          "Número NSS": 19,
          "Carta de presentación": 1,
          "Carta de aceptación": 2,
          "Cédula de registro": 3,
          "Definición de proyecto": 4,
          "Carta de liberación": 5,
        };

  /* =========================
     AXIOS CONFIG
     ========================= */

  const axiosAuth = axios.create({
    baseURL: process.env.REACT_APP_API_ENDPOINT,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  /* =========================
     PLANTILLAS
     ========================= */

  const fetchPlantillas = useCallback(async () => {
    if (!user?.id || !token) return;

    setLoading(true);
    setError(null);

    try {
      const { data } = await axiosAuth.get("/api/documentosAdmin");

      const combined = tiposDocumentos.map((tipo) => {
        const match = data.find((d) => d.nombre_documento === tipo);
        return {
          id_plantilla: match?.id || null,
          IdTipoDoc: tipoDocumentoMap[tipo] || null,
          nombre_documento: tipo,
          nombre_archivo: match?.nombre_archivo || null,
          estado: match?.estado || "Activo",
        };
      });

      setPlantillas(combined);
    } catch (err) {
      setError(err.response?.data?.error || "Error al obtener plantillas");
    } finally {
      setLoading(false);
    }
  }, [user, token, tipoProceso]);

  /* =========================
     DOCUMENTOS
     ========================= */

  const fetchDocumentos = useCallback(async () => {
    if (!procesoId || !user?.id || !token) return;

    setLoading(true);
    setError(null);

    try {
      const { data } = await axiosAuth.get("/api/documentos", {
        params: {
          id_proceso: procesoId,
          id_usuario: user.id,
        },
      });

      setDocumentos(data);
    } catch (err) {
      setError(err.response?.data?.error || "Error al obtener documentos");
    } finally {
      setLoading(false);
    }
  }, [procesoId, user, token]);

  /* =========================
     SUBIR DOCUMENTO
     ========================= */

  const uploadDocumento = async (idTipoDoc, file) => {
    if (!file || !procesoId || !user?.id) {
      setError("Datos incompletos para subir documento");
      return;
    }

    const allowed = ["pdf", "docx", "xlsx"];
    const ext = file.name.split(".").pop().toLowerCase();
    if (!allowed.includes(ext)) {
      setError("Formato de archivo no permitido");
      return;
    }

    const plantilla = plantillas.find((p) => p.IdTipoDoc === idTipoDoc);
    if (!plantilla || plantilla.estado !== "Activo") {
      setError("El formato está bloqueado");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("archivo", file);
    formData.append("IdTipoDoc", idTipoDoc);
    formData.append("id_usuario", user.id);
    formData.append("id_proceso", procesoId);
    formData.append("Estatus", "Pendiente");

    try {
      await axiosAuth.post("/api/documentos/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("Documento subido correctamente");
      fetchDocumentos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al subir documento");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ELIMINAR DOCUMENTO
     ========================= */

  const deleteDocumento = async (idDocumento) => {
    if (!idDocumento || !token) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axiosAuth.delete(`/api/documentos/${idDocumento}`);
      setSuccess("Documento eliminado correctamente");
      fetchDocumentos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar documento");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     EFFECTS
     ========================= */

  useEffect(() => {
    setProcesoId(procesoIdProp);
  }, [procesoIdProp]);

  useEffect(() => {
    fetchPlantillas();
  }, [fetchPlantillas]);

  useEffect(() => {
    fetchDocumentos();
  }, [fetchDocumentos]);

  /* =========================
     UTILS
     ========================= */

  const getFileExtension = (filename) =>
    filename ? filename.split(".").pop().toLowerCase() : null;

  return {
    plantillas,
    documentos,
    procesoId,
    loading,
    error,
    success,
    uploadDocumento,
    deleteDocumento,
    getFileExtension,
    resetMessages: () => {
      setError(null);
      setSuccess(null);
    },
  };
};

export default useDocumentosEstudiante;
