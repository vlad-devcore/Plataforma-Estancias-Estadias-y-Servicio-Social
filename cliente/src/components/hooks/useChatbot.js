import { useState } from "react";
import axios from "axios";

const useChatbot = () => {
  const [messages, setMessages] = useState([]); // {from:'user'|'bot', text:string}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [awaitingFeedbackFor, setAwaitingFeedbackFor] = useState(null);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    // Agregar mensaje del usuario localmente
    setMessages((prev) => [...prev, { from: "user", text }]);

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_ENDPOINT}/api/chatbot`,
        { message: text }
      );

      const botResponse = data.respuesta || "No recibí respuesta.";
      setMessages((prev) => [...prev, { from: "bot", text: botResponse }]);
      setAwaitingFeedbackFor(text);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Error en la petición");
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Error al comunicarse con el chatbot." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sendFeedback = async (feedback) => {
    if (!awaitingFeedbackFor) return;

    setLoading(true);
    setError(null);

    try {
      await axios.post(
        `${process.env.REACT_APP_API_ENDPOINT}/api/chatbot/feedback`,
        { question: awaitingFeedbackFor, feedback }
      );
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Gracias por tu retroalimentación." },
      ]);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Error enviando feedback");
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Error al enviar retroalimentación." },
      ]);
    } finally {
      setLoading(false);
      setAwaitingFeedbackFor(null);
    }
  };

  return {
    messages,
    loading,
    error,
    awaitingFeedbackFor,
    sendMessage,
    sendFeedback,
  };
};

export default useChatbot;
