import express from "express";
import pool from "../config/config.db.js";

const router = express.Router();

// Middleware para verificar rol de admin (debes tener esto en tu proyecto)
const isAdmin = (req, res, next) => {
    if (req.user && req.user.rol === 'admin') {
        return next();
    }
    return res.status(403).json({ error: "Acceso denegado. Solo administradores." });
};

// Middleware para verificar que el usuario accede a su propia información
const isOwnerOrAdmin = (req, res, next) => {
    const requestedUserId = req.params.id_user || req.body.id_user;
    
    if (req.user && (req.user.rol === 'admin' || req.user.id_user === parseInt(requestedUserId))) {
        return next();
    }
    return res.status(403).json({ error: "Acceso denegado." });
};

// Obtener todos los estudiantes (SOLO ADMIN)
const getEstudiantes = async (req, res) => {
    try {
        const [results] = await pool.query("SELECT * FROM estudiantes");
        res.status(200).json(results);
    } catch (error) {
        console.error("Error al obtener estudiantes:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Obtener estudiante por ID (ADMIN o el mismo estudiante)
const getEstudianteById = async (req, res) => {
    const { id_estudiante } = req.params;
    try {
        const [results] = await pool.query(
            "SELECT * FROM estudiantes WHERE id_estudiante = ?", 
            [id_estudiante]
        );
        
        if (results.length === 0) {
            return res.status(404).json({ error: "Estudiante no encontrado" });
        }

        // Verificar que el usuario tenga permiso para ver este estudiante
        if (req.user.rol !== 'admin' && req.user.id_user !== results[0].id_user) {
            return res.status(403).json({ error: "Acceso denegado." });
        }

        res.status(200).json(results[0]);
    } catch (error) {
        console.error("Error al obtener el estudiante:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Obtener estudiante por id_user (EL USUARIO LOGUEADO o ADMIN)
const getEstudianteByUserId = async (req, res) => {
    const { id_user } = req.params;
    
    try {
        // Verificar permisos: solo admin o el mismo usuario
        if (req.user.rol !== 'admin' && req.user.id_user !== parseInt(id_user)) {
            return res.status(403).json({ error: "Acceso denegado." });
        }

        const [estudiantes] = await pool.query(
            "SELECT id_estudiante FROM estudiantes WHERE id_user = ?",
            [id_user]
        );
        
        if (estudiantes.length === 0) {
            return res.status(404).json({ error: "Estudiante no encontrado" });
        }
        
        const id_estudiante = estudiantes[0].id_estudiante;

        const [procesos] = await pool.query(
            "SELECT id_programa FROM proceso WHERE id_estudiante = ? ORDER BY id_proceso DESC LIMIT 1",
            [id_estudiante]
        );
        
        const id_programa = procesos.length > 0 ? procesos[0].id_programa : null;

        res.status(200).json({ id_estudiante, id_programa });
    } catch (error) {
        console.error("Error al obtener estudiante por id_user:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Obtener información del estudiante del usuario logueado
const getMyEstudiante = async (req, res) => {
    try {
        // Obtener id_user del token (req.user viene del middleware de autenticación)
        const id_user = req.user.id_user;

        const [estudiantes] = await pool.query(
            "SELECT id_estudiante FROM estudiantes WHERE id_user = ?",
            [id_user]
        );
        
        if (estudiantes.length === 0) {
            return res.status(404).json({ error: "Estudiante no encontrado" });
        }
        
        const id_estudiante = estudiantes[0].id_estudiante;

        const [procesos] = await pool.query(
            "SELECT id_programa FROM proceso WHERE id_estudiante = ? ORDER BY id_proceso DESC LIMIT 1",
            [id_estudiante]
        );
        
        const id_programa = procesos.length > 0 ? procesos[0].id_programa : null;

        res.status(200).json({ id_estudiante, id_programa, id_user });
    } catch (error) {
        console.error("Error al obtener estudiante:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Agregar un nuevo estudiante (SOLO ADMIN)
const postEstudiante = async (req, res) => {
    const { id_user, matricula } = req.body;
    
    if (!id_user || !matricula) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try {
        const [results] = await pool.query(
            "INSERT INTO estudiantes (id_user, matricula) VALUES (?, ?)",
            [id_user, matricula]
        );
        res.status(201).json({ 
            message: "Estudiante añadido correctamente", 
            id_estudiante: results.insertId 
        });
    } catch (error) {
        console.error("Error al agregar estudiante:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Actualizar estudiante (SOLO ADMIN)
const updateEstudiante = async (req, res) => {
    const { id_estudiante } = req.params;
    const { id_user, matricula } = req.body;
    
    if (!id_user || !matricula) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try {
        const [results] = await pool.query(
            "UPDATE estudiantes SET id_user = ?, matricula = ? WHERE id_estudiante = ?",
            [id_user, matricula, id_estudiante]
        );
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Estudiante no encontrado" });
        }
        
        res.status(200).json({ message: "Estudiante actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar estudiante:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Eliminar estudiante (SOLO ADMIN)
const deleteEstudiante = async (req, res) => {
    const { id_estudiante } = req.params;
    
    try {
        const [results] = await pool.query(
            "DELETE FROM estudiantes WHERE id_estudiante = ?", 
            [id_estudiante]
        );
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Estudiante no encontrado" });
        }
        
        res.status(200).json({ message: "Estudiante eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar estudiante:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Definir rutas con middlewares de seguridad
router.get("/", isAdmin, getEstudiantes); // Solo admin ve todos
router.get("/me", getMyEstudiante); // Usuario ve su propia info (desde token)
router.get("/:id_estudiante", getEstudianteById); // Con validación interna
router.get("/by-user/:id_user", getEstudianteByUserId); // Con validación interna
router.post("/", isAdmin, postEstudiante); // Solo admin crea
router.put("/:id_estudiante", isAdmin, updateEstudiante); // Solo admin actualiza
router.delete("/:id_estudiante", isAdmin, deleteEstudiante); // Solo admin elimina

export default router;