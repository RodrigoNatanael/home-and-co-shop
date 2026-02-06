import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, ShieldCheck, Zap, MessageCircle } from 'lucide-react';
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

    // Initial State
    const [selectedColor, setSelectedColor] = useState('#000000');

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*, image_url')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching product:', error);
            } else {
                setProduct(data);
                if (data.colors && data.colors.length > 0) {
                    setSelectedColor(data.colors[0]);
                }
            }
            setLoading(false);
        };
        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex justify-center">
                <p>Cargando...</p>
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

    // 1. Primero definimos el mensaje dinámico
    const message = `Hola Rodrigo! 👋 Estoy viendo el *${product.name}* en homeandcoarg.com y me gustaría consultar por el stock.`;

    // 2. Creamos el link codificado para que WhatsApp lo entienda
    const whatsappUrl = `https://wa.me/5492617523156?text=${encodeURIComponent(message)}`;

    return (
        <div className="pt-20 min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16">

                {/* Back Link */}
                <Link to="/catalog" className="inline-flex items-center text-gray-500 hover:text-black mb-8 font-bold uppercase text-sm tracking-wider transition-colors">
                    <ArrowLeft size={16} className="mr-2" /> Volver
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

                    {/* Left Column: Gallery */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-100 aspect-square flex items-center justify-center relative overflow-hidden group"
                    >
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </motion.div>

                    {/* Right Column: Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col h-full"
                    >
                        <span className="text-gray-500 font-bold uppercase tracking-wider text-sm mb-2">{product.category}</span>
                        <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl mb-6 leading-none uppercase">{product.name}</h1>

                        <div className="text-3xl font-bold mb-8">
                            {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(product.price)}
                        </div>

                        <div className="mb-8">
                            <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
                        </div>

                        {/* Color Selector */}
                        {product.colors && (
                            <div className="mb-8">
                                <span className="block font-bold text-sm uppercase tracking-wider mb-3">Color Seleccionado</span>
                                <div className="flex gap-3">
                                    {product.colors.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === color ? 'border-black scale-110' : 'border-transparent hover:scale-105'}`}
                                            style={{ backgroundColor: color }}
                                            aria-label={`Select color ${color}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tech Specs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                            {product.features?.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <Check size={18} className="mt-1 text-black shrink-0" strokeWidth={3} />
                                    <span className="text-gray-700 font-medium text-sm">{feature}</span>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="mt-auto pt-8 border-t border-gray-100 flex flex-col gap-4">
                            <div className="mb-4">
                                {product.stock > 0 && product.stock <= 3 && <StockScarcity stock={product.stock} />}
                            </div>
                            <Button
                                size="lg"
                                className={`w-full text-lg h-16 ${product.stock === 0 ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400' : ''}`}
                                onClick={() => addToCart(product, 1, selectedColor)}
                                disabled={product.stock === 0}
                            >
                                {product.stock === 0 ? 'SIN STOCK' : 'AGREGAR AL EQUIPO'}
                            </Button>
                            <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                                <ShieldCheck size={14} /> Garantía asegurada de Home & Co.
                            </p>
                            <TrustBadges />

                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#25D366] text-white p-4 rounded-full flex items-center justify-center gap-2 hover:scale-105 transition-transform font-bold"
                            >
                                <MessageCircle size={20} />
                                Consultar por este producto
                            </a>
                        </div>

                    </motion.div>
                </div>

                <RelatedProducts currentProductId={product.id} category={product.category} />
            </div>


        </div>
    );
}

