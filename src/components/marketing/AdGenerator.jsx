import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Sparkles, Download, X, RefreshCw, Zap, Mountain, Home, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';

// --- POOL DE FONDOS AMPLIADO PARA MÁXIMA VARIEDAD ---
const BACKGROUNDS = {
    ORIGIN: [
        "https://images.unsplash.com/photo-1519681393784-d120267933ba",
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
        "https://images.unsplash.com/photo-1504280506541-aca1cd12e211",
        "https://images.unsplash.com/photo-1454496522488-7a8e488e8606",
        "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5"
    ],
    TECH: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c",
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f",
        "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d",
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
        "https://images.unsplash.com/photo-1550684848-fac1c5b4e853"
    ],
    LIFESTYLE: [
        "https://images.unsplash.com/photo-1483985988355-763728e1935b",
        "https://images.unsplash.com/photo-1513161455079-7dc1de15ef3e",
        "https://images.unsplash.com/photo-1505691938895-1758d7bab58d",
        "https://images.unsplash.com/photo-1616046229478-9901c5536a45",
        "https://images.unsplash.com/photo-1617159784260-845722352b2f"
    ]
};

const DESIGN_SYSTEM = {
    ORIGIN: { id: 'origin', label: 'Aventura & Origen', icon: Mountain, font: 'font-serif italic', accent: 'text-orange-400' },
    TECH: { id: 'tech', label: 'Tech Minimalist', icon: Zap, font: 'font-mono tracking-tighter', accent: 'text-cyan-400' },
    LIFESTYLE: { id: 'lifestyle', label: 'Urban Home', icon: Home, font: 'font-sans font-black', accent: 'text-rose-500' }
};

export default function AdGenerator({ product, onClose }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [layouts, setLayouts] = useState([]);
    const adRefs = useRef([]);

    const productContext = useMemo(() => {
        const name = product?.name.toLowerCase() || "";
        if (name.includes('mate') || name.includes('quo') || name.includes('aventura')) return DESIGN_SYSTEM.ORIGIN;
        if (name.includes('digital') || name.includes('vaso') || name.includes('térmico')) return DESIGN_SYSTEM.TECH;
        return DESIGN_SYSTEM.LIFESTYLE;
    }, [product]);

    const generate = () => {
        setIsGenerating(true);
        setLayouts([]); // Limpieza total para forzar re-render

        setTimeout(() => {
            const pool = BACKGROUNDS[productContext.id.toUpperCase()];
            const newLayouts = ['Minimal', 'Impact', 'Story'].map((type, i) => ({
                id: `${Date.now()}-${i}`,
                type,
                bg: `${pool[Math.floor(Math.random() * pool.length)]}?auto=format&fit=crop&q=80&w=1080`,
                // Variamos la composición interna
                comp: i === 0 ? 'bottom' : i === 1 ? 'center' : 'split'
            }));
            setLayouts(newLayouts);
            setIsGenerating(false);
        }, 1000);
    };

    useEffect(() => { generate(); }, [product]);

    const download = async (index) => {
        if (adRefs.current[index]) {
            const dataUrl = await toPng(adRefs.current[index], { quality: 1, pixelRatio: 3 });
            const link = document.createElement('a');
            link.download = `HC-Ad-${product.name}-${index}.png`;
            link.href = dataUrl;
            link.click();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#0f0f0f] w-full max-w-[1200px] h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col border border-white/10">

                {/* HEADER */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40">
                    <div className="flex items-center gap-4">
                        <productContext.icon className="text-yellow-500" size={28} />
                        <div>
                            <h2 className="text-white font-black uppercase text-lg tracking-tighter">Creative Studio HD</h2>
                            <p className="text-xs text-gray-500 font-mono">Producto: {product.name}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={generate} disabled={isGenerating} className="bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 border border-white/10">
                            <RefreshCw size={18} className={isGenerating ? "animate-spin" : ""} /> REGENERAR
                        </button>
                        <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={28} /></button>
                    </div>
                </div>

                {/* WORKSPACE */}
                <div className="flex-1 overflow-y-auto p-10 bg-[#050505] flex justify-center">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {layouts.map((layout, idx) => (
                            <div key={layout.id} className="flex flex-col gap-4 items-center">

                                {/* CANVAS 9:16 */}
                                <div
                                    ref={el => adRefs.current[idx] = el}
                                    className="relative w-[300px] h-[533px] bg-white overflow-hidden rounded-sm shadow-2xl group"
                                >
                                    {/* FONDO */}
                                    <img src={layout.bg} className="absolute inset-0 w-full h-full object-cover" alt="" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                                    {/* COMPOSICIÓN DEL PRODUCTO - EL CORAZÓN DEL CAMBIO */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10">
                                        <div className="relative w-full h-full flex flex-col items-center justify-center">

                                            {/* SOMBRA DE CONTACTO DINÁMICA */}
                                            <div className="absolute bottom-[20%] w-[60%] h-8 bg-black/60 blur-xl rounded-[100%] mix-blend-multiply" />

                                            {/* IMAGEN CON FILTROS DE RECORTE SENIOR */}
                                            <img
                                                src={product.image_url}
                                                className="relative w-[90%] h-auto object-contain z-10 transition-transform duration-500 group-hover:scale-110"
                                                style={{
                                                    mixBlendMode: 'multiply',
                                                    filter: 'contrast(1.4) brightness(1.1) saturate(1.1)',
                                                    WebkitMaskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* TEXTOS DINÁMICOS */}
                                    <div className="absolute inset-0 p-6 flex flex-col justify-between z-20 pointer-events-none">
                                        <div className="flex justify-between items-start">
                                            <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.4em]">Home & Co / 2026</span>
                                            <Camera size={14} className="text-white/20" />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="bg-yellow-500 text-black text-[10px] font-black px-2 py-1 inline-block rounded-sm">10% OFF TRANSF.</div>
                                            <h3 className={`text-white text-3xl uppercase leading-[0.85] ${productContext.font} drop-shadow-md`}>
                                                {product.name}
                                            </h3>
                                            <p className={`text-2xl font-black ${productContext.accent} drop-shadow-md`}>
                                                ${product.price.toLocaleString('es-AR')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => download(idx)}
                                    className="w-full bg-white text-black py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-yellow-500 transition-all"
                                >
                                    <Download size={14} /> Bajar Story {idx + 1}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}