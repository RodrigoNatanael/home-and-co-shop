import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, Plus, Minus, Lock } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/Button';
import LeadCaptureModal from '../LeadCaptureModal';

export default function CartDrawer() {
    const {
        cart,
        isCartOpen,
        closeCart,
        removeFromCart,
        updateQuantity,
        cartSubtotal,
        discountInfo
    } = useCart();

    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

    // Helper for formatting price
    const formatPrice = (price) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price);

    return (
        <>
            <AnimatePresence>
                {isCartOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeCart}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                                <h2 className="font-display font-bold text-2xl uppercase tracking-wide flex items-center gap-2">
                                    <ShoppingBag size={24} /> Tu Equipo
                                </h2>
                                <button onClick={closeCart} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Cart Items */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                                        <ShoppingBag size={64} strokeWidth={1} />
                                        <p className="text-lg font-medium">No hay items en tu equipo.</p>
                                        <Button variant="outline" onClick={closeCart} className="text-brand-dark border-brand-dark hover:bg-brand-dark hover:text-white">
                                            Volver a la tienda
                                        </Button>
                                    </div>
                                ) : (
                                    cart.map((item) => (
                                        <div key={`${item.id}-${item.selectedColor}`} className="flex gap-4">
                                            {/* Image */}
                                            <div className="w-24 h-24 bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-display font-bold text-lg leading-tight uppercase w-full pr-2">
                                                            {item.name}
                                                        </h3>
                                                        <button
                                                            onClick={() => removeFromCart(item.id, item.selectedColor)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                    {item.selectedColor && (
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div
                                                                className="w-3 h-3 rounded-full border border-gray-300"
                                                                style={{ backgroundColor: item.selectedColor }}
                                                            />
                                                            <span className="text-xs text-gray-500 uppercase">
                                                                {item.selectedColor}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex justify-between items-end mt-2">
                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center border border-gray-300">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.selectedColor, -1)}
                                                            className="p-1 hover:bg-gray-100"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="px-3 text-sm font-bold min-w-[2rem] text-center">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.selectedColor, 1)}
                                                            className="p-1 hover:bg-gray-100"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>

                                                    {/* Price */}
                                                    <span className="font-bold text-lg">
                                                        {formatPrice(item.price * item.quantity)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            {cart.length > 0 && (
                                <div className="p-6 border-t border-gray-200 bg-gray-50">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-500 font-bold uppercase tracking-wider text-sm">Subtotal</span>
                                        <span className="font-mono text-gray-500">
                                            {formatPrice(cartSubtotal)}
                                        </span>
                                    </div>

                                    {discountInfo && discountInfo.amount > 0 && (
                                        <div className="flex justify-between items-center mb-4 bg-green-50 p-2 rounded border border-green-200 animate-in fade-in">
                                            <span className="text-green-700 font-bold uppercase tracking-wider text-sm flex items-center gap-1">
                                                <ShoppingBag size={14} /> Descuento ({discountInfo.code})
                                            </span>
                                            <span className="font-mono font-bold text-green-700">
                                                - {formatPrice(discountInfo.amount)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center mb-6 pt-2 border-t border-gray-200">
                                        <span className="text-black font-bold uppercase tracking-wider text-lg">Total</span>
                                        <span className="font-display font-bold text-3xl">
                                            {formatPrice(cartTotal)}
                                        </span>
                                    </div>

                                    <Button
                                        size="lg"
                                        className="w-full text-lg h-16 flex justify-between items-center px-8"
                                        onClick={() => setIsCheckoutModalOpen(true)}
                                    >
                                        <span>FINALIZAR COMPRA</span>
                                        <Lock size={20} />
                                    </Button>

                                    <p className="text-center text-xs text-gray-400 mt-4">
                                        Envío calculado en el siguiente paso.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <LeadCaptureModal
                isOpen={isCheckoutModalOpen}
                onClose={() => setIsCheckoutModalOpen(false)}
                cartTotal={cartTotal}
                cartItems={cart}
            />
        </>
    );
}
