import { useState, useEffect, useMemo } from "react";
import axios from "axios";

const useDocumentosEstudiante = (tipoProceso, procesoIdProp) => {
  const [plantillas, setPlantillas] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [procesoId, setProcesoId] = useState(procesoIdProp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const user = useMemo(() => JSON.parse(localStorage.getItem("user")), []);

  // Definir documentos según el tipo de proceso
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
          "Número NSS", // Movido al inicio para que sea la primera fila
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
          "Número NSS": 19, // Mapeo para IdTipoDoc 19
          "Carta de presentación": 1,
          "Carta de aceptación": 2,
          "Cédula de registro": 3,
          "Definición de proyecto": 4,
          "Carta de liberación": 5,
        };

  const fetchPlantillas = async () => {
    if (!user?.id) {
      setError("Usuario no autenticado");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_ENDPOINT}/api/documentosAdmin`
      );
      const data = response.data;

      const combined = tiposDocumentos.map((tipo) => {
        const match = data.find((d) => d.nombre_documento === tipo);
        return {
          id_plantilla: match?.id || null,
          IdTipoDoc: tipoDocumentoMap[tipo] || null,
          nombre_documento: tipo,
          nombre_archivo: match?.nombre_archivo || null,
          estado: match?.estado || 'Activo',
        };
      });

      setPlantillas(combined);
    } catch (err) {
      setError(err.response?.data?.error || "Error al obtener plantillas");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentos = async () => {
    if (!procesoId || !user?.id) {
      setError("No hay proceso activo o usuario no autenticado");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_ENDPOINT}/api/documentos`,
        {
          params: { id_proceso: procesoId, id_usuario: user.id },
        }
      );
      setDocumentos(data);
    } catch (err) {
      setError(
        err.response?.data?.error || "Error al obtener documentos subidos"
      );
    } finally {
      setLoading(false);
    }
  };

  const uploadDocumento = async (idTipoDoc, file) => {
    if (!file || !procesoId || !user?.id) {
      setError(
        "No se seleccionó archivo, no hay proceso activo o usuario no autenticado"
      );
      return;
    }

    const allowedTypes = [".pdf", ".docx", ".xlsx"];
    const fileExtension = `.${file.name.toLowerCase().split(".").pop()}`;

    if (!allowedTypes.includes(fileExtension)) {
      setError("Solo se permiten archivos PDF, Word (.docx) o Excel (.xlsx)");
      return;
    }

    const plantilla = plantillas.find((p) => p.IdTipoDoc === idTipoDoc);
    if (!plantilla || plantilla.estado !== 'Activo') {
      setError('El formato está bloqueado o no está disponible');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("archivo", file);
    formData.append("IdTipoDoc", idTipoDoc);
    formData.append("id_usuario", user.id);
    formData.append("Comentarios", "");
    formData.append("Estatus", "Pendiente");
    formData.append("id_proceso", procesoId);

    try {
      await axios.post(
        `${process.env.REACT_APP_API_ENDPOINT}/api/documentos/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setSuccess("Documento subido correctamente");
      await fetchDocumentos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al subir documento");
    } finally {
      setLoading(false);
    }
  };

  const deleteDocumento = async (idDocumento) => {
    if (!procesoId || !user?.id) {
      setError("No hay proceso activo o usuario no autenticado");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_ENDPOINT}/api/documentos/${idDocumento}`
      );
      setSuccess("Documento eliminado correctamente");
      await fetchDocumentos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar documento");
    } finally {
      setLoading(false);
    }
  };

  const getFileExtension = (filename) => {
    if (!filename) return null;
    return filename.split(".").pop().toLowerCase();
  };

  useEffect(() => {
    setProcesoId(procesoIdProp);
  }, [procesoIdProp]);

  useEffect(() => {
    if (user?.id) {
      fetchPlantillas();
    }
  }, [user?.id, tipoProceso]);

  useEffect(() => {
    if (procesoId) {
      fetchDocumentos();
    }
  }, [procesoId]);

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