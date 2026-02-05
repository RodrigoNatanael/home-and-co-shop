import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, ShieldCheck, Zap } from 'lucide-react';
import { products } from '../data/mockData';
import { Button } from '../components/ui/Button';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
    const { id } = useParams();
    const product = products.find(p => p.id === id);
    const { addToCart } = useCart();

    // Initial State
    const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || '#000000');

    if (!product) {
        return (
            <div className="min-h-screen pt-32 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
                <Link to="/catalog" className="underline">Volver al catálogo</Link>
            </div>
        );
    }

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
                        className="bg-gray-100 aspect-square flex items-center justify-center p-12 relative overflow-hidden group"
                    >
                        <div className="text-gray-300 text-center">
                            <span className="text-9xl block mb-4">📷</span>
                            <p className="font-display text-2xl uppercase tracking-widest opacity-50">{product.name}</p>
                        </div>
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
                            <Button size="lg" className="w-full text-lg h-16" onClick={() => addToCart(product, 1, selectedColor)}>
                                AGREGAR AL EQUIPO
                            </Button>
                            <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                                <ShieldCheck size={14} /> Garantía asegurada de Home & Co.
                            </p>
                        </div>

                    </motion.div>
                </div>
            </div>

            {/* Cross Selling (Simple) */}
            <section className="py-20 bg-gray-50 mt-12 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <h2 className="font-display font-bold text-3xl uppercase mb-8">Completa tu Equipo</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {products.slice(0, 4).map(p => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
