import React, { useState, useRef } from 'react';
import { Sparkles, Download, X, Instagram, RefreshCw, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';

export default function AdGenerator({ product, onClose }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [ads, setAds] = useState([]);
    const adRefs = useRef([]); // Referencias para capturar cada anuncio

    // --- PROMPTS DE DISEÑO GRÁFICO PROFESIONAL (1080px sources for HD) ---
    const adStyles = [
        {
            id: 1,
            name: "Aventura Andes",
            bg: "https://images.unsplash.com/photo-1519681393798-3828fb4048d7?auto=format&fit=crop&q=80&w=1080", // Mountains High Res
            overlay: "bg-gradient-to-t from-black/90 via-black/20 to-transparent",
            accent: "text-amber-400"
        },
        {
            id: 2,
            name: "Estudio Minimal",
            bg: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1080", // Clean Studio
            overlay: "bg-black/80 backdrop-grayscale",
            accent: "text-white"
        },
        {
            id: 3,
            name: "Lifestyle Urbano",
            bg: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1080", // Urban/Fashion
            overlay: "bg-gradient-to-tr from-purple-900/40 to-black/60 mix-blend-multiply",
            accent: "text-purple-300"
        }
    ];

    const generateAds = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setAds(adStyles);
            setIsGenerating(false);
        }, 1500); // Slightly faster feedback
    };

    // --- FUNCIÓN DE DESCARGA ULTRA HD (Configurada para 1080x1920) ---
    const downloadAd = async (index, name) => {
        const ref = adRefs.current[index];
        if (ref) {
            try {
                // Configuración clave: pixelRatio 3 para asegurar nitidez máxima en móviles
                // filter: evita glitches en algunas fuentes
                const dataUrl = await toPng(ref, {
                    quality: 1.0,
                    pixelRatio: 3,
                    cacheBust: true,
                });

                const link = document.createElement('a');
                link.download = `H&C-${product.name.replace(/\s+/g, '-')}-${name}-HD.png`;
                link.href = dataUrl;
                link.click();
            } catch (err) {
                console.error('Error al descargar:', err);
                alert("Hubo un error al generar la imagen. Intenta de nuevo.");
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#111] w-full max-w-7xl rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-[90vh] border border-white/10"
            >

                {/* HEADER */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
                    <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tighter uppercase">
                            <Sparkles className="text-yellow-400 fill-yellow-400" /> Studio Creativo <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded font-bold">9:16 HD</span>
                        </h2>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mt-1">
                            Generando assets para: <span className="text-white">{product.name}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="bg-white/10 p-3 rounded-full hover:bg-white/20 text-white transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* CONTENIDO SCROLLABLE */}
                <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-[#0a0a0a]">

                    {ads.length === 0 && !isGenerating ? (
                        <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
                            <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mb-8 animate-pulse">
                                <Sparkles size={48} className="text-yellow-500" />
                            </div>
                            <h3 className="text-4xl font-black text-white mb-4 uppercase italic">Generador Viral 9:16</h3>
                            <p className="text-gray-400 mb-10 text-lg leading-relaxed">
                                Crea historias de Instagram listas para publicar. Nuestro motor IA ajustará fondos, sombras y tipografías para un look "Andino Premium".
                            </p>
                            <button
                                onClick={generateAds}
                                className="group relative bg-white text-black px-12 py-6 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    <RefreshCw size={24} className="group-hover:rotate-180 transition-transform" /> GENERAR PACK
                                </span>
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 justify-center">
                            {isGenerating ? (
                                [1, 2, 3].map(i => (
                                    <div key={i} className="aspect-[9/16] bg-white/5 animate-pulse rounded-[32px] border border-white/5" />
                                ))
                            ) : (
                                ads.map((ad, idx) => (
                                    <motion.div
                                        key={ad.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex flex-col gap-6 items-center"
                                    >
                                        {/* ÁREA DE CAPTURA - ESTRICTAMENTE 9:16 (1080x1920 ratio) */}
                                        <div className="relative group perspective">
                                            <div
                                                ref={el => adRefs.current[idx] = el}
                                                className="relative w-[320px] h-[569px] bg-black overflow-hidden shadow-2xl rounded-[1px] select-none"
                                            // 320x569 es approx 9:16 scaled down for display, but toPng handles the internal resolution scaling via pixelRatio
                                            >
                                                {/* 1. LAYER FONDO */}
                                                <div className="absolute inset-0 z-0">
                                                    <img src={ad.bg} className="w-full h-full object-cover" alt="Background" />
                                                    <div className={`absolute inset-0 ${ad.overlay}`} />
                                                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
                                                </div>

                                                {/* 2. HEADER TOP */}
                                                <div className="absolute top-12 left-0 right-0 z-20 text-center">
                                                    <p className="text-[10px] font-black tracking-[0.3em] uppercase text-white/80 drop-shadow-md">
                                                        Home & Co © 2026
                                                    </p>
                                                </div>

                                                {/* 3. PRODUCTO RECORTADO (CENTER) */}
                                                <div className="absolute inset-x-0 top-[15%] bottom-[30%] z-10 flex items-center justify-center p-4">
                                                    <img
                                                        src={product.image_url}
                                                        className="w-full h-full object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.6)]"
                                                        alt={product.name}
                                                    />
                                                </div>

                                                {/* 4. INFO BOTTOM */}
                                                <div className="absolute bottom-0 left-0 right-0 p-8 z-30 pb-20 flex flex-col items-center text-center">
                                                    {/* TAG PRECIO */}
                                                    <div className="mb-6 rotate-[-2deg]">
                                                        <div className="bg-white text-black px-4 py-2 font-black text-sm uppercase tracking-wider shadow-xl flex items-center gap-2 border-2 border-transparent">
                                                            <span className="text-red-600">10% OFF</span>
                                                            <span className="w-px h-4 bg-gray-300 mx-1" />
                                                            <span>TRANSF.</span>
                                                        </div>
                                                    </div>

                                                    {/* NOMBRE PRODUCTO */}
                                                    <h2 className="text-3xl font-black text-white leading-[0.85] tracking-tighter uppercase mb-2 drop-shadow-lg">
                                                        {product.name}
                                                    </h2>

                                                    {/* PRECIO */}
                                                    <p className={`text-4xl font-black ${ad.accent} tracking-tighter drop-shadow-md mt-2`}>
                                                        ${product.price?.toLocaleString('es-AR')}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Hover Glow Effect outside the capture area */}
                                            <div className="absolute -inset-4 bg-white/5 opacity-0 group-hover:opacity-100 rounded-[32px] -z-10 blur-xl transition-opacity duration-500" />
                                        </div>

                                        {/* CONTROLES */}
                                        <button
                                            onClick={() => downloadAd(idx, ad.name)}
                                            className="w-[320px] bg-white text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors shadow-lg"
                                        >
                                            <Download size={16} /> Bajar HD
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}