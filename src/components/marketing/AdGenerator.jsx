import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Sparkles, Download, X, RefreshCw, Zap, Mountain, Home, Camera, Target, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';

// --- MOTOR DE ESCENARIOS SINTÉTICOS (AI GENERATED TEMPLATES) ---
const AI_SYNTH_SCENES = {
    ORIGIN: [
        { url: "https://images.unsplash.com/photo-1512273222628-4daea6e55abb", name: "Andes Cinematic Synth", mood: "rustic" },
        { url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9", name: "Highland Mist Synth", mood: "organic" }
    ],
    TECH: [
        { url: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400", name: "Neon Matrix Synth", mood: "cyber" },
        { url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e", name: "Obsidian Studio Synth", mood: "premium" }
    ],
    LIFESTYLE: [
        { url: "https://images.unsplash.com/photo-1617103996702-96ff29b1c467", name: "Scandi Morning Synth", mood: "minimal" },
        { url: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf", name: "Urban Zen Synth", mood: "cozy" }
    ]
};

export default function AdGenerator({ product, onClose }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [layouts, setLayouts] = useState([]);
    const adRefs = useRef([]);

    const ctx = useMemo(() => {
        const name = product?.name.toLowerCase() || "";
        if (name.includes('mate') || name.includes('quo') || name.includes('aventura')) return { id: 'ORIGIN', font: 'font-serif italic', color: 'text-amber-500' };
        if (name.includes('digital') || name.includes('vaso') || name.includes('térmico')) return { id: 'TECH', font: 'font-mono tracking-tighter', color: 'text-cyan-400' };
        return { id: 'LIFESTYLE', font: 'font-sans font-black', color: 'text-rose-500' };
    }, [product]);

    const generate = () => {
        setIsGenerating(true);
        setLayouts([]);
        setTimeout(() => {
            const scenes = AI_SYNTH_SCENES[ctx.id];
            const newLayouts = ['Master AI', 'Editorial Synth', 'Product Focus'].map((type, i) => ({
                id: `${Date.now()}-${i}`,
                type,
                scene: scenes[Math.floor(Math.random() * scenes.length)],
                pos: i === 0 ? 'center' : i === 1 ? 'left' : 'right',
                rotation: (Math.random() * 4 - 2).toFixed(1)
            }));
            setLayouts(newLayouts);
            setIsGenerating(false);
        }, 1200);
    };

    useEffect(() => { if (product) generate(); }, [product]);

    const download = async (index) => {
        if (adRefs.current[index]) {
            const dataUrl = await toPng(adRefs.current[index], { quality: 1, pixelRatio: 3, cacheBust: true });
            const link = document.createElement('a');
            link.download = `HomeAndCo-AI-Synth-${product.name}.png`;
            link.href = dataUrl;
            link.click();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#080808] w-full max-w-[1300px] h-[95vh] rounded-[3rem] overflow-hidden flex flex-col border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)]">

                {/* HEADER - AI STUDIO INTERFACE */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/40">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
                            <Cpu size={28} />
                        </div>
                        <div>
                            <h2 className="text-white font-black uppercase text-2xl tracking-tighter italic">Creative Studio <span className="text-indigo-400 font-mono">AI-Synth</span></h2>
                            <p className="text-[10px] text-indigo-400 font-mono tracking-[0.3em] uppercase">Nano Banana Powered Infrastructure</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={generate} disabled={isGenerating} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-3 transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                            <RefreshCw size={20} className={isGenerating ? "animate-spin" : ""} />
                            <span>RE-IMAGINAR ESCENAS</span>
                        </button>
                        <button onClick={onClose} className="bg-white/5 p-4 rounded-2xl text-gray-400 hover:text-white transition-all"><X size={24} /></button>
                    </div>
                </div>

                {/* AI RENDER CANVAS */}
                <div className="flex-1 overflow-x-auto p-12 bg-[#050505] flex justify-center items-center gap-12">
                    <AnimatePresence>
                        {layouts.map((layout, idx) => (
                            <motion.div
                                key={layout.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex flex-col gap-6"
                            >
                                <div
                                    ref={el => adRefs.current[idx] = el}
                                    className="relative w-[340px] h-[604px] bg-black overflow-hidden shadow-2xl rounded-[4px]"
                                >
                                    {/* AI GENERATED BACKDROP */}
                                    <img src={`${layout.scene.url}?auto=format&fit=crop&q=90&w=1080`} className="absolute inset-0 w-full h-full object-cover grayscale-[20%] brightness-[0.7]" alt="" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                                    {/* PRODUCT COMPOSITING ENGINE */}
                                    <div className={`absolute inset-0 flex flex-col p-8 z-10 ${layout.pos === 'left' ? 'items-start' : layout.pos === 'right' ? 'items-end' : 'items-center justify-center'
                                        }`}>
                                        <div className="relative w-full h-[60%] flex flex-col items-center justify-center">
                                            {/* CONTACT SHADOW (BLENDED) */}
                                            <div className="absolute bottom-4 w-[75%] h-14 bg-black/80 blur-3xl rounded-[100%] mix-blend-multiply opacity-90" />

                                            <img
                                                style={{
                                                    rotate: `${layout.rotation}deg`,
                                                    mixBlendMode: 'multiply',
                                                    filter: 'contrast(1.4) brightness(1.1) saturate(1.1)',
                                                    WebkitMaskImage: 'linear-gradient(to bottom, black 95%, transparent 100%)'
                                                }}
                                                src={product.image_url}
                                                className="relative w-full h-full object-contain z-10 drop-shadow-[0_30px_60px_rgba(0,0,0,0.8)]"
                                            />
                                        </div>
                                    </div>

                                    {/* SYNTHETIC TYPOGRAPHY */}
                                    <div className="absolute inset-0 p-10 flex flex-col justify-between z-20 pointer-events-none">
                                        <div className="flex justify-between items-start">
                                            <div className="bg-indigo-600/20 backdrop-blur-md border border-indigo-500/30 px-3 py-1 rounded text-[8px] font-black text-indigo-300 tracking-[0.4em] uppercase">
                                                Synth v3.0 / IA
                                            </div>
                                            <Target size={14} className="text-white/20" />
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-1">
                                                <h3 className={`text-white text-4xl leading-[0.85] uppercase font-black drop-shadow-2xl ${ctx.font}`}>
                                                    {product.name}
                                                </h3>
                                                <p className="text-[10px] font-bold text-indigo-400 tracking-[0.5em] uppercase italic">
                                                    Atmósfera {layout.scene.name}
                                                </p>
                                            </div>

                                            <div className="flex items-end justify-between">
                                                <div className="space-y-3">
                                                    <div className="bg-white text-black text-[10px] font-black px-3 py-1 inline-block rounded-sm transform -rotate-2">
                                                        10% OFF TRANSF.
                                                    </div>
                                                    <p className={`text-4xl font-black tracking-tighter ${ctx.color} drop-shadow-xl`}>
                                                        ${product.price.toLocaleString('es-AR')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => download(idx)}
                                    className="w-full bg-white hover:bg-indigo-500 hover:text-white text-black py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl"
                                >
                                    <Download size={18} /> DESCARGAR MASTER AI
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}