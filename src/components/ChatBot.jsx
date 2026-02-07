import React, { useState, useRef, useEffect } from 'react';
import { askSommelier } from '../services/ai';
import { Send, X, MessageCircle } from 'lucide-react';

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "¡Hola! Soy El Sommelier 🧉. ¿En qué te puedo ayudar hoy?", sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState("");
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
        if (!inputText.trim()) return;

        const userMessage = inputText;
        setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
        setInputText("");
        setIsLoading(true);

        try {
            const response = await askSommelier(userMessage);
            setMessages(prev => [...prev, { text: response, sender: 'bot' }]);
        } catch (error) {
            setMessages(prev => [...prev, { text: "¡Ups! Algo salió mal. Intentá de nuevo.", sender: 'bot' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 font-sans">
            {/* Botón Flotante (Cerrado) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-black text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 flex items-center justify-center"
                    aria-label="Abrir chat con El Sommelier"
                >
                    <span className="text-2xl">🧉</span>
                </button>
            )}

            {/* Ventana de Chat (Abierto) */}
            {isOpen && (
                <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col h-[500px] border border-gray-200 overflow-hidden animate-fade-in-up">
                    {/* Header */}
                    <div className="bg-black text-white p-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🧉</span>
                            <div>
                                <h3 className="font-bold text-sm">Sommelier Home & Co</h3>
                                <p className="text-xs text-gray-300">Experto en Mates</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-gray-800 p-1 rounded transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Área de Mensajes */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user'
                                        ? 'bg-black text-white self-end rounded-br-none'
                                        : 'bg-white border border-gray-200 text-gray-800 self-start rounded-bl-none shadow-sm'
                                    }`}
                            >
                                {msg.text}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="self-start bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Preguntame sobre mates..."
                            className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-black outline-none transition-all"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !inputText.trim()}
                            className="bg-black text-white p-2 rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
