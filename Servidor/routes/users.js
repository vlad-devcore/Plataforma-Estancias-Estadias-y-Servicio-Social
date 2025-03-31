import express from "express";
import pool from "../config/config.db.js";
import multer from "multer";
import fs from "fs";
import csv from "csv-parser";

const router = express.Router();

// Configuración de multer para la carga de archivos
const upload = multer({ dest: "uploads/" }); // Los archivos se guardan en la carpeta "uploads"

// Obtener todos los usuarios
const getUsers = async (req, res) => {
    try {
        const [results] = await pool.query("SELECT * FROM users");
        res.status(200).json(results);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Obtener usuario por ID
const getUserById = async (req, res) => {
    const { id_user } = req.params;
    try {
        const [results] = await pool.query("SELECT * FROM users WHERE id_user = ?", [id_user]);
        if (results.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
        res.status(200).json(results[0]);
    } catch (error) {
        console.error("Error al obtener el usuario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Función para extraer los números antes del @ en el correo
const extractNumbersFromEmail = (email) => {
    const numbers = email.split('@')[0].replace(/\D/g, ''); // Extrae solo los números antes del @
    return numbers || "0000"; // Si no hay números, devuelve "0000"
};

// Agregar un nuevo usuario con inserción automática en la tabla correspondiente
const postUser = async (req, res) => {
    const { email, password, nombre, apellido_paterno, apellido_materno, genero, role } = req.body;

    if (!email || !password || !nombre || !apellido_paterno || !role) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Insertar usuario en `users`
        const [result] = await connection.query(
            "INSERT INTO users (email, password, nombre, apellido_paterno, apellido_materno, genero, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [email, password, nombre, apellido_paterno, apellido_materno, genero, role]
        );

        const userId = result.insertId;

        // Insertar en la tabla correspondiente según el rol
        switch (role) {
            case 'estudiante':
                const matricula = `${extractNumbersFromEmail(email)}`; // Generar matrícula
                await connection.query(
                    "INSERT INTO estudiantes (id_user, matricula) VALUES (?, ?)",
                    [userId, matricula]
                );
                break;

            case 'administrador':
                await connection.query(
                    "INSERT INTO administradores (id_user) VALUES (?)",
                    [userId]
                );
                break;

            case 'asesor_academico':
                await connection.query(
                    "INSERT INTO asesores_academicos (id_user) VALUES (?)",
                    [userId]
                );
                break;

            case 'asesor_empresarial':
                await connection.query(
                    "INSERT INTO asesores_empresariales (id_user) VALUES (?)",
                    [userId]
                );
                break;

            default:
                throw new Error("Rol no válido");
        }

        await connection.commit();
        res.status(201).json({ message: "Usuario añadido correctamente", id_user: userId });

    } catch (error) {
        await connection.rollback();
        console.error("Error al agregar usuario:", error);
        res.status(500).json({ error: error.message || "Error interno del servidor" });
    } finally {
        connection.release();
    }
};

// Actualizar usuario
const updateUser = async (req, res) => {
    const { id_user } = req.params;
    const { email, password, nombre, apellido_paterno, apellido_materno, genero, role } = req.body;

    if (!email || !password || !nombre || !apellido_paterno || !role) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try {
        const [results] = await pool.query(
            "UPDATE users SET email = ?, password = ?, nombre = ?, apellido_paterno = ?, apellido_materno = ?, genero = ?, role = ? WHERE id_user = ?",
            [email, password, nombre, apellido_paterno, apellido_materno, genero, role, id_user]
        );

        if (results.affectedRows === 0) return res.status(404).json({ error: "Usuario no encontrado" });

        res.status(200).json({ message: "Usuario actualizado correctamente" });

    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Eliminar usuario
const deleteUser = async (req, res) => {
    const { id_user } = req.params;
    try {
        const [results] = await pool.query("DELETE FROM users WHERE id_user = ?", [id_user]);
        if (results.affectedRows === 0) return res.status(404).json({ error: "Usuario no encontrado" });

        res.status(200).json({ message: "Usuario eliminado correctamente" });

    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Endpoint para inserción masiva desde un archivo CSV
router.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No se ha proporcionado un archivo CSV" });
    }

    const filePath = req.file.path; // Ruta del archivo cargado
    const connection = await pool.getConnection();

    try { 
        await connection.beginTransaction();

        // Leer el archivo CSV
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (data) => results.push(data)) // Guardar cada fila del CSV en un array
            .on("end", async () => {
                // Procesar cada fila del CSV
                for (const row of results) {
                    const { email, password, nombre, apellido_paterno, apellido_materno, genero, role } = row;

                    // Insertar usuario en `users`
                    const [result] = await connection.query(
                        "INSERT INTO users (email, password, nombre, apellido_paterno, apellido_materno, genero, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        [email, password, nombre, apellido_paterno, apellido_materno, genero, role]
                    );

                    const userId = result.insertId;

                    // Insertar en la tabla correspondiente según el rol
                    switch (role) {
                        case 'estudiante':
                            const matricula = `${extractNumbersFromEmail(email)}`; // Generar matrícula
                            await connection.query(
                                "INSERT INTO estudiantes (id_user, matricula) VALUES (?, ?)",
                                [userId, matricula]
                            );
                            break;

                        case 'administrador':
                            await connection.query(
                                "INSERT INTO administradores (id_user) VALUES (?)",
                                [userId]
                            );
                            break; 

                        case 'asesor_academico':
                            await connection.query(
                                "INSERT INTO asesores_academicos (id_user) VALUES (?)",
                                [userId]
                            );
                            break;

                        case 'asesor_empresarial':
                            await connection.query(
                                "INSERT INTO asesores_empresariales (id_user) VALUES (?)",
                                [userId]
                            );
                            break;

                        default:
                            throw new Error(`Rol no válido: ${role}`);
                    }
                }

                await connection.commit();
                res.status(201).json({ message: "Usuarios añadidos correctamente", total: results.length });

                // Eliminar el archivo CSV después de procesarlo
                fs.unlinkSync(filePath);
            });

    } catch (error) {
        await connection.rollback();
        console.error("Error al procesar el archivo CSV:", error);
        res.status(500).json({ error: error.message || "Error interno del servidor" });
    } finally {
        connection.release();
    }
});

// Definir rutas
router.get("/", getUsers);
router.get("/:id_user", getUserById);
router.post("/", postUser);
router.put("/:id_user", updateUser);
router.delete("/:id_user", deleteUser);

export default router;