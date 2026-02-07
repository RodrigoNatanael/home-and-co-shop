import React, { useState, useRef, useEffect } from 'react';
import { askSommelier } from '../services/ai';
// Si no tenés estos íconos, avisame y los cambiamos por texto simple
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '¡Hola! 🧉 Soy el Sommelier de Home & Co. ¿Buscás algún mate o termo en especial?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await askSommelier(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: '¡Uy! Me quedé sin yerba (hubo un error). Preguntame de nuevo.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-[9999] flex flex-col items-end gap-2">

      {/* VENTANA DEL CHAT (Solo visible si está abierto) */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 border border-gray-200 overflow-hidden mb-2 animate-fade-in-up">
          {/* Header */}
          <div className="bg-gray-900 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-green-500 p-1.5 rounded-full">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Sommelier Home & Co</h3>
                <p className="text-xs text-gray-300">Experto en Mates 🇦🇷</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-gray-700 p-1 rounded transition">
              <X size={20} />
            </button>
          </div>

          {/* Área de Mensajes */}
          <div className="h-80 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                    ? 'bg-gray-900 text-white self-end rounded-tr-none'
                    : 'bg-white border border-gray-200 text-gray-800 self-start rounded-tl-none shadow-sm'
                  }`}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="self-start bg-gray-100 px-4 py-2 rounded-full text-xs text-gray-500 animate-pulse">
                Escribiendo... 🧉
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ej: ¿Qué termo aguanta más?"
              className="flex-1 bg-gray-100 text-sm rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-gray-900 text-white p-2 rounded-full hover:bg-gray-800 transition disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* BOTÓN FLOTANTE (El disparador) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-900 hover:bg-gray-800 text-white p-4 rounded-full shadow-xl transition-all hover:scale-110 flex items-center justify-center group"
      >
        {isOpen ? (
          <X size={28} />
        ) : (
          <>
            <MessageCircle size={28} />
            <span className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full border-2 border-white"></span>
          </>
        )}
      </button>
    </div>
  );
}