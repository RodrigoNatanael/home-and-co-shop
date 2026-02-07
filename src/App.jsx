import React from 'react';
import { useCart } from '../../context/CartContext';
import { X, Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    toggleCart,
    removeFromCart,
    updateQuantity,
    cartTotal
  } = useCart();

  const navigate = useNavigate();

  const handleCheckout = () => {
    // Texto para WhatsApp
    const message = `Hola Home & Co! Quiero comprar lo siguiente:%0A%0A` +
      cart.map(item => `- ${item.name} (x${item.quantity}) - $${item.price * item.quantity}`).join('%0A') +
      `%0A%0A*Total: $${cartTotal}*`;

    window.open(`https://wa.me/5492617523156?text=${message}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop Oscuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black z-[60]"
          />

          {/* Panel Lateral del Carrito */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-[70] flex flex-col"
          >

            {/* Header (ACÁ ESTABA EL ERROR: YA TIENE EL CIERRE >) */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="font-display font-bold text-2xl uppercase tracking-wide flex items-center gap-2">
                <ShoppingBag size={24} /> Tu Equipo
              </h2>
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Lista de Productos */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                  <ShoppingBag size={64} strokeWidth={1} />
                  <p className="text-lg">Tu carrito está vacío</p>
                  <button
                    onClick={() => { toggleCart(); navigate('/catalog'); }}
                    className="text-black font-bold underline"
                  >
                    Ver Productos
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    layout
                    key={item.id}
                    className="flex gap-4 bg-gray-50 p-3 rounded-xl"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg bg-white"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm line-clamp-2">{item.name}</h3>
                        <p className="text-gray-500 text-xs">{item.category}</p>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="font-bold text-lg">${item.price * item.quantity}</span>

                        <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg border border-gray-200">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:text-red-500"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:text-green-500"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 self-start p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer con Total */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-white space-y-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total:</span>
                  <span>${cartTotal}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-900 transition-transform active:scale-95"
                >
                  Finalizar Compra
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}