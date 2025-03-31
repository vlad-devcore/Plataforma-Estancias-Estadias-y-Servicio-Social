import express from "express";
import pool from "../config/config.db.js";

const router = express.Router();

// Obtener todos los documentos
const getDocumentos = async (req, res) => {
    try {
        const [results] = await pool.query("SELECT * FROM documentos");
        res.status(200).json(results);
    } catch (error) {
        console.error("Error al obtener documentos:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Obtener documento por ID
const getDocumentoById = async (req, res) => {
    const { id_Documento } = req.params;
    try {
        const [results] = await pool.query("SELECT * FROM documentos WHERE id_Documento = ?", [id_Documento]);
        if (results.length === 0) return res.status(404).json({ error: "Documento no encontrado" });
        res.status(200).json(results[0]);
    } catch (error) {
        console.error("Error al obtener el documento:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Agregar un nuevo documento
const postDocumento = async (req, res) => {
    const { NombreArchivo, RutaArchivo, IdTipoDoc, id_usuario, Comentarios, Estatus, id_proceso } = req.body;
    if (!NombreArchivo || !RutaArchivo || !IdTipoDoc || !id_usuario || !Estatus) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try {
        const [results] = await pool.query(
            "INSERT INTO documentos (NombreArchivo, RutaArchivo, IdTipoDoc, id_usuario, Comentarios, Estatus, id_proceso) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [NombreArchivo, RutaArchivo, IdTipoDoc, id_usuario, Comentarios, Estatus, id_proceso]
        );
        res.status(201).json({ message: "Documento añadido correctamente", id_Documento: results.insertId });
    } catch (error) {
        console.error("Error al agregar documento:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Actualizar documento
const updateDocumento = async (req, res) => {
    const { id_Documento } = req.params;
    const { NombreArchivo, RutaArchivo, IdTipoDoc, id_usuario, Comentarios, Estatus, id_proceso } = req.body;
    if (!NombreArchivo || !RutaArchivo || !IdTipoDoc || !id_usuario || !Estatus) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try {
        const [results] = await pool.query(
            "UPDATE documentos SET NombreArchivo = ?, RutaArchivo = ?, IdTipoDoc = ?, id_usuario = ?, Comentarios = ?, Estatus = ?, id_proceso = ? WHERE id_Documento = ?",
            [NombreArchivo, RutaArchivo, IdTipoDoc, id_usuario, Comentarios, Estatus, id_proceso, id_Documento]
        );
        if (results.affectedRows === 0) return res.status(404).json({ error: "Documento no encontrado" });
        res.status(200).json({ message: "Documento actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar documento:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Eliminar documento
const deleteDocumento = async (req, res) => {
    const { id_Documento } = req.params;
    try {
        const [results] = await pool.query("DELETE FROM documentos WHERE id_Documento = ?", [id_Documento]);
        if (results.affectedRows === 0) return res.status(404).json({ error: "Documento no encontrado" });
        res.status(200).json({ message: "Documento eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar documento:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Definir rutas
router.get("/", getDocumentos);
router.get("/:id_Documento", getDocumentoById);
router.post("/", postDocumento);
router.put("/:id_Documento", updateDocumento);
router.delete("/:id_Documento", deleteDocumento);

export default router;