import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Sparkles, Download, X, RefreshCw, Layers, Zap, Camera, Mountain, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';

// --- INTELIGENCIA DE DISEÑO ---
const DESIGN_SYSTEM = {
    ORIGIN: {
        id: 'origin',
        label: 'Aventura & Origen',
        icon: Mountain,
        palettes: [
            { bg: "https://images.unsplash.com/photo-1519681393798-3828fb4048d7?auto=format&fit=crop&q=80&w=1080", overlay: "bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-transparent", accent: "text-orange-400", badgeBg: "bg-orange-600", badgeText: "text-white" },
            { bg: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1080", overlay: "bg-gradient-to-b from-slate-900/60 via-transparent to-slate-900/90", accent: "text-emerald-300", badgeBg: "bg-emerald-600", badgeText: "text-white" },
            { bg: "https://images.unsplash.com/photo-1504280506541-aca1cd12e211?auto=format&fit=crop&q=80&w=1080", overlay: "bg-black/40 mix-blend-multiply", accent: "text-amber-200", badgeBg: "bg-white", badgeText: "text-black" }
        ],
        fontStyle: "font-serif italic",
        shadow: "drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
    },
    TECH: {
        id: 'tech',
        label: 'Tech Minimalist',
        icon: Zap,
        palettes: [
            { bg: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1080", overlay: "bg-zinc-900/90", accent: "text-cyan-400", badgeBg: "bg-cyan-500", badgeText: "text-black" },
            { bg: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1080", overlay: "bg-slate-900/95", accent: "text-purple-400", badgeBg: "bg-purple-600", badgeText: "text-white" },
            { bg: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80&w=1080", overlay: "bg-black/80", accent: "text-white", badgeBg: "bg-white", badgeText: "text-black" }
        ],
        fontStyle: "font-mono tracking-tighter",
        shadow: "drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]" // Glow effect
    },
    LIFESTYLE: {
        id: 'lifestyle',
        label: 'Urban Home',
        icon: Home,
        palettes: [
            { bg: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1080", overlay: "bg-white/10 backdrop-blur-[2px]", accent: "text-rose-500", badgeBg: "bg-rose-500", badgeText: "text-white" }, // Light
            { bg: "https://images.unsplash.com/photo-1513161455079-7dc1de15ef3e?auto=format&fit=crop&q=80&w=1080", overlay: "bg-stone-100/20 mix-blend-hard-light", accent: "text-indigo-600", badgeBg: "bg-indigo-600", badgeText: "text-white" },
            { bg: "https://images.unsplash.com/photo-1505691938895-1758d7bab58d?auto=format&fit=crop&q=80&w=1080", overlay: "bg-black/20", accent: "text-white", badgeBg: "bg-black", badgeText: "text-white" }
        ],
        fontStyle: "font-sans font-black",
        shadow: "drop-shadow-[0_30px_60px_rgba(0,0,0,0.4)]"
    }
};

export default function AdGenerator({ product, onClose }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationThought, setGenerationThought] = useState("");
    const [layouts, setLayouts] = useState([]);
    const adRefs = useRef([]);

    // --- ANALIZADOR DE CONTEXTO ---
    const productContext = useMemo(() => {
        if (!product) return DESIGN_SYSTEM.LIFESTYLE;
        const name = product.name.toLowerCase();

        if (name.includes('mate') || name.includes('quo') || name.includes('aventura') || name.includes('stanley')) return DESIGN_SYSTEM.ORIGIN;
        if (name.includes('digital') || name.includes('vaso') || name.includes('térmico') || name.includes('usb')) return DESIGN_SYSTEM.TECH;
        if (name.includes('bento') || name.includes('lunchera') || name.includes('home') || name.includes('hogar')) return DESIGN_SYSTEM.LIFESTYLE;

        return DESIGN_SYSTEM.LIFESTYLE; // Default
    }, [product]);

    // --- INFINITE BRAIN GENERATOR ---
    const generateLayouts = () => {
        setIsGenerating(true);
        setGenerationThought("Analizando semántica del producto...");

        setTimeout(() => {
            setGenerationThought(`Detectado Vibe: ${productContext.label}`);
        }, 600);

        setTimeout(() => {
            setGenerationThought("Componiendo variantes creativas...");
        }, 1200);

        setTimeout(() => {
            // Generar 3 variantes únicas basadas en el contexto
            const newLayouts = [
                {
                    id: 'minimal',
                    type: 'Minimalismo',
                    palette: productContext.palettes[0],
                    composition: 'layout-bottom-left',
                    badgeStyle: 'badge-pill'
                },
                {
                    id: 'impact',
                    type: 'Alto Impacto',
                    palette: productContext.palettes[1],
                    composition: 'layout-center-bold',
                    badgeStyle: 'badge-flag'
                },
                {
                    id: 'story',
                    type: 'Storytelling',
                    palette: productContext.palettes[2],
                    composition: 'layout-top-split',
                    badgeStyle: 'badge-circle'
                }
            ];
            setLayouts(newLayouts);
            setIsGenerating(false);
        }, 2200);
    };

    // Auto-generar al abrir
    useEffect(() => {
        generateLayouts();
    }, [productContext]);


    const downloadAd = async (index, layoutType) => {
        const ref = adRefs.current[index];
        if (ref) {
            try {
                const dataUrl = await toPng(ref, {
                    quality: 1.0,
                    pixelRatio: 3,
                    cacheBust: true,
                });
                const link = document.createElement('a');
                link.download = `HC-${productContext.id}-${layoutType}-${product.name}.png`;
                link.href = dataUrl;
                link.click();
            } catch (err) {
                console.error(err);
                alert("Error exportando HD. Reintente.");
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0f0f0f] w-full max-w-[1400px] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-[95vh] border border-white/5"
            >

                {/* HEADLINE */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                            <productContext.icon className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
                                IA Studio <span className="text-gray-600">/</span> {productContext.label}
                            </h2>
                            <p className="text-xs font-mono text-gray-500 mt-1 uppercase">
                                Contexto: <span className="text-yellow-500">{product.name}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={generateLayouts}
                            disabled={isGenerating}
                            className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            <RefreshCw size={18} className={isGenerating ? "animate-spin" : ""} />
                            {isGenerating ? "PENSANDO..." : "REGENERAR IDEAS"}
                        </button>
                        <button onClick={onClose} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-3 rounded-xl transition-all">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* WORKSPACE */}
                <div className="flex-1 overflow-y-auto p-10 bg-[#050505] relative">

                    <AnimatePresence mode="wait">
                        {isGenerating ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#050505]"
                            >
                                <div className="relative">
                                    <div className="w-24 h-24 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mb-8"></div>
                                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-500 animate-pulse" />
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-widest animate-pulse">
                                    {generationThought}
                                </h3>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 justify-center pb-20">
                                {layouts.map((layout, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.15 }}
                                        className="flex flex-col gap-6 items-center"
                                    >
                                        <div className="w-full flex justify-between items-center px-2">
                                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest border border-gray-800 px-2 py-1 rounded">
                                                Opción {['A', 'B', 'C'][idx]}: {layout.type}
                                            </span>
                                            <div className="h-px bg-gray-800 flex-1 mx-4"></div>
                                        </div>

                                        {/* --- CANVAS DE DISEÑO 9:16 (320x569 Display) --- */}
                                        <div
                                            ref={el => adRefs.current[idx] = el}
                                            className="relative w-[320px] h-[569px] bg-black overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2px] group"
                                        >
                                            {/* CAPA 1: FONDO AVANZADO */}
                                            <div className="absolute inset-0 z-0">
                                                <img src={layout.palette.bg} className="w-full h-full object-cover" alt="Background" />
                                                <div className={`absolute inset-0 ${layout.palette.overlay}`} />
                                                {/* Textura de grano sutil para realismo */}
                                                <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/noise-lines.png')]" />
                                            </div>

                                            {/* CAPA 2: COMPOSICIÓN DINÁMICA */}

                                            {/* --- LAYOUT TYPE: MINIMAL --- */}
                                            {layout.composition === 'layout-bottom-left' && (
                                                <>
                                                    <div className="absolute top-8 right-8 z-20">
                                                        <span className="text-[10px] font-black tracking-[0.3em] text-white/60 uppercase rotate-90 origin-top-right block">
                                                            Est. 2026
                                                        </span>
                                                    </div>

                                                    <div className="absolute inset-0 z-10 flex items-center justify-center p-6 pb-20">
                                                        <img
                                                            src={product.image_url}
                                                            className={`w-full max-h-[70%] object-contain ${productContext.shadow} transform transition-transform group-hover:scale-105 duration-700`}
                                                            alt={product.name}
                                                        />
                                                    </div>

                                                    <div className="absolute bottom-10 left-8 z-30">
                                                        <div className={`${layout.palette.badgeBg} ${layout.palette.badgeText} text-[10px] font-bold px-3 py-1 rounded-full w-fit mb-4 uppercase tracking-wider`}>
                                                            New Drop
                                                        </div>
                                                        <h2 className={`text-4xl leading-[0.9] text-white uppercase ${productContext.fontStyle} mb-2`}>
                                                            {product.name}
                                                        </h2>
                                                        <p className={`text-2xl ${layout.palette.accent} font-bold`}>
                                                            ${product.price.toLocaleString('es-AR')}
                                                        </p>
                                                    </div>
                                                </>
                                            )}

                                            {/* --- LAYOUT TYPE: CENTER BOLD (IMPACT) --- */}
                                            {layout.composition === 'layout-center-bold' && (
                                                <>
                                                    <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/80 to-transparent z-10" />
                                                    <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black/90 to-transparent z-10" />

                                                    <div className="absolute top-10 inset-x-0 text-center z-20">
                                                        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-white/20 uppercase tracking-tighter leading-none">
                                                            {product.name.split(' ')[0]}
                                                        </h2>
                                                    </div>

                                                    <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
                                                        <img
                                                            src={product.image_url}
                                                            className={`w-full max-h-[60%] object-contain ${productContext.shadow} z-20 relative`}
                                                            alt={product.name}
                                                        />
                                                        {/* Círculo decorativo detrás */}
                                                        <div className={`absolute w-64 h-64 rounded-full ${layout.palette.accent} opacity-20 blur-3xl z-10 animate-pulse`} />
                                                    </div>

                                                    <div className="absolute bottom-12 inset-x-0 text-center z-30 flex flex-col items-center">
                                                        <div className="bg-white text-black px-6 py-2 transform -skew-x-12 mb-4 shadow-lg shadow-white/20">
                                                            <span className="text-xl font-black italic tracking-tighter block transform skew-x-12">
                                                                10% OFF
                                                            </span>
                                                        </div>
                                                        <p className="text-white text-xs tracking-[0.3em] font-light uppercase">
                                                            Solo Transferencia
                                                        </p>
                                                    </div>
                                                </>
                                            )}

                                            {/* --- LAYOUT TYPE: STORYTELLING --- */}
                                            {layout.composition === 'layout-top-split' && (
                                                <>
                                                    <div className="absolute top-12 left-8 z-20 max-w-[200px]">
                                                        <h2 className={`text-4xl text-white leading-none mb-2 uppercase ${productContext.fontStyle}`}>
                                                            {product.name}
                                                        </h2>
                                                        <div className="h-1 w-12 bg-white/50 mb-4" />
                                                        <p className="text-xs text-gray-300 font-medium leading-relaxed">
                                                            Diseñado para durar. Elevá tu experiencia diaria con la calidad premium de Home & Co.
                                                        </p>
                                                    </div>

                                                    <div className="absolute bottom-0 right-0 w-[85%] h-[60%] z-10">
                                                        <img
                                                            src={product.image_url}
                                                            className={`w-full h-full object-contain object-bottom ${productContext.shadow}`}
                                                            alt={product.name}
                                                        />
                                                    </div>

                                                    <div className={`absolute bottom-8 left-8 z-30 w-16 h-16 rounded-full ${layout.palette.badgeBg} flex items-center justify-center shadow-lg`}>
                                                        <span className={`${layout.palette.badgeText} text-xs font-black text-center leading-tight`}>
                                                            GET<br />NOW
                                                        </span>
                                                    </div>

                                                    <div className="absolute top-8 right-8 z-20">
                                                        <Camera className="text-white/40" size={20} />
                                                    </div>
                                                </>
                                            )}

                                        </div>

                                        <button
                                            onClick={() => downloadAd(idx, layout.type)}
                                            className="w-[320px] bg-white hover:bg-yellow-400 text-black py-4 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-colors shadow-lg group-hover:shadow-yellow-500/20"
                                        >
                                            <Download size={16} /> Descargar {layout.type}
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>

                </div>
            </motion.div>
        </div>
    );
}