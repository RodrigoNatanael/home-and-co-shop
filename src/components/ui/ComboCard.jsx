import React from 'react';
import { Package, ShoppingCart, Check } from 'lucide-react';
import { Button } from './Button';
import { useCart } from '../../context/CartContext';

export const ComboCard = ({ combo }) => {
    const { addItem } = useCart();
    const includedProducts = combo.products_json || [];

    return (
        <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
            {/* Image Section */}
            <div className="relative h-64 overflow-hidden bg-gray-100">
                {combo.image_url ? (
                    <img
                        src={combo.image_url}
                        alt={combo.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package size={48} className="text-gray-300" />
                    </div>
                )}
                <div className="absolute top-4 right-4">
                    <span className="bg-brand-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                        COMBO AHORRO
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-1">
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-dark transition-colors">
                        {combo.name}
                    </h3>

                    {/* Price Section */}
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

                {/* Footer Section */}
                <div className="mt-auto pt-4 border-t border-gray-50">
                    <Button
                        onClick={() => addItem({ ...combo, type: 'combo' })}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-black hover:bg-brand-dark text-white rounded-xl transition-all active:scale-95 shadow-md hover:shadow-lg"
                    >
                        <ShoppingCart size={18} />
                        Agregar al Carrito
                    </Button>
                </div>
            </div>
        </div>
    );
};