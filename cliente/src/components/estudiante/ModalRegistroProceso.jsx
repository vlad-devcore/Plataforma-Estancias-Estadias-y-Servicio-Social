import React, { useEffect, useState } from "react";
import axios from "axios";
import useEmpresas from "../hooks/useEmpresas";
import useAsesoresAcademicos from "../hooks/useAsesoresAcademicos";
import useAsesoresEmpresariales from "../hooks/useAsesoresEmpresariales";
import { motion } from "framer-motion";

const ModalRegistroProceso = ({ open, onClose, onSuccess, tipoProceso, procesoExistente }) => {
  const { companies } = useEmpresas();
  const { asesoresAcademicos } = useAsesoresAcademicos();
  const { asesoresEmpresariales } = useAsesoresEmpresariales();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    empresa: "",
    asesorAcademico: "",
    asesorEmpresarial: "",
  });

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (procesoExistente) {
      setForm({
        empresa: procesoExistente.id_empresa || "",
        asesorAcademico: procesoExistente.id_asesor_academico || "",
        asesorEmpresarial: procesoExistente.id_asesor_empresarial || "",
      });
    }
  }, [procesoExistente]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.empresa || !form.asesorAcademico || !form.asesorEmpresarial) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (procesoExistente) {
        // Actualizar proceso existente
        await axios.put(`http://localhost:9999/api/procesos/${procesoExistente.id_proceso}`, {
          id_empresa: form.empresa,
          id_asesor_academico: form.asesorAcademico,
          id_asesor_empresarial: form.asesorEmpresarial,
          tipo_proceso: tipoProceso,
        });
      } else {
        // Crear nuevo proceso
        const { data: periodos } = await axios.get("http://localhost:9999/api/periodos");
        const periodoActivo = periodos.find((p) => p.EstadoActivo === "Activo");
        if (!periodoActivo) throw new Error("No hay periodo activo");

        await axios.post("http://localhost:9999/api/procesos", {
          id_user: user.id,
          id_empresa: form.empresa,
          id_asesor_academico: form.asesorAcademico,
          id_asesor_empresarial: form.asesorEmpresarial,
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
          <h2 className="text-xl font-semibold">Registro en {tipoProceso}</h2>
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

              <select
                name="asesorEmpresarial"
                value={form.asesorEmpresarial}
                onChange={handleChange}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Seleccionar asesor empresarial</option>
                {asesoresEmpresariales.map((a) => (
                  <option key={a.id_asesor_emp} value={a.id_asesor_emp}>
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
    </div>
  );
};

export default ModalRegistroProceso;