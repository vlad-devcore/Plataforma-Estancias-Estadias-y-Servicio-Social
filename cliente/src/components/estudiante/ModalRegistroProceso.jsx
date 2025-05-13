import React, { useEffect, useState } from "react";
import axios from "axios";
import useEmpresas from "../hooks/useEmpresas";
import useAsesoresAcademicos from "../hooks/useAsesoresAcademicos";
import { motion, AnimatePresence } from "framer-motion";

const ModalRegistroProceso = ({ open, onClose, onSuccess, tipoProceso, procesoExistente }) => {
  const { companies } = useEmpresas();
  const { asesoresAcademicos } = useAsesoresAcademicos();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [cooldown, setCooldown] = useState(5);
  const [form, setForm] = useState({
    empresa: "",
    asesorAcademico: "",
  });

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (procesoExistente) {
      setForm({
        empresa: procesoExistente.id_empresa || "",
        asesorAcademico: procesoExistente.id_asesor_academico || "",
      });
    }
  }, [procesoExistente]);

  useEffect(() => {
    let timer;
    if (confirmModalOpen && cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [confirmModalOpen, cooldown]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!form.empresa || !form.asesorAcademico) {
      setError("Por favor, selecciona una empresa y un asesor académico.");
      return;
    }
    setError(null);
    setCooldown(5);
    setConfirmModalOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmModalOpen(false);
    setLoading(true);
    try {
      if (procesoExistente) {
        await axios.put(`http://localhost:9999/api/procesos/${procesoExistente.id_proceso}`, {
          id_empresa: form.empresa,
          id_asesor_academico: form.asesorAcademico,
          tipo_proceso: tipoProceso,
        });
      } else {
        const { data: periodos } = await axios.get("http://localhost:9999/api/periodos");
        const periodoActivo = periodos.find((p) => p.EstadoActivo === "Activo");
        if (!periodoActivo) throw new Error("No hay periodo activo");

        await axios.post("http://localhost:9999/api/procesos", {
          id_user: user.id,
          id_empresa: form.empresa,
          id_asesor_academico: form.asesorAcademico,
          id_programa: user.id_programa,
          tipo_proceso: tipoProceso,
          id_periodo: periodoActivo.IdPeriodo,
        });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrar el proceso.");
      console.error("Error al registrar proceso:", err);
    } finally {
      setLoading(false);
    }
  };

  const getNombreEmpresa = (id) => {
    const empresa = companies.find((e) => e.id_empresa === parseInt(id));
    return empresa ? empresa.empresa_nombre : "No seleccionada";
  };

  const getNombreAsesorAcademico = (id) => {
    const asesor = asesoresAcademicos.find((a) => a.id_asesor === parseInt(id));
    return asesor ? asesor.nombre : "No seleccionado";
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-xl space-y-6"
      >
        <div className="bg-gradient-to-r from-red-900 to-red-700 text-white p-4 rounded-t-lg">
          <h2 className="text-white font-semibold">Registro en {tipoProceso}</h2>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center"
          >
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-900 hover:underline">
              Cerrar
            </button>
          </motion.div>
        )}

        {loading ? (
          <div className="text-center text-gray-500 animate-pulse">
            Registrando proceso...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                name="empresa"
                value={form.empresa}
                onChange={handleChange}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Seleccionar empresa</option>
                {companies.map((e) => (
                  <option key={e.id_empresa} value={e.id_empresa}>
                    {e.empresa_nombre}
                  </option>
                ))}
              </select>

              <select
                name="asesorAcademico"
                value={form.asesorAcademico}
                onChange={handleChange}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Seleccionar asesor académico</option>
                {asesoresAcademicos.map((a) => (
                  <option key={a.id_asesor} value={a.id_asesor}>
                    {a.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-gradient-to-r from-red-900 to-red-700 text-white rounded-lg hover:from-red-800 hover:to-red-600 transition-colors disabled:opacity-50 shadow-md"
                disabled={loading}
              >
                {loading ? "Registrando..." : "Registrar"}
              </button>
            </div>
          </>
        )}
      </motion.div>

      {/* Modal de Confirmación */}
      <AnimatePresence>
        {confirmModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Confirmar Registro en {tipoProceso}
              </h3>
              <p className="text-gray-600 mb-4">
                <strong>¡Importante!</strong> Una vez que confirmes, no podrás editar la empresa ni el asesor académico. Por favor, verifica los datos:
              </p>
              <ul className="text-gray-700 mb-4 space-y-2">
                <li>
                  <strong>Empresa:</strong> {getNombreEmpresa(form.empresa)}
                </li>
                <li>
                  <strong>Asesor Académico:</strong> {getNombreAsesorAcademico(form.asesorAcademico)}
                </li>
              </ul>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setConfirmModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={cooldown > 0}
                  className={`px-4 py-2 bg-gradient-to-r from-red-900 to-red-700 text-white rounded-lg transition-colors shadow-md ${
                    cooldown > 0 ? "opacity-50 cursor-not-allowed" : "hover:from-red-800 hover:to-red-600"
                  }`}
                >
                  {cooldown > 0 ? `Confirmar (${cooldown}s)` : "Confirmar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModalRegistroProceso;