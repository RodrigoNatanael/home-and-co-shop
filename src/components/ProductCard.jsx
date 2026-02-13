import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ProductCard({ product }) {
    // --- 1. LÓGICA PREVIA (Optimizada) ---

    // Formateador de moneda (reutilizable)
    const formatPrice = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Cálculos de estado
    const hasDiscount = product.previous_price > product.price;
    const discountPercentage = hasDiscount
        ? Math.round(((product.previous_price - product.price) / product.previous_price) * 100)
        : 0;
    const isOutOfStock = product.stock === 0;
    const isLowStock = product.stock > 0 && product.stock <= 3;

    return (
        <Link to={`/product/${product.id}`} className="group block h-full">
            <motion.div
                whileHover={{ y: -5 }}
                className="bg-white h-full flex flex-col border border-gray-100 rounded-xl overflow-hidden relative shadow-sm hover:shadow-xl transition-all duration-300"
            >
                {/* --- 2. ÁREA DE IMAGEN --- */}
                <div className="aspect-square bg-gray-50 flex items-center justify-center relative overflow-hidden">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
                            loading="lazy"
                        />
                    ) : (
                        <div className="text-gray-300 text-xs font-bold uppercase">Sin Imagen</div>
                    )}

                    {/* Overlay: Agotado */}
                    {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[2px]">
                            <span className="bg-black text-white text-xs font-bold px-4 py-2 uppercase tracking-widest shadow-lg transform -rotate-6">
                                Agotado
                            </span>
                        </div>
                    )}

                    {/* --- 3. ETIQUETAS FLOTANTES (Badges) --- */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2 items-start z-10">
                        {/* Badge Descuento */}
                        {hasDiscount && !isOutOfStock && (
                            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-sm uppercase tracking-wider">
                                {discountPercentage}% OFF
                            </span>
                        )}

                        {/* Tags Personalizados */}
                        {product.tags && product.tags.map(tag => (
                            <span key={tag} className="bg-white/90 backdrop-blur-md text-black text-[9px] font-bold px-2 py-1 rounded border border-gray-200 uppercase tracking-wide">
                                {tag}
                            </span>
                        ))}

                        {/* Alerta Poco Stock */}
                        {isLowStock && (
                            <span className="bg-orange-500 text-white text-[9px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wider animate-pulse">
                                ¡Últimas {product.stock}!
                            </span>
                        )}
                    </div>
                </div>

                {/* --- 4. INFO DEL PRODUCTO --- */}
                <div className="p-5 text-left flex flex-col flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                        {product.category || 'General'}
                    </p>

                    <h3 className="font-bold text-base text-gray-900 mb-3 group-hover:text-black leading-tight line-clamp-2 min-h-[2.5rem]">
                        {product.name}
                    </h3>

                    {/* Precios (Empujados al fondo) */}
                    <div className="mt-auto pt-3 border-t border-gray-50">
                        {hasDiscount && (
                            <p className="text-xs text-gray-400 font-medium line-through">
                                {formatPrice(product.previous_price)}
                            </p>
                        )}
                        <div className="flex items-center justify-between">
                            <p className={`font-black text-xl ${hasDiscount ? 'text-red-600' : 'text-gray-900'}`}>
                                {formatPrice(product.price)}
                            </p>

                            {/* Pequeño botón visual (opcional, mejora UX) */}
                            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

