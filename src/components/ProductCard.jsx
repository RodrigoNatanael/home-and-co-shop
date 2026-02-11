import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ProductCard({ product }) {
    return (
        <Link to={`/product/${product.id}`} className="group block">
            <motion.div
                whileHover={{ y: -5 }}
                className="bg-white  border text-center border-gray-200  overflow-hidden relative shadow-sm hover:shadow-xl transition-all duration-300"
            >
                {/* Image Area */}
                <div className="aspect-square bg-gray-100 flex items-center justify-center relative overflow-hidden">
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${product.stock === 0 ? 'grayscale opacity-60' : ''}`}
                    />

                    {/* Stock Status Overlays */}
                    {product.stock === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <span className="bg-black text-white text-xs font-bold px-3 py-1 uppercase tracking-wider shadow-lg transform -rotate-12">
                                Agotado
                            </span>
                        </div>
                    )}

                    {/* BADGES & TAGS */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2 items-start">
                        {/* Discount Badge */}
                        {product.previous_price > product.price && (
                            <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wider animate-pulse">
                                {Math.round(((product.previous_price - product.price) / product.previous_price) * 100)}% OFF
                            </span>
                        )}

                        {/* Custom Tags */}
                        {product.tags && product.tags.map(tag => (
                            <span key={tag} className="bg-white/90 backdrop-blur-sm text-black text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wide border border-black/5">
                                {tag}
                            </span>
                        ))}

                        {/* Low Stock Warning */}
                        {product.stock > 0 && product.stock <= 3 && (
                            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wider">
                                ¡Últimas {product.stock}!
                            </span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 text-left flex flex-col h-full">
                    <p className="text-sm text-gray-500  font-bold uppercase tracking-wider mb-1">{product.category}</p>
                    <h3 className="font-display font-bold text-xl text-black  mb-2 group-hover:text-gray-700  transition-colors line-clamp-2">
                        {product.name}
                    </h3>

                    <div className="pt-3 border-t border-gray-100  mt-auto">
                        {product.previous_price > product.price && (
                            <p className="text-xs text-gray-400 font-medium line-through mb-0.5">
                                {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(product.previous_price)}
                            </p>
                        )}
                        <p className={`font-bold text-lg ${product.previous_price > product.price ? 'text-red-600' : 'text-black'}`}>
                            {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(product.price)}
                        </p>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

