import React, { useState } from 'react';
import { askSommelier } from '../services/ai';

// SIN IMPORTACIONES DE ICONOS EXTERNOS (Para descartar errores)

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "¡Hola! Soy El Sommelier 🧉. ¿En qué te puedo ayudar hoy?", sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);

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
            setMessages(prev => [...prev, { text: "¡Ups! Me quedé sin wifi. Probá de nuevo.", sender: 'bot' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        /* Z-INDEX EXTREMO Y COLOR ROJO DE FONDO TEMPORAL PARA VERLO SI O SI */
        <div className="fixed bottom-24 right-4 z-[99999] font-sans flex flex-col items-end">

            {/* Ventana de Chat */}
            {isOpen && (
                <div className="bg-white rounded-lg shadow-2xl w-80 border-2 border-black overflow-hidden mb-2">
                    <div className="bg-black text-white p-3 flex justify-between items-center">
                        <span className="font-bold">🧉 Sommelier Home & Co</span>
                        <button onClick={() => setIsOpen(false)} className="text-white font-bold text-xl px-2">×</button>
                    </div>

                    <div className="h-64 overflow-y-auto p-4 bg-gray-100 flex flex-col gap-2">
                        {messages.map((msg, index) => (
                            <div key={index} className={`p-2 rounded-lg text-sm max-w-[80%] ${msg.sender === 'user' ? 'bg-black text-white self-end' : 'bg-white text-black self-start border border-gray-300'
                                }`}>
                                {msg.text}
                            </div>
                        ))}
                        {isLoading && <div className="text-xs text-gray-500 animate-pulse">Escribiendo...</div>}
                    </div>

                    <form onSubmit={handleSend} className="p-2 border-t flex gap-2">
                        <input
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Preguntame algo..."
                            className="flex-1 p-2 border rounded"
                        />
                        <button type="submit" className="bg-black text-white px-4 rounded font-bold">→</button>
                    </form>
                </div>
            )}

            {/* BOTÓN FLOTANTE (SOLO EMOJI) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-black text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-3xl hover:scale-110 transition-transform border-2 border-white"
                >
                    🤖
                </button>
            )}
        </div>
    );
}