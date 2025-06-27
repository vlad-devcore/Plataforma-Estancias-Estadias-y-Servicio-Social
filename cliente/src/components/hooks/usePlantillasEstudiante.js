// src/hooks/usePlantillasEstudiante.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const usePlantillasEstudiante = () => {
  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tiposDocumentos = [
    'Carta de presentación',
    'Carta de aceptación',
    'Cédula de registro',
    'Definición de proyecto',
    'Carta de liberación',
    'Guía de uso',
    'Reporte Mensual'
  ];

  const getFileExtension = (filename) => {
    if (!filename) return null;
    return filename.split('.').pop().toLowerCase();
  };

  const fetchPlantillas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://189.203.249.19:3011/api/documentosAdmin');
      const data = response.data;

      const combined = tiposDocumentos.map(tipo => {
        const match = data.find(d => d.nombre_documento === tipo);
        return {
          nombre_documento: tipo,
          nombre_archivo: match?.nombre_archivo || null,
          id: match?.id || null,
        };
      });

      setPlantillas(combined);
    } catch (err) {
      setError('Error al obtener las plantillas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlantillas();
  }, []);

  return { plantillas, loading, error, getFileExtension };
};

export default usePlantillasEstudiante;
