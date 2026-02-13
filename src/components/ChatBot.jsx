import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseclient';
import { MessageCircle, X, Send, Trash2, Sparkles, CreditCard, Truck, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [productsContext, setProductsContext] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const avatarUrl = "https://img.freepik.com/premium-psd/3d-render-avatar-character_23-2150611765.jpg?w=740";

    // 1. MEMORIA
    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem('hc_chat_history');
            return saved ? JSON.parse(saved) : [{
                id: 1,
                type: 'bot',
                text: '¡Hola! ✨ Soy Mila. ¿Buscás algo para renovar tu hogar o una buena compañía para el mate?'
            }];
        } catch (e) {
            return [{ id: 1, type: 'bot', text: '¡Hola! ✨ Soy Mila. ¿En qué te ayudo?' }];
        }
    });

    const [inputText, setInputText] = useState('');
    const scrollRef = useRef(null);

    // 2. CARGAR PRODUCTOS (El conocimiento de Mila)
    useEffect(() => {
        const fetchProducts = async () => {
            const { data } = await supabase.from('products').select('name, price, category');
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
        const reset = [{ id: Date.now(), type: 'bot', text: '¡Listo! Empecemos de nuevo. ✨' }];
        setMessages(reset);
        localStorage.removeItem('hc_chat_history');
    };

    // 4. CEREBRO HÍBRIDO (Fijo + Buscador en DB)
    const getBotResponse = (text) => {
        const lower = text.toLowerCase();

        // --- A. PREGUNTAS FIJAS ---
        if (lower.match(/\b(hola|buen|buenas|holis|alo)\b/))
            return { text: "¡Hola! 👋 ¿Cómo estás? Escribí el nombre de lo que buscás (ej: 'Termo') y te digo qué tenemos." };

        if (lower.includes('envio') || lower.includes('llegan') || lower.includes('soy de'))
            return { text: "📦 Hacemos envíos a todo el país. Si sos de Mendoza, coordinamos entrega rápida." };

        if (lower.includes('donde') || lower.includes('ubicacion') || lower.includes('local'))
            return { text: "📍 Estamos en Mendoza. Trabajamos mayormente online con envíos a todo el país." };

        if (lower.includes('pago') || lower.includes('tarjeta') || lower.includes('cuota'))
            return { text: "💳 Aceptamos todas las tarjetas. También transferencia (con descuento) y efectivo." };

        // --- B. BUSCADOR INTELIGENTE DE PRODUCTOS ---
        // Buscamos si alguna palabra del usuario coincide con algún producto
        const foundProducts = productsContext.filter(p =>
            lower.includes(p.name.toLowerCase()) ||
            lower.includes(p.category.toLowerCase()) ||
            (p.name.toLowerCase().split(' ').some(word => lower.includes(word) && word.length > 3)) // Coincidencia parcial
        );

        if (foundProducts.length > 0) {
            // Tomamos hasta 3 productos para no saturar el chat
            const topProducts = foundProducts.slice(0, 3);
            const productList = topProducts.map(p => `• ${p.name}: $${p.price}`).join('\n');
            const moreText = foundProducts.length > 3 ? `\n...y ${foundProducts.length - 3} más.` : '';

            return {
                text: `¡Sí! Encontré esto:\n${productList}${moreText}\n\n¿Querés ver más detalles?`,
                link: "/catalog" // Podríamos llevarlo al catálogo
            };
        }

        // --- C. MAYORISTA / DEFAULT ---
        if (lower.includes('mayor') || lower.includes('reventa'))
            return { text: "Para ventas mayoristas, por favor escribinos directo al WhatsApp para pasarte el catálogo.", link: "https://wa.me/5492617523156" };

        return {
            text: "No encontré ese producto específico 🤔. Pero preguntale a Vane por WhatsApp que te consigue todo 👇",
            link: "https://wa.me/5492617523156"
        };
    };

    // 5. MANEJO DEL ENVÍO
    const handleSend = async (textOverride = null) => {
        const textToSend = textOverride || inputText;
        if (!textToSend.trim()) return;

        setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: textToSend }]);
        setInputText('');
        setIsLoading(true);

        setTimeout(() => {
            const response = getBotResponse(textToSend);
            setMessages(prev => [...prev, { id: Date.now(), type: 'bot', text: response.text, link: response.link }]);
            setIsLoading(false);
        }, 600);
    };

    const QuickOption = ({ icon, label, query }) => (
        <button
            onClick={() => handleSend(query)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/50 backdrop-blur-sm border border-white/60 rounded-xl text-xs font-bold text-gray-700 hover:bg-black hover:text-white transition-all shadow-sm whitespace-nowrap"
        >
            {icon} {label}
        </button>
    );

    return (
        <div className="fixed bottom-24 right-4 z-[9990] flex flex-col items-end font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="mb-4 w-[90vw] max-w-[360px] h-[550px] rounded-[30px] shadow-2xl overflow-hidden flex flex-col border border-white/20 relative"
                        style={{
                            background: 'rgba(255, 255, 255, 0.90)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                        }}
                    >
                        {/* HEADER */}
                        <div className="p-4 flex justify-between items-center border-b border-black/5 bg-white/50 backdrop-blur-md sticky top-0 z-10">
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
                                <button onClick={clearHistory} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-black/5" title="Borrar"><Trash2 size={16} /></button>
                                <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-black/5"><X size={20} /></button>
                            </div>
                        </div>

                        {/* CHAT AREA */}
                        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-line ${msg.type === 'user'
                                            ? 'bg-black text-white rounded-tr-none'
                                            : 'bg-white/80 backdrop-blur-sm text-gray-800 border border-white/60 rounded-tl-none'
                                        }`}>
                                        {msg.text}
                                    </div>
                                    {msg.link && (
                                        <a href={msg.link} className="mt-2 bg-green-500 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-green-600 transition-colors shadow-md w-fit">
                                            {msg.link.includes('wa.me') ? <MessageCircle size={14} /> : <Sparkles size={14} />}
                                            {msg.link.includes('wa.me') ? 'WhatsApp' : 'Ver Catálogo'}
                                        </a>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-center gap-2 text-gray-400 text-xs ml-2">
                                    <Sparkles size={12} className="animate-spin" /> Buscando...
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
                                placeholder="Escribí aquí..."
                                className="flex-1 bg-white/60 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all font-medium border border-transparent focus:border-black/10 shadow-inner"
                            />
                            <button type="submit" disabled={isLoading} className="bg-black text-white w-11 h-11 rounded-xl flex items-center justify-center hover:bg-gray-800 transition-transform active:scale-95 shadow-lg disabled:opacity-50">
                                <Send size={18} className="ml-0.5" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* BOTÓN FLOTANTE */}
            <motion.button
                initial={{ y: 0 }}
                animate={{ y: [0, -6, 0] }}
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
                        <img src={avatarUrl} alt="Mila" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/40 to-transparent pointer-events-none"></div>
                    </>
                )}
            </motion.button>
        </div>
    );
}