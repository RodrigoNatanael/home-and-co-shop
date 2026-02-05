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
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Badge (Optional) */}
                    <div className="absolute top-4 left-4">
                        {product.category === 'Mates' && (
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
