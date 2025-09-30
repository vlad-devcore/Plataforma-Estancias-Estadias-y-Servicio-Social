import cron from "node-cron";
import pool from "../config/config.db.js";

const tareaActualizarPeriodos = () => {
  // Ejecuta cada minuto
  cron.schedule("* * * * *", async () => {
    const ahora = new Date();

    try {
      const [periodosActivos] = await pool.query(`
        SELECT IdPeriodo, FechaFin, HoraFin 
        FROM periodos 
        WHERE EstadoActivo = 'Activo'
      `);

      for (const periodo of periodosActivos) {
        const fechaHoraFin = new Date(`${periodo.FechaFin}T${periodo.HoraFin}`);

        if (ahora > fechaHoraFin) {
          await pool.query(`
            UPDATE periodos SET EstadoActivo = 'Inactivo' WHERE IdPeriodo = ?
          `, [periodo.IdPeriodo]);
        }
      }

      // Sincronizar estado de formatos con el periodo de IdPeriodo más alto, respetando modificaciones manuales
      const [ultimoPeriodo] = await pool.query(`
        SELECT EstadoActivo 
        FROM periodos 
        ORDER BY IdPeriodo DESC 
        LIMIT 1
      `);
      if (ultimoPeriodo.length > 0) {
        const nuevoEstado = ultimoPeriodo[0].EstadoActivo === 'Inactivo' ? 'Bloqueado' : 'Activo';
        const [formatos] = await pool.query(`
          SELECT nombre_documento, estado, ultima_modificacion_manual 
          FROM formatos_admin
        `);

        const now = new Date();
        for (const formato of formatos) {
          const ultimaModificacion = formato.ultima_modificacion_manual ? new Date(formato.ultima_modificacion_manual) : null;
          const tiempoTranscurrido = ultimaModificacion ? (now - ultimaModificacion) / (1000 * 60 * 60) : 24; // Horas transcurridas

          // Solo actualizar si no ha sido modificado manualmente en las últimas 24 horas
          if (!ultimaModificacion || tiempoTranscurrido > 24) {
            if (formato.estado !== nuevoEstado) {
              await pool.query(
                "UPDATE formatos_admin SET estado = ? WHERE nombre_documento = ?",
                [nuevoEstado, formato.nombre_documento]
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("❌ Error al actualizar periodos automáticamente:", error);
    }
  });
};

export default tareaActualizarPeriodos;