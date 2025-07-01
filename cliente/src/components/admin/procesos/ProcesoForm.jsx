import { useState, useEffect } from 'react';
import axios from 'axios';
 

const ProcesoForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    id_empresa: initialData.id_empresa || '',
    id_asesor_academico: initialData.id_asesor_academico || '',
    tipo_proceso: initialData.tipo_proceso || ''
  });
  const [empresas, setEmpresas] = useState([]);
  const [asesores, setAsesores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
   

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const [empresasRes, asesoresRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/empresas`),
          axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/asesores`)
        ]);
        setEmpresas(empresasRes.data);
        setAsesores(asesoresRes.data);
        setError(null);
      } catch (err) {
        setError('Error al cargar opciones');
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      {loading && <div className="text-gray-500">Cargando opciones...</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
        <select
          name="id_empresa"
          value={formData.id_empresa}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        >
          <option value="">Selecciona una empresa</option>
          {empresas.map((empresa) => (
            <option key={empresa.id_empresa} value={empresa.id_empresa}>
              {empresa.empresa_nombre}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Asesor Académico</label>
        <select
          name="id_asesor_academico"
          value={formData.id_asesor_academico}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        >
          <option value="">Selecciona un asesor</option>
          {asesores.map((asesor) => (
            <option key={asesor.id_asesor_academico} value={asesor.id_asesor_academico}>
              {asesor.nombre}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Proceso</label>
        <select
          name="tipo_proceso"
          value={formData.tipo_proceso}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        >
          <option value="">Selecciona un tipo</option>
          <option value="Estancia">Estancia</option>
          <option value="Estadía">Estadía</option>
          <option value="Servicio Social">Servicio Social</option>
          <option value="Estadía Nacional">Estadía Nacional</option>
        </select>
      </div>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Actualizar
        </button>
      </div>
    </form>
  );
};

export default ProcesoForm;