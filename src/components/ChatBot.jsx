import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseclient';
import { MessageCircle, X, Send, Trash2, Sparkles, CreditCard, Truck, MapPin, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [knowledgeBase, setKnowledgeBase] = useState([]); // Base de conocimiento (Productos + Categorías)
    const [isLoading, setIsLoading] = useState(false);

    const avatarUrl = "https://img.freepik.com/premium-psd/3d-render-avatar-character_23-2150611765.jpg?w=740";

    // 1. MEMORIA
    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem('hc_chat_history');
            return saved ? JSON.parse(saved) : [{
                id: 1,
                type: 'bot',
                text: '¡Hola! ✨ Soy Mila. Conozco todo el stock de Home & Co. ¿Qué estás buscando hoy?'
            }];
        } catch (e) {
            return [{ id: 1, type: 'bot', text: '¡Hola! ✨ Soy Mila. ¿En qué te ayudo?' }];
        }
    });

    const [inputText, setInputText] = useState('');
    const scrollRef = useRef(null);

    // 2. APRENDIZAJE EN TIEMPO REAL (Lee TODO: Nombre, Descripción, Categoría, Fecha)
    useEffect(() => {
        const learnStore = async () => {
            // Traemos descripción y fecha también para ser más inteligentes
            const { data } = await supabase
                .from('products')
                .select('name, price, category, description, created_at, stock')
                .gt('stock', 0); // Solo aprende lo que tiene stock

            if (data) setKnowledgeBase(data);
        };
        learnStore();
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
        const reset = [{ id: Date.now(), type: 'bot', text: 'Memoria refrescada ✨. Preguntame lo que quieras del sitio.' }];
        setMessages(reset);
        localStorage.removeItem('hc_chat_history');
    };

    // 4. CEREBRO DE BÚSQUEDA PROFUNDA
    const analyzeIntent = (text) => {
        const lower = text.toLowerCase();

        // A. INTENCIONES FIJAS (Políticas)
        if (lower.match(/\b(hola|buen|buenas|holis|alo)\b/)) return { text: "¡Hola! 👋 Soy experta en nuestro catálogo. Decime qué estilo buscás o preguntame por un producto." };
        if (lower.includes('envio') || lower.includes('llegan') || lower.includes('soy de')) return { text: "📦 Hacemos envíos a todo el país. En Mendoza entregamos volando, al resto llega en 24/48hs." };
        if (lower.includes('donde') || lower.includes('ubicacion')) return { text: "📍 Estamos en Mendoza, pero nuestra tienda es 100% online y segura." };
        if (lower.includes('pago') || lower.includes('tarjeta') || lower.includes('cuota')) return { text: "💳 Aceptamos todas las tarjetas. ¡Tip! Si pagás con transferencia tenés descuento extra." };
        if (lower.includes('promo') || lower.includes('oferta') || lower.includes('descuento')) return { text: "🔥 ¡El mejor descuento es vía Transferencia! Seleccionalo al final de la compra. También revisá si hay productos con precio rebajado." };

        // B. INTENCIÓN: "NOVEDADES" (Usa la fecha created_at)
        if (lower.includes('nuevo') || lower.includes('llegaron') || lower.includes('ultimo')) {
            // Ordenamos por fecha y tomamos los 3 más nuevos
            const news = [...knowledgeBase].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3);
            const list = news.map(p => `• ${p.name}`).join('\n');
            return { text: `✨ ¡Lo último que entró es bomba!\n${list}\n\n¿Querés ver alguno en especial?` };
        }

        // C. INTENCIÓN: "BUSCADOR SEMÁNTICO" (Busca en descripción y categoría)
        // Dividimos la búsqueda en palabras clave (ej: "termo rojo" -> "termo", "rojo")
        const keywords = lower.split(' ').filter(word => word.length > 2); // Ignoramos palabras cortas como "de", "el"

        const matches = knowledgeBase.filter(p => {
            const content = `${p.name} ${p.category} ${p.description}`.toLowerCase();
            // El producto debe coincidir con AL MENOS una palabra clave fuerte
            return keywords.some(key => content.includes(key));
        });

        if (matches.length > 0) {
            // Priorizamos coincidencia exacta en el nombre
            matches.sort((a, b) => {
                const aName = a.name.toLowerCase().includes(lower) ? 1 : 0;
                const bName = b.name.toLowerCase().includes(lower) ? 1 : 0;
                return bName - aName;
            });

            const top = matches.slice(0, 3);
            const list = top.map(p => `• ${p.name} ($${p.price})`).join('\n');
            return {
                text: `🔍 Encontré esto que te puede servir:\n${list}\n\n¿Te paso el link de alguno?`,
                link: "/catalog"
            };
        }

        // D. MAYORISTA / HUMAN FALLBACK
        if (lower.includes('mayor') || lower.includes('reventa')) return { text: "Para catálogo mayorista, hablame al WhatsApp 👇", link: "https://wa.me/5492617523156" };

        return {
            text: "Mmm, no encontré nada con esa descripción exacta 🤔. Probá con otra palabra o preguntale a Vane 👇",
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
            const response = analyzeIntent(textToSend);
            setMessages(prev => [...prev, { id: Date.now(), type: 'bot', text: response.text, link: response.link }]);
            setIsLoading(false);
        }, 700); // Un poco más de delay para simular que "piensa"
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
                            background: 'rgba(255, 255, 255, 0.92)',
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
                                    <Sparkles size={12} className="animate-spin" /> Buscando en stock...
                                </div>
                            )}
                        </div>

                        {/* SUGERENCIAS */}
                        <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar mask-linear-fade">
                            <QuickOption icon={<Search size={12} />} label="Lo Nuevo" query="¿Qué hay de nuevo?" />
                            <QuickOption icon={<Truck size={12} />} label="Envíos" query="¿Cómo son los envíos?" />
                            <QuickOption icon={<CreditCard size={12} />} label="Pagos" query="¿Medios de pago?" />
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