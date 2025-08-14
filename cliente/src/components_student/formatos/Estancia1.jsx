import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PlantillaServicio from "../PlantillaServicio";
import { FileText } from "lucide-react";
import ModalRegistroProceso from "../../components/estudiante/ModalRegistroProceso";
import axios from "axios";
import TablaDocumentos from "../../components_student/TablaDocumentoss";

const Estancia1 = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [procesoActivo, setProcesoActivo] = useState(null);
  const [error, setError] = useState(null);
  const [periodoExpirado, setPeriodoExpirado] = useState(false);
  const [todosBloqueados, setTodosBloqueados] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchProcesoActivo = async () => {
    try {
      if (!user?.id) throw new Error("Usuario no autenticado");

      const { data: periodos } = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/periodos`);
      const periodoActivo = periodos.find((p) => p.EstadoActivo === "Activo");
      setPeriodoExpirado(!periodoActivo);

      const { data: formatos } = await axios.get(
        `${process.env.REACT_APP_API_ENDPOINT}/api/documentosAdmin`
      );
      const hayFormatosActivos = formatos.some((f) => f.estado === "Activo");
      if (!periodoActivo && !hayFormatosActivos) setTodosBloqueados(true);

      const periodoId = periodoActivo?.IdPeriodo || (periodos.length > 0 ? periodos[periodos.length - 1].IdPeriodo : null);
      if (!periodoId) throw new Error("No hay periodos disponibles.");

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_ENDPOINT}/api/procesos/validar/${user.id}/${periodoId}`
      );
      console.log("Validación proceso:", data);

      if (data.registrado) {
        if (data.proceso.tipo_proceso === "Estancia I") {
          setIsRegistered(true);
          setProcesoActivo(data.proceso);
        } else if (data.proceso.tipo_proceso) {
          setError(`Ya estás registrado en ${data.proceso.tipo_proceso} para este periodo.`);
        } else {
          setProcesoActivo(data.proceso);
          setShowModal(true);
        }
      } else {
        setShowModal(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error al verificar el proceso.");
      console.error("Error al verificar registro:", err);
    }
  };

  useEffect(() => {
    fetchProcesoActivo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSuccess = async () => {
    setIsRegistered(true);
    await fetchProcesoActivo();
    handleCloseModal();
  };

  return (
    <PlantillaServicio
      titulo="Estancia I"
      descripcion="Gestiona tu proceso de Estancia I, sube tus documentos y da seguimiento a tu progreso académico."
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6"
      >
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {!isRegistered && !error && (
          <motion.button
            onClick={handleOpenModal}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 mb-4"
          >
            <FileText className="w-4 h-4" />
            <span>Registrar para subir documentos</span>
          </motion.button>
        )}

        <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gradient-to-r from-red-900 to-red-700 text-white">
            <h2 className="text-white sm:text-2xl font-semibold">
              Documentos Requeridos
            </h2>
          </div>

          {(periodoExpirado || todosBloqueados) && isRegistered && procesoActivo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-t-lg text-center"
            >
              <span>⚠️ {todosBloqueados ? "No hay periodo activo ni formatos manualmente activados. Todos los documentos están bloqueados." : "El periodo ha expirado. Los documentos manualmente activados están disponibles."}</span>
            </motion.div>
          )}

          {isRegistered && procesoActivo ? (
            <div className="p-4">
              <TablaDocumentos tipoProceso="Estancia I" procesoId={procesoActivo.id_proceso} todosBloqueados={todosBloqueados} />
            </div>
          ) : (
            <div className="p-4 text-gray-500 italic">
              Debes registrarte para poder subir documentos.
            </div>
          )}
        </div>
      </motion.div>

      {showModal && (
        <ModalRegistroProceso
          open={showModal}
          onClose={handleCloseModal}
          tipoProceso="Estancia I"
          procesoExistente={procesoActivo}
          onSuccess={handleSuccess}
        />
      )}
    </PlantillaServicio>
  );
};

export default Estancia1;