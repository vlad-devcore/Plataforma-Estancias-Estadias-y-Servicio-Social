import React, { useState, useEffect } from "react";
import { X, MessageCircle, Send, Sparkles, Bot } from "lucide-react";
import useChatbot from "../hooks/useChatbot"; // El hook que hicimos antes

export default function Chatbot() {
  const {
    messages,
    loading,
    error,
    awaitingFeedbackFor,
    sendMessage,
    sendFeedback,
  } = useChatbot();

  const [input, setInput] = useState("");
  const [isMinimized, setIsMinimized] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (isMinimized) {
      // Mostrar mensaje de bienvenida cuando se abre
      setShowWelcome(true);
      setTimeout(() => setShowWelcome(false), 3000);
    }
  };

  // Botón flotante minimizado con efectos más llamativos
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Círculo de pulso de fondo */}
          <div className="absolute inset-0 bg-orange-400 rounded-full animate-ping opacity-20"></div>
          <div className="absolute inset-0 bg-orange-500 rounded-full animate-pulse opacity-30"></div>
          
          {/* Botón principal */}
          <button
            onClick={toggleMinimize}
            className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group border-2 border-orange-400/50"
          >
            <MessageCircle size={28} className="group-hover:rotate-12 transition-transform duration-300" />
            
            {/* Sparkles animados */}
            <Sparkles 
              size={12} 
              className="absolute -top-1 -right-1 text-yellow-300 animate-pulse" 
            />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
          </button>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            ¡Chatea conmigo! 💬
            <div className="absolute top-full right-4 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 max-w-full bg-white rounded-3xl shadow-2xl flex flex-col z-50 border-2 border-orange-200/50 overflow-hidden animate-in slide-in-from-bottom-5 duration-500 backdrop-blur-sm">
      {/* Header súper mejorado */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white px-5 py-4 relative overflow-hidden">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-transparent"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-300 to-pink-400"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bot size={24} className="text-white animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div>
              <h3 className="font-bold text-lg">Chatbot UPQROO</h3>
              <p className="text-xs text-orange-100 opacity-90">Tu asistente virtual 🎓</p>
            </div>
          </div>
          <button
            onClick={toggleMinimize}
            className="hover:bg-orange-800/50 p-2 rounded-full transition-all duration-200 hover:rotate-90"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Ondas decorativas */}
        <div className="absolute -bottom-1 left-0 w-full">
          <svg viewBox="0 0 100 10" className="w-full h-3 text-white/10">
            <path d="M0,5 Q25,0 50,5 T100,5 V10 H0 Z" fill="currentColor"/>
          </svg>
        </div>
      </div>

      {/* Mensaje de bienvenida */}
      {showWelcome && (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-b border-orange-200/50 p-4 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center space-x-3 text-orange-800">
            <Sparkles size={20} className="text-orange-500 animate-spin" />
            <div>
              <p className="font-semibold text-sm">¡Bienvenido a UPQROO! 🎉</p>
              <p className="text-xs text-orange-600">Estoy aquí para ayudarte con cualquier pregunta</p>
            </div>
          </div>
        </div>
      )}

      {/* Área de mensajes súper mejorada */}
      <div className="flex-1 overflow-auto max-h-96 p-4 space-y-4 bg-gradient-to-b from-gray-50/50 via-white to-orange-50/30">
        {messages.length === 0 && !showWelcome && (
          <div className="text-center py-8 text-gray-500">
            <Bot size={48} className="mx-auto mb-3 text-orange-300 animate-bounce" />
            <p className="text-sm font-medium">¡Hola! Soy tu asistente virtual</p>
            <p className="text-xs text-gray-400 mt-1">Pregúntame lo que necesites saber 😊</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
            style={{animationDelay: `${i * 100}ms`}}
          >
            <div
              className={`p-4 rounded-2xl max-w-[85%] shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                msg.from === "user" 
                  ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-md shadow-orange-200" 
                  : "bg-white text-gray-800 border-2 border-gray-100 rounded-bl-md shadow-gray-200/50"
              }`}
            >
              {msg.from === "bot" && (
                <div className="flex items-center space-x-2 mb-2">
                  <Bot size={16} className="text-orange-500" />
                  <span className="text-xs font-medium text-orange-600">UPQROO Bot</span>
                </div>
              )}
              <span className="text-sm leading-relaxed">{msg.text}</span>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white border-2 border-gray-100 rounded-2xl rounded-bl-md p-4 shadow-lg">
              <div className="flex items-center space-x-3">
                <Bot size={16} className="text-orange-500 animate-pulse" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-xs text-gray-500">Escribiendo...</span>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="text-red-600 text-sm text-center bg-gradient-to-r from-red-50 to-pink-50 p-3 rounded-xl border-2 border-red-200 shadow-lg animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-center space-x-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Input área súper mejorada */}
      <div className="border-t-2 border-orange-100 p-4 bg-gradient-to-r from-white to-orange-50/50">
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Escribe tu mensaje aquí... "
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="w-full border-2 border-orange-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 bg-white shadow-inner placeholder-gray-400"
              disabled={loading}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-300">
              💭
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-3 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-xl"
          >
            <Send size={18} className={loading ? "animate-pulse" : ""} />
          </button>
        </div>
      </div>

      {/* Feedback súper mejorado */}
      {awaitingFeedbackFor && (
        <div className="bg-gradient-to-r from-orange-50 via-yellow-50 to-orange-50 p-4 text-center text-sm border-t-2 border-orange-100 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-center gap-4">
            <Sparkles size={16} className="text-orange-500 animate-pulse" />
            <span className="text-gray-700 font-medium">¿Te fue útil esta respuesta?</span>
            <div className="flex gap-3">
              <button
                onClick={() => sendFeedback("Sí")}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-full transition-all duration-200 hover:scale-105 shadow-lg text-xs"
                disabled={loading}
              >
                👍 ¡Sí!
              </button>
              <button
                onClick={() => sendFeedback("No")}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-full transition-all duration-200 hover:scale-105 shadow-lg text-xs"
                disabled={loading}
              >
                👎 No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}