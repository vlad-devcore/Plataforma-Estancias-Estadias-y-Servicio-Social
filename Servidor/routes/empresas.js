import express from "express";
import pool from "../config/config.db.js";

const router = express.Router();

// Obtener todas las empresas
const getEmpresas = async (req, res) => {
  try {
    const [results] = await pool.query("SELECT * FROM empresa");
    res.status(200).json(results);
  } catch (error) {
    console.error("Error al obtener empresas:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener empresa por ID
const getEmpresaById = async (req, res) => {
  const { id_empresa } = req.params;
  try {
    const [results] = await pool.query(
      "SELECT * FROM empresa WHERE id_empresa = ?",
      [id_empresa]
    );
    if (results.length === 0)
      return res.status(404).json({ error: "Empresa no encontrada" });
    res.status(200).json(results[0]);
  } catch (error) {
    console.error("Error al obtener la empresa:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const postEmpresa = async (req, res) => {
  const {
    empresa_rfc,
    empresa_nombre,
    empresa_direccion,
    empresa_email,
    empresa_telefono,
    empresa_tamano,
    empresa_sociedad,
    empresa_pagina_web,
  } = req.body;

  // Validar campos obligatorios
  if (!empresa_rfc || !empresa_nombre || !empresa_tamano || !empresa_sociedad) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  // Validar valores permitidos para empresa_tamano
  const tamanosPermitidos = ["Grande", "Mediana", "Pequeña"];
  if (!tamanosPermitidos.includes(empresa_tamano)) {
    return res
      .status(400)
      .json({
        error:
          "Valor no válido para empresa_tamano. Los valores permitidos son: 'Grande', 'Mediana', 'Pequeña'",
      });
  }

  // Validar valores permitidos para empresa_sociedad
  const sociedadesPermitidas = ["Privada", "Publica"];
  if (!sociedadesPermitidas.includes(empresa_sociedad)) {
    return res
      .status(400)
      .json({
        error:
          "Valor no válido para empresa_sociedad. Los valores permitidos son: 'Privada', 'Publica'",
      });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Verificar si el RFC ya existe
    const [existingEmpresa] = await connection.query(
      "SELECT id_empresa FROM empresa WHERE empresa_rfc = ?",
      [empresa_rfc]
    );

    if (existingEmpresa.length > 0) {
      return res
        .status(400)
        .json({ error: "El RFC de la empresa ya está registrado" });
    }

    // Insertar empresa en la base de datos
    const [results] = await connection.query(
      "INSERT INTO empresa (empresa_rfc, empresa_nombre, empresa_direccion, empresa_email, empresa_telefono, empresa_tamano, empresa_sociedad, empresa_pagina_web) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        empresa_rfc,
        empresa_nombre,
        empresa_direccion,
        empresa_email,
        empresa_telefono,
        empresa_tamano,
        empresa_sociedad,
        empresa_pagina_web,
      ]
    );

    await connection.commit();
    res
      .status(201)
      .json({
        message: "Empresa añadida correctamente",
        id_empresa: results.insertId,
      });
  } catch (error) {
    await connection.rollback();
    console.error("Error al agregar empresa:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    connection.release();
  }
};

const updateEmpresa = async (req, res) => {
  // 1. Mostrar parámetros y body recibidos
  console.log("📦 Parámetros recibidos:", req.params);
  console.log("📤 Body recibido:", req.body);

  // 2. Resto del código (validaciones y lógica)
  const { id_empresa } = req.params;
  const {
    empresa_rfc,
    empresa_nombre,
    empresa_direccion,
    empresa_email,
    empresa_telefono,
    empresa_tamano,
    empresa_sociedad,
    empresa_pagina_web,
  } = req.body;
  // Validar campos obligatorios
  if (!empresa_rfc || !empresa_nombre || !empresa_tamano || !empresa_sociedad) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  // Validar valores permitidos para empresa_tamano
  const tamanosPermitidos = ["Grande", "Mediana", "Pequeña"];
  if (!tamanosPermitidos.includes(empresa_tamano)) {
    return res
      .status(400)
      .json({
        error:
          "Valor no válido para empresa_tamano. Los valores permitidos son: 'Grande', 'Mediana', 'Pequeña'",
      });
  }

  // Validar valores permitidos para empresa_sociedad
  const sociedadesPermitidas = ["Privada", "Publica"];
  if (!sociedadesPermitidas.includes(empresa_sociedad)) {
    return res
      .status(400)
      .json({
        error:
          "Valor no válido para empresa_sociedad. Los valores permitidos son: 'Privada', 'Publica'",
      });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Verificar si la empresa existe
    const [empresaExistente] = await connection.query(
      "SELECT id_empresa FROM empresa WHERE id_empresa = ?",
      [id_empresa]
    );

    if (empresaExistente.length === 0) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    // Verificar si el nuevo RFC ya existe en otra empresa
    const [existingEmpresa] = await connection.query(
      "SELECT id_empresa FROM empresa WHERE empresa_rfc = ? AND id_empresa != ?",
      [empresa_rfc, id_empresa]
    );

    if (existingEmpresa.length > 0) {
      return res
        .status(400)
        .json({
          error: "El RFC de la empresa ya está registrado en otra empresa",
        });
    }

    // Actualizar empresa en la base de datos
    const [results] = await connection.query(
      "UPDATE empresa SET empresa_rfc = ?, empresa_nombre = ?, empresa_direccion = ?, empresa_email = ?, empresa_telefono = ?, empresa_tamano = ?, empresa_sociedad = ?, empresa_pagina_web = ? WHERE id_empresa = ?",
      [
        empresa_rfc,
        empresa_nombre,
        empresa_direccion,
        empresa_email,
        empresa_telefono,
        empresa_tamano,
        empresa_sociedad,
        empresa_pagina_web,
        id_empresa,
      ]
    );

    // Verificar si se actualizó alguna fila
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    await connection.commit();
    res.status(200).json({ message: "Empresa actualizada correctamente" });
  } catch (error) {
    await connection.rollback();
    console.error("Error al actualizar empresa:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    connection.release();
  }
};

// Eliminar empresa
const deleteEmpresa = async (req, res) => {
  const { id_empresa } = req.params;
  try {
    const [results] = await pool.query(
      "DELETE FROM empresa WHERE id_empresa = ?",
      [id_empresa]
    );
    if (results.affectedRows === 0)
      return res.status(404).json({ error: "Empresa no encontrada" });
    res.status(200).json({ message: "Empresa eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar empresa:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Definir rutas
router.get("/", getEmpresas);
router.get("/:id_empresa", getEmpresaById);
router.post("/", postEmpresa);
router.put("/:id_empresa", updateEmpresa);
router.delete("/:id_empresa", deleteEmpresa);

export default router;
