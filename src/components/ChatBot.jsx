import React, { useState, useEffect } from 'react';
import { askSommelier } from '../services/ai';
// Usamos emojis para no depender de librerías por ahora
// Si querés íconos, descomentá los imports y cambialos abajo

export default function ChatBot() {
    useEffect(() => {
        console.log("🤖 CHATBOT MONTADO Y LISTO PARA LA GUERRA");
    }, []);

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "¡Hola! 🧉 Soy el Sommelier Virtual. ¿En qué te ayudo?", sender: 'bot' }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
        setIsLoading(true);
        try {
            const response = await askSommelier(userMsg);
            setMessages(prev => [...prev, { text: response, sender: 'bot' }]);
        } catch (error) {
            setMessages(prev => [...prev, { text: "Error de conexión 🔌", sender: 'bot' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // ESTILOS EN LINEA para asegurar que NADA de Tailwind lo rompa
        <div style={{
            position: 'fixed',
            bottom: '100px', // Un poco más arriba que WhatsApp
            right: '20px',
            zIndex: 9999999, // Z-index nuclear
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end'
        }}>

            {isOpen && (
                <div className="bg-white border-2 border-black rounded-lg shadow-xl w-80 mb-4 overflow-hidden flex flex-col h-96">
                    <div className="bg-black text-white p-3 flex justify-between items-center">
                        <span className="font-bold">🧉 Sommelier</span>
                        <button onClick={() => setIsOpen(false)} className="text-white font-bold">X</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-100 flex flex-col gap-2">
                        {messages.map((m, i) => (
                            <div key={i} className={`p-2 rounded max-w-[80%] text-sm ${m.sender === 'user' ? 'bg-black text-white self-end' : 'bg-white border self-start'}`}>
                                {m.text}
                            </div>
                        ))}
                        {isLoading && <div className="text-xs text-gray-500">Escribiendo...</div>}
                    </div>
                    <form onSubmit={handleSend} className="p-2 border-t flex gap-2">
                        <input className="flex-1 border p-1 rounded" value={input} onChange={e => setInput(e.target.value)} placeholder="..." />
                        <button type="submit" className="bg-black text-white px-3 rounded">→</button>
                    </form>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    backgroundColor: 'black',
                    color: 'white',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    fontSize: '30px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white'
                }}
            >
                {isOpen ? '❌' : '🤖'}
            </button>
        </div>
    );
}