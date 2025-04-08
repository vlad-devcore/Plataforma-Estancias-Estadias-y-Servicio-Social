import { motion } from "framer-motion";
import { Plus, Upload } from "lucide-react";
import { useState } from "react";

const UserForm = ({
  mode = "create",
  initialData = {},
  onSubmit,
  onFileUpload,
}) => {
  const [formData, setFormData] = useState(initialData);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setFormData({ ...formData, [name]: files[0] }); // Solo guardamos el primer archivo
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (mode === "import" && formData.file) {
      onFileUpload(formData.file); // Pasa el archivo seleccionado
    } else {
      console.log("Datos enviados:", formData);
      onSubmit(formData); // Para el resto de los modos (crear, editar)
    }
  };

  return (
    <div className="space-y-4">
      {mode === "import" ? (
        <>
          <div className="border-2 border-dashed rounded-lg p-8">
            <div className="flex flex-col items-center space-y-2">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
                className="p-3 rounded-full bg-gray-50"
              >
                <Upload className="h-8 w-8 text-gray-400" />
              </motion.div>
              <span className="text-orange-500">Seleccionar archivo</span>
              <input
                type="file"
                className="hidden"
                id="file-upload"
                name="file" // Añadir name para capturar el archivo
                onChange={handleChange}
                accept=".csv"
              />

              <label
                htmlFor="file-upload"
                className="cursor-pointer text-orange-500"
              >
                Subir archivo CSV
              </label>
              <span className="text-sm text-gray-500">CSV hasta 10MB</span>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center"
          >
            <Upload className="mr-2" />
            Importar Usuarios
          </motion.button>
        </>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              name="nombre"
              value={formData.nombre || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido Paterno
            </label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              name="apellido_paterno"
              value={formData.apellido_paterno || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido Materno
            </label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              name="apellido_materno"
              value={formData.apellido_materno || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Género
            </label>
            <motion.select
              whileFocus={{ scale: 1.02 }}
              name="genero"
              value={formData.genero || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50"
            >
              <option value="">Seleccionar género</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
            </motion.select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <motion.select
              whileFocus={{ scale: 1.02 }}
              name="role"
              value={formData.role || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50"
              required
            >
              <option value="">Seleccionar rol</option>
              <option value="administrador">Administrador</option>
              <option value="asesor_academico">Asesor Académico</option>
              <option value="asesor_empresarial">Asesor Empresarial</option>
              <option value="estudiante">Estudiante</option>
            </motion.select>
          </div>
          {mode === "create" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="password"
                name="password"
                value={formData.password || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50"
                required
              />
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center"
          >
            <Plus className="mr-2" />
            {mode === "create" ? "Crear Usuario" : "Actualizar Usuario"}
          </motion.button>
        </>
      )}
    </div>
  );
};

export default UserForm;
