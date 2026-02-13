import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseclient';
import { askSommelier } from '../services/ai'; // Mantenemos la IA, aunque se llame Mila
import { MessageCircle, X, Send, Trash2, Sparkles, CreditCard, Truck, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [productsContext, setProductsContext] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // URL del Avatar 3D de Mila (puedes cambiarla por una foto real tuya o de Vane si prefieren)
    // Usamos una imagen 3D de stock de alta calidad para el ejemplo
    const avatarUrl = "https://img.freepik.com/premium-psd/3d-render-avatar-character_23-2150611765.jpg?w=740";

    // 1. MEMORIA
    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem('hc_chat_history');
            return saved ? JSON.parse(saved) : [{
                id: 1,
                type: 'bot',
                text: '¡Hola! ✨ Soy Mila, tu asistente personal. ¿Buscás algo para renovar tu hogar o una buena compañía para el mate?'
            }];
        } catch (e) {
            return [{ id: 1, type: 'bot', text: '¡Hola! ✨ Soy Mila. ¿En qué puedo ayudarte hoy?' }];
        }
    });

    const [inputText, setInputText] = useState('');
    const scrollRef = useRef(null);

    // 2. CARGAR PRODUCTOS
    useEffect(() => {
        const fetchProducts = async () => {
            const { data } = await supabase.from('products').select('name, price, stock, category, description');
            if (data) setProductsContext(data);
        };
        fetchProducts();
    }, []);

    // 3. PERSISTENCIA
    useEffect(() => {
        localStorage.setItem('hc_chat_history', JSON.stringify(messages));
        scrollToBottom();
    }, [messages, isOpen, isLoading]);

    const scrollToBottom = () => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    };

    const clearHistory = () => {
        const reset = [{ id: Date.now(), type: 'bot', text: '¡Listo! Empecemos de nuevo. ¿Qué necesitás? ✨' }];
        setMessages(reset);
        localStorage.removeItem('hc_chat_history');
    };

    // 4. CEREBRO DE MILA
    const handleSend = async (textOverride = null) => {
        const textToSend = textOverride || inputText;
        if (!textToSend.trim()) return;

        const userMsg = { id: Date.now(), type: 'user', text: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        const lower = textToSend.toLowerCase();

        // Respuestas Rápidas (Scriptadas para velocidad)
        if (lower.includes('envio') || lower.includes('llegan')) {
            setTimeout(() => {
                addBotMessage("📦 Envíos a todo el país. Si estás en Mendoza te lo llevamos volando, al resto llega en 24/48hs.");
                setIsLoading(false);
            }, 600);
            return;
        }

        if (lower.includes('pago') || lower.includes('tarjeta') || lower.includes('cuotas')) {
            setTimeout(() => {
                addBotMessage("💳 Tenés 3 y 6 cuotas. Si pagás con transferencia te hago un mimo en el precio (descuento).");
                setIsLoading(false);
            }, 600);
            return;
        }

        if (lower.includes('asesor') || lower.includes('humano')) {
            setTimeout(() => {
                addBotMessage("¡Dale! Te paso con Vane o Rodri por WhatsApp 👇", "https://wa.me/5492617523156");
                setIsLoading(false);
            }, 600);
            return;
        }

        // Consulta a la IA (Cerebro real)
        try {
            const aiResponse = await askSommelier(textToSend, productsContext);
            addBotMessage(aiResponse);
        } catch (error) {
            addBotMessage("Me quedé pensando... 😵 ¿Me repetís la pregunta?");
        } finally {
            setIsLoading(false);
        }
    };

    const addBotMessage = (text, link = null) => {
        setMessages(prev => [...prev, { id: Date.now(), type: 'bot', text, link }]);
    };

    const QuickOption = ({ icon, label, query }) => (
        <button
            onClick={() => handleSend(query)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/50 backdrop-blur-sm border border-white/60 rounded-xl text-xs font-bold text-gray-700 hover:bg-black hover:text-white transition-all shadow-sm"
        >
            {icon} {label}
        </button>
    );

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="mb-4 w-[90vw] max-w-[360px] h-[550px] rounded-[30px] shadow-2xl overflow-hidden flex flex-col border border-white/20 relative"
                        style={{
                            background: 'rgba(255, 255, 255, 0.85)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)', // Safari
                        }}
                    >
                        {/* HEADER GLASS */}
                        <div className="p-4 flex justify-between items-center border-b border-black/5 bg-white/40 backdrop-blur-md sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                        <img src={avatarUrl} alt="Mila" className="w-full h-full object-cover" />
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></span>
                                </div>
                                <div>
                                    <h3 className="font-black text-sm text-gray-800">Mila | Home & Co</h3>
                                    <span className="text-[10px] text-gray-500 font-medium">Asistente 24/7</span>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={clearHistory} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-black/5"><Trash2 size={16} /></button>
                                <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-black/5"><X size={20} /></button>
                            </div>
                        </div>

                        {/* CHAT AREA */}
                        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.type === 'user'
                                            ? 'bg-black text-white rounded-tr-none'
                                            : 'bg-white/80 backdrop-blur-sm text-gray-800 border border-white/60 rounded-tl-none'
                                        }`}>
                                        {msg.text}
                                    </div>
                                    {msg.link && (
                                        <a href={msg.link} target="_blank" rel="noopener noreferrer" className="mt-2 bg-green-500 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-green-600 transition-colors shadow-md w-fit">
                                            <MessageCircle size={14} /> WhatsApp
                                        </a>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-center gap-2 text-gray-400 text-xs ml-2">
                                    <Sparkles size={12} className="animate-spin" /> Escribiendo...
                                </div>
                            )}
                        </div>

                        {/* SUGERENCIAS */}
                        <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar mask-linear-fade">
                            <QuickOption icon={<Truck size={12} />} label="Envíos" query="¿Cómo son los envíos?" />
                            <QuickOption icon={<CreditCard size={12} />} label="Pagos" query="¿Qué medios de pago aceptan?" />
                            <QuickOption icon={<MapPin size={12} />} label="Ubicación" query="¿Dónde están ubicados?" />
                        </div>

                        {/* INPUT */}
                        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 bg-white/50 backdrop-blur-md border-t border-white/20 flex gap-2 items-center">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Preguntale a Mila..."
                                className="flex-1 bg-white/60 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all font-medium border border-transparent focus:border-black/10 shadow-inner"
                            />
                            <button type="submit" disabled={isLoading} className="bg-black text-white w-11 h-11 rounded-xl flex items-center justify-center hover:bg-gray-800 transition-transform active:scale-95 shadow-lg disabled:opacity-50">
                                <Send size={18} className="ml-0.5" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* BOTÓN FLOTANTE "LIQUID GLASS" CON ANIMACIÓN */}
            <motion.button
                initial={{ y: 0 }}
                animate={{ y: [0, -6, 0] }} // Animación de flotación suave
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="relative group w-16 h-16 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/40 overflow-hidden"
                style={{
                    background: 'rgba(255, 255, 255, 0.65)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                }}
            >
                {isOpen ? (
                    <X size={28} className="text-gray-800" />
                ) : (
                    <>
                        {/* Avatar en el botón */}
                        <img src={avatarUrl} alt="Mila" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />

                        {/* Notificación Roja */}
                        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>

                        {/* Brillo Glass */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/40 to-transparent pointer-events-none"></div>
                    </>
                )}
            </motion.button>
        </div>
    );
}