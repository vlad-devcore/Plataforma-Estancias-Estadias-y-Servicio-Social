import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PlantillaServicio from "../PlantillaServicio";
import { FileText } from "lucide-react";
import ModalRegistroProceso from "../../components/estudiante/ModalRegistroProceso";
import axios from "axios";
import TablaDocumentos from "../../components_student/TablaDocumentoss";

const Estadias = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [procesoActivo, setProcesoActivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchProcesoActivo = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user?.id) throw new Error("Usuario no autenticado");

      // Obtener periodo activo
      const { data: periodos } = await axios.get("http://localhost:9999/api/periodos");
      const periodoActivo = periodos.find((p) => p.EstadoActivo === "Activo");
      if (!periodoActivo) throw new Error("No hay periodo activo");

      // Validar proceso en el periodo activo
      const { data } = await axios.get(
        `http://localhost:9999/api/procesos/validar/${user.id}/${periodoActivo.IdPeriodo}`
      );
      console.log("🔐 Validación proceso (Estadía):", data);

      if (data.registrado) {
        if (data.proceso.tipo_proceso === "Estadía") {
          // Proceso registrado es Estadía, mostrar tabla
          setIsRegistered(true);
          setProcesoActivo(data.proceso);
        } else if (data.proceso.tipo_proceso) {
          // Registrado en otro proceso, mostrar error
          setError(`Ya estás registrado en ${data.proceso.tipo_proceso} para este periodo.`);
          setIsRegistered(false);
          setProcesoActivo(null);
        } else {
          // Proceso incompleto (tipo_proceso es NULL)
          setIsRegistered(false);
          setProcesoActivo(data.proceso);
          setShowModal(true);
        }
      } else {
        // No hay proceso, mostrar modal para registrar
        setIsRegistered(false);
        setProcesoActivo(null);
        setShowModal(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error al verificar el proceso.");
      setIsRegistered(false);
      setProcesoActivo(null);
      console.error("Error al verificar registro (Estadía):", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesoActivo();
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
      titulo="Estadías"
      descripcion="Gestiona tu proceso de Estadías, sube tus documentos y da seguimiento a tu progreso académico."
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex justify-between items-center"
          >
            <span>{error}</span>
           
          </motion.div>
        )}

        {loading && (
          <div className="text-center text-gray-500 animate-pulse">
            Verificando registro...
          </div>
        )}

        {!loading && (
          <>
            {!isRegistered && !error && (
              <motion.button
                onClick={handleOpenModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto bg-gradient-to-r from-red-900 to-red-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3 mb-6 shadow-md hover:from-red-800 hover:to-red-600"
              >
                <FileText className="w-5 h-5" />
                <span className="font-semibold">Registrar Estadías</span>
              </motion.button>
            )}

            <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gradient-to-r from-red-900 to-red-700 text-white">
                <h2 className="text-white sm:text-2xl font-semibold">
                  Documentos Requeridos
                </h2>
              </div>

              {isRegistered && procesoActivo ? (
                <div className="p-4">
                  <TablaDocumentos tipoProceso="Estadía" procesoId={procesoActivo.id_proceso} />
                </div>
              ) : (
                <div className="p-4 text-gray-500 italic">
                  Regístrate para comenzar a subir tus documentos de Estadías.
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>

      {showModal && (
        <ModalRegistroProceso
          open={showModal}
          onClose={handleCloseModal}
          tipoProceso="Estadía"
          procesoExistente={procesoActivo}
          onSuccess={handleSuccess}
        />
      )}
    </PlantillaServicio>
  );
};

export default Estadias;