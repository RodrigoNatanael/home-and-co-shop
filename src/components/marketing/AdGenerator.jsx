import React from 'react';
import { X, Download, Share2, Sparkles } from 'lucide-react';

export default function AdGenerator({ product, onClose }) {
    if (!product) return null;

    const formattedPrice = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0
    }).format(product.price);

    // Placeholder functionality for buttons
    const handleDownload = () => {
        alert("Función de descarga simulada: Guardando imagen...");
    };

    const handleShare = () => {
        alert("Función de compartir simulada: Abriendo Instagram...");
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-sm bg-[#1a1a1a] rounded-[2rem] shadow-2xl overflow-hidden border border-white/10">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors backdrop-blur-md"
                >
                    <X size={20} />
                </button>

                {/* Ad Preview Area (The "Viral" Content) */}
                <div className="relative aspect-[9/16] bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-between p-8 group">

                    {/* Background Effect/Image */}
                    <div className="absolute inset-0 opacity-40">
                        {/* Abstract mountain/nature feel using gradients */}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-transparent to-transparent" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800/30 via-black to-black" />
                    </div>

                    {/* Product Image */}
                    <div className="relative w-full aspect-square mt-12 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-500">
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                        {/* overlay gradient on image */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        {/* Price Tag styled as "Andino Premium" */}
                        <div className="absolute bottom-4 right-4 bg-yellow-500/90 text-black px-4 py-2 rounded-full font-black text-xl backdrop-blur-md transform rotate-[-2deg] shadow-lg">
                            {formattedPrice}
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="relative z-10 text-center space-y-2 mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-2">
                            <Sparkles size={12} className="text-yellow-400" />
                            <span className="text-[10px] uppercase tracking-widest text-white font-bold">New Arrival</span>
                        </div>
                        <h2 className="text-4xl font-black text-white uppercase italic leading-none tracking-tighter drop-shadow-xl">
                            {product.name}
                        </h2>
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">
                            Home & Co <span className="text-yellow-500">•</span> Premium Gear
                        </p>
                    </div>

                    {/* Branding Footer */}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center opacity-50">
                        <div className="h-1 w-12 bg-white/20 rounded-full" />
                    </div>
                </div>

                {/* Action Bar */}
                <div className="bg-[#111] p-4 flex gap-3 border-t border-white/5">
                    <button
                        onClick={handleDownload}
                        className="flex-1 bg-white text-black py-3 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                    >
                        <Download size={16} /> Descargar
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    >
                        <Share2 size={16} /> Instagram
                    </button>
                </div>
            </div>
        </div>
    );
}
