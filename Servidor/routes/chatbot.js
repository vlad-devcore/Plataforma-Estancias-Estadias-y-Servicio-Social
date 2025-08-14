import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import sqlite3 from "sqlite3";

dotenv.config();

const router = express.Router();


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const db = new sqlite3.Database("./chatbot_data.db", (err) => {
    if (err) console.error("Error al conectar con la DB:", err);
    else {
        db.run(`CREATE TABLE IF NOT EXISTS interactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT,
            answer TEXT,
            feedback INTEGER,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});


const systemPrompt = `
Eres un asistente virtual formal y amable, diseñado exclusivamente para orientar a los estudiantes dentro de la Plataforma Educativa UPQROO, un sistema académico de la Universidad Politécnica de Quintana Roo que gestiona los procesos de Estancias y Estadías.

=== SOBRE EL SISTEMA ===
La Plataforma Educativa UPQROO organiza y administra los procesos de estancias y estadías académicas, los cuales se realizan en los siguientes periodos cuatrimestrales:
- Enero - Abril
- Mayo - Agosto
- Septiembre - Diciembre

Este asistente solo atiende a estudiantes (rol: Alumno), y su función es brindar orientación dentro del flujo de trabajo del sistema, sin realizar acciones técnicas ni administrativas.

===  FUNCIONES DEL ALUMNO ===
- Una vez registrado en su programa educativo, el estudiante podrá ver los procesos correspondientes a su carrera.
- El alumno debe seleccionar el proceso vigente que le corresponde y seguir los pasos indicados.

===  DOCUMENTOS A SUBIR ===
El alumno debe subir los siguientes documentos en formato PDF escaneado:
1. Carta de presentación
2. Carta de aceptación
3. Carta de liberación

Los escaneos deben estar bien hechos, legibles, y deben subirse dentro del plazo establecido. Subir documentos fuera de tiempo puede causar complicaciones o rechazos.

 Importante:
- Los archivos deben ser PDF.
- No se aceptan documentos en otros formatos.
- Existen plantillas oficiales en formato Word disponibles para los alumnos; deben usarse para evitar errores.

===  FORMULARIOS A LLENAR ===
- Cédula de registro
- Definición de proyecto

=== ESTATUS DE LOS DOCUMENTOS ===
Los documentos y formularios pueden tener los siguientes estatus:
- Pendiente
- Aprobado
- Rechazado

Si el estatus es "Rechazado", es posible que contenga retroalimentación o comentarios que el alumno debe revisar para corregir y volver a subir el documento.

El alumno debe revisar con regularidad el estado de sus documentos.

===  RESTRICCIONES Y LÍMITES ===
- No debes inventar funciones que no estén descritas arriba.
- No debes sugerir opciones que no existen dentro del sistema.
- No respondas sobre temas ajenos al sistema, como temas médicos, legales o administrativos externos.
- No puedes realizar acciones por el alumno, solo orientar.
- No existe una bandeja de entrada, pero sí se puede recibir retroalimentación escrita cuando un documento es rechazado.

===  ESTILO DE RESPUESTA ===
- Lenguaje formal, claro y respetuoso.
- Explicaciones breves y concretas.
- Si no tienes información suficiente, responde: “No tengo información suficiente para ayudarte con eso dentro del contexto de esta plataforma.”
- Al final de cada respuesta, pregunta: "¿Te fue útil esta respuesta? Por favor, responde 'Sí' o 'No'."

===  FUERA DE ALCANCE ===
No respondas preguntas que no tengan relación con el sistema de Estancias y Estadías ni con la plataforma educativa. No brindes asistencia técnica avanzada, diagnósticos, ni asesoría externa.
`;

async function findSimilarAnswer(question) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT answer FROM interactions WHERE question LIKE ? AND feedback = 1 ORDER BY timestamp DESC LIMIT 1`,
            [`%${question}%`],
            (err, row) => {
                if (err) reject(err);
                else resolve(row ? row.answer : null);
            }
        );
    });
}


router.post("/", async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Mensaje no proporcionado" });
    }

    try {
        // Buscar respuesta previa en la base de datos
        const cachedAnswer = await findSimilarAnswer(message);
        let responseText;

        if (cachedAnswer) {
            responseText = cachedAnswer; // Respuesta sin la pregunta de retroalimentación
        } else {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent([systemPrompt, `Pregunta del alumno: ${message}`]);
            const response = await result.response;
            responseText = response.text().trim();
            // Eliminar la pregunta de retroalimentación si está incluida en la respuesta de Gemini
            responseText = responseText.replace(/¿Te fue útil esta respuesta\? Por favor, responde 'Sí' o 'No'\./g, '').trim();
        }

       
        db.run(
            `INSERT INTO interactions (question, answer, feedback) VALUES (?, ?, ?)`,
            [message, responseText, null],
            (err) => {
                if (err) console.error("Error al guardar interacción:", err);
            }
        );

        res.status(200).json({ respuesta: `${responseText} ¿Te fue útil esta respuesta? Por favor, responde 'Sí' o 'No'.` });
    } catch (error) {
        console.error("Error con Gemini:", error);
        res.status(500).json({ error: "Error al generar respuesta del chatbot" });
    }
});


router.post("/feedback", async (req, res) => {
    const { question, feedback } = req.body;

    if (!question || !feedback) {
        return res.status(400).json({ error: "Falta pregunta o retroalimentación" });
    }

    const feedbackValue = feedback.toLowerCase() === "sí" ? 1 : 0;

    db.run(
        `UPDATE interactions SET feedback = ? WHERE question = ? AND feedback IS NULL`,
        [feedbackValue, question],
        (err) => {
            if (err) {
                console.error("Error al guardar retroalimentación:", err);
                return res.status(500).json({ error: "Error al procesar retroalimentación" });
            }
            res.status(200).json({ mensaje: "Retroalimentación guardada" });
        }
    );
});

export default router;