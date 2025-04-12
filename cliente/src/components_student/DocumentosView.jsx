import { useEffect, useState } from "react";
import useProceso from "../components/hooks/useProcesos"
import useProgramasEducativos from "../components/hooks/useProgramasEducativos";
import useEmpresas from "../components/hooks/useEmpresas";
import useUsers from "../components/hooks/useUsers";
import axios from "axios";
import Swal from "sweetalert2";

const DocumentosView = ({ tipoProceso }) => {
  const [user, setUser] = useState(null);
  const [yaRegistrado, setYaRegistrado] = useState(false);
  const [documentos, setDocumentos] = useState([]);
  const [asesores, setAsesores] = useState([]);

  const [formData, setFormData] = useState({
    IdEmpresa: "",
    IdAsesorInterno: "",
    IdAsesorExterno: "",
    IdProgramaEducativo: "",
    IdPeriodo: "",
    TipoProceso: tipoProceso,
  });

  const { programas } = useProgramasEducativos();
  const { registrarProceso, obtenerProcesoPorEstudiante } = useProceso();
  const { companies } = useEmpresas();
  const { getAsesores } = useUsers();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  useEffect(() => {
    const verificarRegistro = async () => {
      if (user?.id) {
        try {
          const data = await obtenerProcesoPorEstudiante(user.id);
          const yaEstaRegistrado = data.some(p => p.TipoProceso === tipoProceso);
          setYaRegistrado(yaEstaRegistrado);

          if (yaEstaRegistrado) {
            const proceso = data.find(p => p.TipoProceso === tipoProceso);
            await cargarDocumentos(proceso.IdProceso);
          }
        } catch (error) {
          console.error("Error al verificar el registro:", error);
        }
      }
    };

    verificarRegistro();
  }, [user, tipoProceso]);

  useEffect(() => {
    const listaAsesores = getAsesores().map(asesor => ({
      Id_asesor: asesor.id_user,
      NombreCompleto: `${asesor.name} ${asesor.lastname}`
    }));
    setAsesores(listaAsesores);
  }, [getAsesores]);

  const cargarDocumentos = async (idProceso) => {
    try {
      const { data } = await axios.get(`http://localhost:9999/api/documentos/proceso/${idProceso}`);
      setDocumentos(data);
    } catch (error) {
      console.error("Error al obtener documentos:", error);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        IdEstudiante: user.id,
      };
      await registrarProceso(payload);
      Swal.fire("¡Registro exitoso!", "", "success");
      setYaRegistrado(true);
    } catch (error) {
      Swal.fire("Error al registrarse", error.message || "Inténtalo de nuevo", "error");
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">{tipoProceso} - Documentos</h2>

      {!yaRegistrado ? (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select name="IdEmpresa" onChange={handleChange} required className="p-2 border rounded">
            <option value="">Selecciona una empresa</option>
            {companies.map(company => (
              <option key={company.IdEmpresa} value={company.IdEmpresa}>
                {company.empresa_nombre}
              </option>
            ))}
          </select>

          <select name="IdAsesorInterno" onChange={handleChange} required className="p-2 border rounded">
            <option value="">Selecciona asesor interno</option>
            {asesores.map(asesor => (
              <option key={asesor.Id_asesor} value={asesor.Id_asesor}>
                {asesor.NombreCompleto}
              </option>
            ))}
          </select>

          <select name="IdAsesorExterno" onChange={handleChange} required className="p-2 border rounded">
            <option value="">Selecciona asesor externo</option>
            {asesores.map(asesor => (
              <option key={asesor.Id_asesor} value={asesor.Id_asesor}>
                {asesor.NombreCompleto}
              </option>
            ))}
          </select>

          <select name="IdProgramaEducativo" onChange={handleChange} required className="p-2 border rounded">
            <option value="">Selecciona programa educativo</option>
            {programas.map(p => (
              <option key={p.IdProgramaEducativo} value={p.IdProgramaEducativo}>
                {p.NombrePrograma}
              </option>
            ))}
          </select>

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded col-span-1 md:col-span-2">
            Registrarse
          </button>
        </form>
      ) : (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Tus documentos</h3>
          {documentos.length === 0 ? (
            <p className="text-gray-500">Aún no has subido ningún documento.</p>
          ) : (
            <table className="w-full border mt-2">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Nombre</th>
                  <th className="p-2 border">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {documentos.map(doc => (
                  <tr key={doc.IdDocumento}>
                    <td className="p-2 border">{doc.Nombre}</td>
                    <td className="p-2 border flex gap-2">
                      <a
                        href={`http://localhost:9999/uploads/${doc.NombreArchivo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Ver
                      </a>
                      <button
                        onClick={async () => {
                          try {
                            await axios.delete(`http://localhost:9999/api/documentos/${doc.IdDocumento}`);
                            cargarDocumentos(doc.FK_Id_Proceso);
                          } catch (err) {
                            console.error("Error al eliminar documento:", err);
                          }
                        }}
                        className="text-red-600 hover:underline"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Subir nuevo documento */}
          <div className="mt-4">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fileInput = e.target.documento;
                if (!fileInput.files.length) return;

                const formData = new FormData();
                formData.append("documento", fileInput.files[0]);
                formData.append("FK_Id_Proceso", documentos[0]?.FK_Id_Proceso || "");

                try {
                  await axios.post("http://localhost:9999/api/documentos", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                  });
                  cargarDocumentos(documentos[0].FK_Id_Proceso);
                } catch (error) {
                  console.error("Error al subir documento:", error);
                }
              }}
              className="flex gap-4 items-center"
            >
              <input type="file" name="documento" required />
              <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded">
                Subir Documento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentosView;
