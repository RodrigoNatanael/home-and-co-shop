import React, { useState, useRef } from 'react';
import { Sparkles, Download, X, Instagram, RefreshCw, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image'; // Importamos el motor de descarga

export default function AdGenerator({ product, onClose }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [ads, setAds] = useState([]);
    const adRefs = useRef([]); // Referencias para capturar cada anuncio

    // --- PROMPTS DE DISEÑO GRÁFICO PROFESIONAL ---
    const adStyles = [
        {
            id: 1,
            name: "Aventura Andes",
            bg: "https://images.unsplash.com/photo-1589415158380-49425590989d?auto=format&fit=crop&q=80&w=800",
            overlay: "bg-gradient-to-t from-black/80 via-transparent to-transparent"
        },
        {
            id: 2,
            name: "Estudio Minimal",
            bg: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
            overlay: "bg-gradient-to-br from-gray-900/40 to-black"
        },
        {
            id: 3,
            name: "Lifestyle Urbano",
            bg: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
            overlay: "bg-gradient-to-tr from-black/60 via-transparent to-black/20"
        }
    ];

    const generateAds = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setAds(adStyles);
            setIsGenerating(false);
        }, 2000);
    };

    // --- FUNCIÓN DE DESCARGA REAL ---
    const downloadAd = async (index, name) => {
        if (adRefs.current[index]) {
            try {
                const dataUrl = await toPng(adRefs.current[index], { quality: 0.95 });
                const link = document.createElement('a');
                link.download = `Ad-HomeAndCo-${product.name}-${name}.png`;
                link.href = dataUrl;
                link.click();
            } catch (err) {
                console.error('Error al descargar:', err);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-6xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

                {/* HEADER */}
                <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tighter uppercase">
                            <Sparkles className="text-yellow-500 fill-yellow-500" /> IA Creative Studio
                        </h2>
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mt-1">Generando contenido de alto impacto para: {product.name}</p>
                    </div>
                    <button onClick={onClose} className="bg-gray-200 p-3 rounded-full hover:bg-black hover:text-white transition-all"><X size={20} /></button>
                </div>

                {/* CONTENIDO */}
                <div className="flex-1 overflow-y-auto p-10 bg-[#f8f8f8]">
                    {ads.length === 0 && !isGenerating ? (
                        <div className="text-center py-24 bg-white rounded-[32px] border-2 border-dashed border-gray-200">
                            <Layers size={64} className="mx-auto text-gray-200 mb-6" />
                            <h3 className="text-2xl font-black text-gray-900 mb-2">MODO EXPERTO ACTIVADO</h3>
                            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Nuestro asistente aplicará retoque digital y composición de fondos automáticos.</p>
                            <button onClick={generateAds} className="bg-black text-white px-10 py-5 rounded-2xl font-black flex items-center gap-3 mx-auto hover:scale-105 transition-transform shadow-xl">
                                <Sparkles size={20} /> GENERAR 3 VERSIONES PRO
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {isGenerating ? (
                                [1, 2, 3].map(i => (
                                    <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-[32px]" />
                                ))
                            ) : (
                                ads.map((ad, idx) => (
                                    <div key={ad.id} className="flex flex-col gap-4">
                                        {/* ÁREA DE CAPTURA (Lo que se descarga) */}
                                        <div
                                            ref={el => adRefs.current[idx] = el}
                                            className="relative aspect-square rounded-[32px] overflow-hidden shadow-2xl bg-black"
                                        >
                                            {/* Fondo IA */}
                                            <img src={ad.bg} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="" />
                                            <div className={`absolute inset-0 ${ad.overlay}`}></div>

                                            {/* Producto Real */}
                                            <div className="absolute inset-0 flex items-center justify-center p-12">
                                                <img src={product.image_url} className="max-w-full max-h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]" alt="" />
                                            </div>

                                            {/* Textos Photoshop Style */}
                                            <div className="absolute inset-0 p-8 flex flex-col justify-between text-white">
                                                <div className="flex justify-between items-start">
                                                    <div className="bg-white text-black px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Home & Co © 2026</div>
                                                    <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{ad.name}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="text-3xl font-black uppercase leading-none tracking-tighter">{product.name}</h4>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-4xl font-black text-yellow-400">${product.price}</span>
                                                        <span className="bg-red-600 px-2 py-0.5 rounded text-[10px] font-black italic">10% OFF TRANSF.</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* BOTONES DE ACCIÓN (Fuera de la captura) */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => downloadAd(idx, ad.name)}
                                                className="flex-1 bg-black text-white py-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
                                            >
                                                <Download size={16} /> Descargar
                                            </button>
                                            <button className="bg-gray-100 p-4 rounded-2xl text-gray-900 hover:bg-[#E1306C] hover:text-white transition-all">
                                                <Instagram size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}