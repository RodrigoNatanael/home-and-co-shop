import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ProductCard({ product }) {
    return (
        <Link to={`/product/${product.id}`} className="group block">
            <motion.div
                whileHover={{ y: -5 }}
                className="bg-white border text-center border-gray-200 overflow-hidden relative shadow-sm hover:shadow-xl transition-all duration-300"
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

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {product.stock > 0 && product.stock <= 3 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider animate-pulse">
                                ¡Últimas {product.stock}!
                            </span>
                        )}
                        {product.category === 'Mates' && product.stock > 3 && (
                            <span className="bg-brand-dark text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">
                                Best Seller
                            </span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 text-left">
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">{product.category}</p>
                    <h3 className="font-display font-bold text-xl text-black mb-2 group-hover:text-gray-700 transition-colors">
                        {product.name}
                    </h3>
                    <p className="text-lg font-bold text-black border-t border-gray-100 pt-3 mt-auto">
                        {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(product.price)}
                    </p>
                </div>
            </motion.div>
        </Link>
    );
}
