import React from 'react';
import { motion } from 'framer-motion';
import { Package, Check, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button } from './Button';

export default function ComboCard({ combo }) {
    const { addToCart, openCart } = useCart();

    const handleAddToCart = () => {
        addToCart(combo, 1);
        openCart();
    };

    // Parse products_json if it's a string, or use as is if it's already an object
    // Supabase usually returns JSON columns as objects automatically in JS
    const includedProducts = Array.isArray(combo.products_json) ? combo.products_json : [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full"
        >
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                    src={combo.image_url}
                    alt={combo.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 bg-brand-dark text-white text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wide">
                    Combo Oferta
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-dark transition-colors">
                        {combo.name}
                    </h3>

                    {/* Price */}
                    <div className="mb-4">
                        <span className="text-2xl font-bold text-brand-dark">
                            {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(combo.price)}
                        </span>
                    </div>

                    {/* Included Items List */}
                    {includedProducts.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                                <Package size={12} /> Incluye:
                            </h4>
                            <ul className="space-y-1">
                                {includedProducts.map((prod, idx) => (
                                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                        <Check size={14} className="text-green-500 mt-0.5 shrink-0" />
                                        <span className="line-clamp-1">{prod.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Action */}
                <Button
                    onClick={handleAddToCart}
                    className="w-full gap-2 group-hover:bg-brand-dark group-hover:text-white transition-colors"
                >
                    <ShoppingCart size={18} /> Agregar Combo
                </Button>
            </div>
        </motion.div>
    );
}
