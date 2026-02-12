import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, ShieldCheck, MessageCircle } from 'lucide-react';
import { supabase } from '../supabaseclient';
import { Button } from '../components/ui/Button';
import StockScarcity from '../components/ui/StockScarcity';
import TrustBadges from '../components/ui/TrustBadges';
import RelatedProducts from '../components/ui/RelatedProducts';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    const [activeImage, setActiveImage] = useState('');
    const [selectedVariant, setSelectedVariant] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (!error && data) {
                setProduct(data);
                setActiveImage(data.image_url);
                if (data.variants?.length > 0) setSelectedVariant(data.variants[0]);
            }
            setLoading(false);
        };
        fetchProduct();
    }, [id]);

    if (loading) return <div className="min-h-screen pt-32 flex justify-center font-bold uppercase tracking-widest text-gray-400">Cargando...</div>;
    if (!product) return <div className="min-h-screen pt-32 flex flex-col items-center justify-center font-bold uppercase tracking-widest text-gray-400">Producto no encontrado</div>;

    const message = `Hola! 👋 Estoy viendo el *${product.name}* (Variante: ${selectedVariant || 'Única'}) y me gustaría consultar stock.`;
    const whatsappUrl = `https://wa.me/5492617523156?text=${encodeURIComponent(message)}`;
    const discount = product.previous_price ? Math.round(((product.previous_price - product.price) / product.previous_price) * 100) : 0;

    return (
        <div className="pt-16 md:pt-20 min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-16">

                {/* Botón Volver - Más pequeño en mobile */}
                <Link to="/catalog" className="inline-flex items-center text-gray-500 hover:text-black mb-6 md:mb-8 font-bold uppercase text-[10px] md:text-sm tracking-widest transition-colors">
                    <ArrowLeft size={14} className="mr-2" /> Volver al catálogo
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24">

                    {/* --- GALERÍA --- */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 md:gap-4">
                        <div className="bg-gray-50 aspect-square flex items-center justify-center relative overflow-hidden rounded-2xl md:rounded-3xl border border-gray-100 group">
                            <img src={activeImage || product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute top-3 left-3 md:top-4 md:left-4 flex flex-col gap-2">
                                {discount > 0 && <span className="bg-red-600 text-white text-[10px] md:text-xs font-black px-2 md:px-3 py-1 rounded-full uppercase shadow-sm">{discount}% OFF</span>}
                            </div>
                        </div>

                        {/* Miniaturas con Scroll Horizontal en Mobile */}
                        {product.gallery?.length > 0 && (
                            <div className="flex lg:grid lg:grid-cols-4 gap-2 md:gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
                                <button onClick={() => setActiveImage(product.image_url)} className={`flex-shrink-0 w-16 h-16 md:w-auto md:h-auto aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === product.image_url ? 'border-black opacity-100' : 'border-transparent opacity-60'}`}>
                                    <img src={product.image_url} className="w-full h-full object-cover" alt="Principal" />
                                </button>
                                {product.gallery.map((img, index) => (
                                    <button key={index} onClick={() => setActiveImage(img)} className={`flex-shrink-0 w-16 h-16 md:w-auto md:h-auto aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-black opacity-100' : 'border-transparent opacity-60'}`}>
                                        <img src={img} className="w-full h-full object-cover" alt={`Vista ${index}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* --- INFO DEL PRODUCTO --- */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col">
                        <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
                            {product.tags?.map(tag => (
                                <span key={tag} className="bg-black text-white text-[8px] md:text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">{tag}</span>
                            ))}
                        </div>

                        <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px] md:text-xs mb-1 md:mb-2">{product.category}</span>
                        <h1 className="font-display font-black italic text-3xl md:text-5xl lg:text-6xl mb-4 md:mb-6 leading-none uppercase tracking-tighter">{product.name}</h1>

                        <div className="flex items-end gap-3 mb-6 md:mb-8 border-b pb-6 md:pb-8 border-gray-100">
                            {product.previous_price > product.price && (
                                <span className="text-lg md:text-xl text-gray-300 font-bold line-through mb-1 md:mb-2">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(product.previous_price)}</span>
                            )}
                            <div className={`text-4xl md:text-5xl font-black ${product.previous_price > product.price ? 'text-red-600' : 'text-black'}`}>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(product.price)}</div>
                        </div>

                        {/* Descripción más compacta en mobile */}
                        <div className="mb-6 md:mb-8">
                            <p className="text-gray-600 text-sm md:text-lg leading-relaxed">{product.description}</p>
                        </div>

                        {/* Variantes */}
                        {product.variants?.length > 0 && (
                            <div className="mb-6 md:mb-8">
                                <span className="block font-bold text-[10px] md:text-sm uppercase tracking-widest mb-3 text-gray-900">Elegí tu variante: <span className="text-gray-400">{selectedVariant}</span></span>
                                <div className="flex flex-wrap gap-2">
                                    {product.variants.map(variant => (
                                        <button key={variant} onClick={() => setSelectedVariant(variant)} className={`px-4 md:px-6 py-2 rounded-lg text-[10px] md:text-xs font-black uppercase border-2 transition-all ${selectedVariant === variant ? 'border-black bg-black text-white' : 'border-gray-100 text-gray-400 hover:border-black hover:text-black'}`}>{variant}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Botones de Acción - Optimizados para el pulgar */}
                        <div className="mt-auto space-y-3 md:space-y-4">
                            {product.stock > 0 && product.stock <= 5 && <StockScarcity stock={product.stock} />}
                            <Button size="lg" className={`w-full text-sm md:text-lg h-14 md:h-16 rounded-xl font-black uppercase tracking-widest shadow-xl transition-all ${product.stock === 0 ? 'bg-gray-100 text-gray-300' : 'bg-black text-white active:scale-95'}`} onClick={() => addToCart(product, 1, selectedVariant)} disabled={product.stock === 0}>{product.stock === 0 ? 'Sin Stock' : 'Agregar al equipo'}</Button>
                            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] text-white h-14 md:h-16 rounded-xl flex items-center justify-center gap-2 hover:bg-[#20bd5a] active:scale-95 transition-all font-black uppercase text-xs md:text-sm tracking-widest shadow-sm"><MessageCircle size={18} /> Consultar WhatsApp</a>
                            <p className="text-[9px] md:text-xs text-gray-400 flex items-center justify-center gap-2 font-bold uppercase tracking-widest pt-2"><ShieldCheck size={12} /> Garantía asegurada de Home & Co.</p>
                            <div className="mt-2"><TrustBadges /></div>
                        </div>
                    </motion.div>
                </div>
                <RelatedProducts currentProductId={product.id} category={product.category} />
            </div>
        </div>
    );
}