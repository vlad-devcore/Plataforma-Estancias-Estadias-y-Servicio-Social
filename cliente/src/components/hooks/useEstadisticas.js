import { useState, useEffect } from 'react';
import api from "../../axiosConfig"; // ✅ Ruta correcta confirmada

const useEstadisticas = () => {
  const [estadisticas, setEstadisticas] = useState({
    periodoActual: {
      EstanciaI: 0,
      EstanciaII: 0,
      Estadia: 0,
      ServicioSocial: 0,
      EstadiaNacional: 0,
    },
    globales: {
      totalUsuarios: 0,
      EstanciaI: 0,
      EstanciaII: 0,
      Estadia: 0,
      ServicioSocial: 0,
      EstadiaNacional: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEstadisticas = async () => {
      setLoading(true);
      setError(null);
      try {
        // ✅ Obtener periodo activo
        const { data: periodos } = await api.get('/periodos');
        const periodoActivo = periodos.find((p) => p.EstadoActivo === 'Activo');
        
        if (!periodoActivo) {
          throw new Error('No hay periodo activo');
        }

        // ✅ Obtener procesos
        const { data: procesos } = await api.get('/procesos');

        // ✅ Obtener total de usuarios
        const { data: estudiantes } = await api.get('/estudiantes');

        // 📊 Calcular estadísticas
        const tiposProceso = [
          'Estancia I',
          'Estancia II',
          'Estadía',
          'Servicio Social',
          'Estadía Nacional',
        ];

        const periodoActual = {
          EstanciaI: 0,
          EstanciaII: 0,
          Estadia: 0,
          ServicioSocial: 0,
          EstadiaNacional: 0,
        };

        const globales = {
          totalUsuarios: estudiantes.length,
          EstanciaI: 0,
          EstanciaII: 0,
          Estadia: 0,
          ServicioSocial: 0,
          EstadiaNacional: 0,
        };

        // 🔢 Contar procesos por tipo
        procesos.forEach((proceso) => {
          const tipo = proceso.tipo_proceso;
          
          if (tipo && tiposProceso.includes(tipo)) {
            // Normalizar nombre del tipo para usar como clave
            let clave = tipo
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/\s+/g, '')
              .replace('EstanciaI', 'EstanciaI')
              .replace('EstanciaII', 'EstanciaII')
              .replace('Estadia', 'Estadia')
              .replace('ServicioSocial', 'ServicioSocial')
              .replace('EstadiaNacional', 'EstadiaNacional');

            // Mapeo manual para asegurar claves correctas
            const mapeoTipos = {
              'EstanciaI': 'EstanciaI',
              'EstanciaII': 'EstanciaII',
              'Estadia': 'Estadia',
              'ServicioSocial': 'ServicioSocial',
              'EstadiaNacional': 'EstadiaNacional',
            };

            clave = mapeoTipos[clave] || clave;

            // Incrementar contador global
            if (globales.hasOwnProperty(clave)) {
              globales[clave] += 1;
            }

            // Incrementar contador del periodo actual
            const idPeriodoProc = Number(proceso.id_periodo);
            const idPeriodoActivo = Number(periodoActivo.IdPeriodo);
            
            if (idPeriodoProc === idPeriodoActivo && periodoActual.hasOwnProperty(clave)) {
              periodoActual[clave] += 1;
            }
          }
        });

        setEstadisticas({ periodoActual, globales });
        
      } catch (err) {
        const mensaje = err.response?.data?.error || err.message || 'Error al obtener estadísticas';
        setError(mensaje);
        console.error('Error fetchEstadisticas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEstadisticas();
  }, []);

  return { estadisticas, loading, error };
};

export default useEstadisticas;