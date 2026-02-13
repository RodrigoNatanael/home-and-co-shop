import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Download, X, RefreshCw, Cpu, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';

// --- FONDOS DE ALTA GAMA (SINTÉTICOS) ---
const SYNTH_ASSETS = [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
    "https://images.unsplash.com/photo-1614850523296-d8c1af93d400",
    "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f",
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba"
];

export default function AdGenerator({ product, onClose }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [layouts, setLayouts] = useState([]);
    const [seed, setSeed] = useState(0); // Clave para regeneración real
    const adRefs = useRef([]);

    const generate = () => {
        setIsGenerating(true);
        setSeed(prev => prev + 1); // Forzamos el cambio de semilla

        setTimeout(() => {
            // Mezclamos y elegimos 3 diferentes cada vez
            const shuffled = [...SYNTH_ASSETS].sort(() => 0.5 - Math.random());
            const newLayouts = shuffled.slice(0, 3).map((bg, i) => ({
                id: `synth-${seed}-${i}`,
                bg: `${bg}?auto=format&fit=crop&q=80&w=1080&sig=${seed + i}`, // El 'sig' rompe el cache del navegador
                type: ['Minimal', 'Impact', 'Expert'][i]
            }));
            setLayouts(newLayouts);
            setIsGenerating(false);
        }, 1000);
    };

    useEffect(() => { generate(); }, [product]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
            <div className="bg-[#0a0a0a] w-full max-w-[1200px] h-[90vh] rounded-[3rem] overflow-hidden flex flex-col border border-white/10 shadow-2xl">

                {/* HEADER PRO */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-xl"><Cpu className="text-white" size={24} /></div>
                        <h2 className="text-white font-black uppercase text-xl italic">Creative Studio <span className="text-indigo-400">AI-Synth</span></h2>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={generate} disabled={isGenerating} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-500 transition-all">
                            <RefreshCw className={isGenerating ? "animate-spin" : ""} size={20} /> RE-IMAGINAR
                        </button>
                        <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={32} /></button>
                    </div>
                </div>

                {/* CANVAS */}
                <div className="flex-1 overflow-x-auto p-12 bg-[#050505] flex justify-center items-center gap-10">
                    <AnimatePresence mode="wait">
                        {layouts.map((layout, idx) => (
                            <motion.div key={layout.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-6">
                                <div ref={el => adRefs.current[idx] = el} className="relative w-[320px] h-[569px] bg-black overflow-hidden rounded-lg">
                                    <img src={layout.bg} className="absolute inset-0 w-full h-full object-cover" alt="" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />

                                    {/* PRODUCTO CON FILTRO SENIOR (ELIMINA EL RECUADRO) */}
                                    <div className="absolute inset-0 flex items-center justify-center p-8 z-10">
                                        <div className="relative w-full h-full flex flex-col items-center justify-center">
                                            <div className="absolute bottom-[20%] w-[80%] h-12 bg-black/60 blur-3xl rounded-full mix-blend-multiply" />
                                            <img
                                                src={product.image_url}
                                                className="relative w-full h-auto object-contain z-10"
                                                style={{
                                                    mixBlendMode: 'multiply',
                                                    // Subimos el contraste para 'quemar' el fondo blanco/gris de tus fotos
                                                    filter: 'contrast(1.5) brightness(1.1) saturate(1.1)',
                                                    WebkitMaskImage: 'linear-gradient(to bottom, black 95%, transparent 100%)'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* TEXTOS */}
                                    <div className="absolute inset-0 p-8 flex flex-col justify-between z-20 pointer-events-none">
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Home & Co / Synth</span>
                                        <div className="space-y-4">
                                            <h3 className="text-white text-3xl font-black uppercase leading-none drop-shadow-2xl">{product.name}</h3>
                                            <p className="text-3xl font-black text-indigo-400">${product.price.toLocaleString('es-AR')}</p>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full bg-white text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-400 transition-all">Descargar Master AI</button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}