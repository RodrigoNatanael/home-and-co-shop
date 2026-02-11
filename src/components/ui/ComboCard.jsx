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
            className="group bg-white  rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100  overflow-hidden flex flex-col h-full"
        >
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                    src={combo.image_url}
                    alt={combo.name}
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${combo.stock === 0 ? 'grayscale opacity-60' : ''}`}
                />

                {/* Stock Status Overlays */}
                {combo.stock === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <span className="bg-black text-white text-xs font-bold px-3 py-1 uppercase tracking-wider shadow-lg transform -rotate-12">
                            Agotado
                        </span>
                    </div>
                )}

                <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                    <div className="bg-brand-dark text-white text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wide">
                        Combo Oferta
                    </div>
                    {combo.stock > 0 && combo.stock <= 3 && (
                        <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md uppercase tracking-wide animate-pulse">
                            ¡Quedan {combo.stock}!
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900  mb-2 group-hover:text-brand-dark  transition-colors">
                        {combo.name}
                    </h3>

                    {/* Price */}
                    <div className="mb-4">
                        <span className="text-2xl font-bold text-brand-dark 
                            {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(combo.price)}
                        </span>
                    </div>

                    {/* Included Items List */}
                    {includedProducts.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <h4 className="text-xs font-bold text-gray-500  uppercase mb-2 flex items-center gap-1">
                            <Package size={12} /> Incluye:
                        </h4>
                        <ul className="space-y-1">
                            {includedProducts.map((prod, idx) => (
                                <li key={idx} className="text-sm text-gray-700  flex items-start gap-2">
                                    <Check size={14} className="text-green-500  mt-0.5 shrink-0" />
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
                    disabled={combo.stock === 0}
                    className={`w-full gap-2 transition-colors ${combo.stock === 0 ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'group-hover:bg-brand-dark group-hover:text-white'}`}
                >
                    {combo.stock === 0 ? (
                        <>Sin Stock</>
                    ) : (
                        <>
                            <ShoppingCart size={18} /> Agregar Combo
                        </>
                    )}
                </Button>
            </div>
        </motion.div>
    );
}

