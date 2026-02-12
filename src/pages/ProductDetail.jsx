import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, ShieldCheck, MessageCircle, Image as ImageIcon } from 'lucide-react';
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

    // Estados para la nueva lógica (Galería y Variantes)
    const [activeImage, setActiveImage] = useState('');
    const [selectedVariant, setSelectedVariant] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*') // Trae todo: image_url, gallery, variants, etc.
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching product:', error);
            } else {
                setProduct(data);
                // 1. Setear imagen principal inicial
                setActiveImage(data.image_url);

                // 2. Setear variante inicial (si existe en la nueva columna 'variants' o la vieja 'colors')
                if (data.variants && data.variants.length > 0) {
                    setSelectedVariant(data.variants[0]);
                } else if (data.colors && data.colors.length > 0) {
                    // Fallback por si hay productos viejos con la columna colors
                    setSelectedVariant(data.colors[0]);
                }
            }
            setLoading(false);
        };
        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex justify-center font-bold text-xl tracking-wider">
                <p>CARGANDO EQUIPAMIENTO...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen pt-32 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
                <Link to="/catalog" className="underline">Volver al catálogo</Link>
            </div>
        );
    }

    // Mensaje de WhatsApp Optimizado
    const message = `Hola! 👋 Estoy viendo el *${product.name}* (Variante: ${selectedVariant || 'Única'}) en la web y me gustaría consultar stock.`;
    const whatsappUrl = `https://wa.me/5492617523156?text=${encodeURIComponent(message)}`;

    // Calculo de Descuento
    const discount = product.previous_price
        ? Math.round(((product.previous_price - product.price) / product.previous_price) * 100)
        : 0;

    return (
        <div className="pt-20 min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16">

                {/* Back Link */}
                <Link to="/catalog" className="inline-flex items-center text-gray-500 hover:text-black mb-8 font-bold uppercase text-sm tracking-wider transition-colors">
                    <ArrowLeft size={16} className="mr-2" /> Volver
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

                    {/* --- COLUMNA IZQUIERDA: GALERÍA --- */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col gap-4"
                    >
                        {/* Imagen Principal */}
                        <div className="bg-gray-50 aspect-square flex items-center justify-center relative overflow-hidden rounded-2xl border border-gray-100 group">
                            <img
                                src={activeImage || product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {/* Tags flotantes sobre la imagen */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                {discount > 0 && <span className="bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase shadow-sm">{discount}% OFF</span>}
                            </div>
                        </div>

                        {/* Carrusel de Miniaturas (Solo si hay galería) */}
                        {product.gallery && product.gallery.length > 0 && (
                            <div className="grid grid-cols-4 gap-3">
                                {/* Botón para volver a la imagen principal original */}
                                <button
                                    onClick={() => setActiveImage(product.image_url)}
                                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === product.image_url ? 'border-black opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={product.image_url} className="w-full h-full object-cover" alt="Principal" />
                                </button>

                                {/* Botones para las imágenes de la galería */}
                                {product.gallery.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveImage(img)}
                                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-black opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" alt={`Vista ${index}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* --- COLUMNA DERECHA: INFO --- */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col h-full"
                    >
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {product.tags && product.tags.map(tag => (
                                <span key={tag} className="bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <span className="text-gray-500 font-bold uppercase tracking-wider text-sm mb-2">{product.category}</span>
                        <h1 className="font-display font-black italic text-4xl md:text-5xl lg:text-6xl mb-6 leading-none uppercase tracking-tighter">{product.name}</h1>

                        {/* Precios */}
                        <div className="flex items-end gap-4 mb-8 border-b pb-8 border-gray-100">
                            {product.previous_price > product.price && (
                                <span className="text-xl text-gray-300 font-bold line-through mb-2">
                                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(product.previous_price)}
                                </span>
                            )}
                            <div className={`text-5xl font-black ${product.previous_price > product.price ? 'text-red-600' : 'text-black'}`}>
                                {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(product.price)}
                            </div>
                        </div>

                        <div className="mb-8">
                            <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
                        </div>

                        {/* SELECTOR DE VARIANTES (NUEVO: TEXTO) */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="mb-8">
                                <span className="block font-bold text-sm uppercase tracking-wider mb-3 text-gray-900">
                                    Elegí tu variante: <span className="text-gray-500">{selectedVariant}</span>
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {product.variants.map(variant => (
                                        <button
                                            key={variant}
                                            onClick={() => setSelectedVariant(variant)}
                                            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase border-2 transition-all ${selectedVariant === variant
                                                    ? 'border-black bg-black text-white shadow-lg'
                                                    : 'border-gray-200 text-gray-500 hover:border-black hover:text-black'
                                                }`}
                                        >
                                            {variant}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Características / Features */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                            {product.features?.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <Check size={18} className="mt-1 text-brand-primary shrink-0" strokeWidth={3} />
                                    <span className="text-gray-700 font-medium text-sm">{feature}</span>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="mt-auto pt-4 flex flex-col gap-4">
                            <div className="mb-2">
                                {product.stock > 0 && product.stock <= 5 && <StockScarcity stock={product.stock} />}
                            </div>

                            <Button
                                size="lg"
                                className={`w-full text-lg h-16 rounded-xl font-black uppercase tracking-wide shadow-xl ${product.stock === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-black text-white hover:scale-[1.01] transition-transform'}`}
                                onClick={() => addToCart(product, 1, selectedVariant)}
                                disabled={product.stock === 0}
                            >
                                {product.stock === 0 ? 'SIN STOCK' : 'AGREGAR AL EQUIPO'}
                            </Button>

                            <p className="text-xs text-gray-400 flex items-center justify-center gap-2 font-bold mt-2">
                                <ShieldCheck size={14} /> Garantía asegurada de Home & Co.
                            </p>

                            <div className="mt-4">
                                <TrustBadges />
                            </div>

                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#25D366] text-white p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-colors font-bold mt-4 shadow-sm"
                            >
                                <MessageCircle size={20} />
                                Consultar por WhatsApp
                            </a>
                        </div>

                    </motion.div>
                </div>

                <RelatedProducts currentProductId={product.id} category={product.category} />
            </div>
        </div>
    );
}