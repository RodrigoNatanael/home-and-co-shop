import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Lock, MapPin, Phone } from 'lucide-react'; // Agregamos iconos
import { supabase } from '../supabaseclient';

export default function LeadCaptureModal({ isOpen, onClose, cartTotal, cartItems }) {
    // Estados para datos personales y de envío
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');       // Nuevo
    const [address, setAddress] = useState('');   // Nuevo
    const [city, setCity] = useState('');         // Nuevo
    const [zip, setZip] = useState('');           // Nuevo

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handlePurchase = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Limpieza del precio
            const rawPrice = cartTotal;
            const precioLimpio = String(rawPrice).split(',')[0].replace(/\D/g, '');
            const unit_price = parseInt(precioLimpio, 10);

            if (!unit_price || isNaN(unit_price)) throw new Error("Precio inválido");

            // 2. PREPARAR EL PEDIDO COMPLETO
            // Aquí guardamos TODO lo que necesitas para hacer el envío
            const orderDetails = {
                items: cartItems,          // Qué compró (Lista completa)
                total: unit_price,         // Cuánto pagó
                shipping: {                // A dónde enviarlo
                    address,
                    city,
                    zip,
                    phone
                }
            };

            // 3. GUARDAR EN SUPABASE (Tabla 'leads')
            // La columna 'metadata' es mágica: guarda todo el objeto orderDetails
            const { error: leadError } = await supabase
                .from('leads')
                .insert([{
                    name,
                    email,
                    status: 'initiated_checkout_pending_payment', // Estado inicial
                    metadata: orderDetails // ¡Aquí va toda la info del pedido!
                }]);

            if (leadError) console.warn("Lead no guardado", leadError);

            // --- GOOGLE SHEETS INTEGRATION ---
            // Enviamos el pedido a Google Sheets sin bloquear el flujo principal
            try {
                const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzj2y4AnbJIJoVdqQz-eHnIiMRr6kIZeWVevn2XLkM0GNhO65K9yYGrj3aSeWRpr0lM/exec';

                const formData = new FormData();
                formData.append('date', new Date().toLocaleString('es-AR'));
                formData.append('total', unit_price);
                formData.append('cliente', JSON.stringify({ name, email, phone, city, address }));
                formData.append('items', JSON.stringify(cartItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    color: item.selectedColor || 'N/A'
                }))));

                console.log('--- ENVIANDO A GOOGLE SHEETS ---');
                console.log('URL:', GOOGLE_SCRIPT_URL);
                for (let pair of formData.entries()) {
                    console.log(pair[0] + ': ' + pair[1]);
                }

                await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: formData // Browser sets Content-Type automatically
                });

                // Pequeño retraso de seguridad para asegurar que la petición salga
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (sheetErr) {
                console.warn('Error en integración Google Sheets:', sheetErr);
            }
            // ---------------------------------

            // --- WHATSAPP INTEGRATION ---
            // 4. Redirigir a WhatsApp en lugar de Mercado Pago
            const WHATSAPP_NUMBER = '5492617523156';

            const message = `¡Hola Home & Co! 👋\n\nMi nombre es ${name}.\nQuiero confirmar mi pedido por un total de *${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(unit_price)}*.\n\n📍 *Dirección de Envío:*\n${address}, ${city} (CP: ${zip})\n\n📦 *Productos:*\n${cartItems.map(item => `- ${item.quantity}x ${item.name} ${item.selectedColor ? `(${item.selectedColor})` : ''}`).join('\n')}\n\n¡Espero su confirmación para realizar el pago!`;

            const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

            // Open in new tab
            window.open(whatsappUrl, '_blank');

            // Close modal and optionally clear cart (or leave it up to user logic, but usually good to clear or let them close)
            onClose();

        } catch (err) {
            console.error(err);
            setError('Hubo un error al procesar. Intenta nuevamente.');
        } finally {
            if (error) setLoading(false);
            // We don't necessarily stop loading if we redirect, but good practice
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]" onClick={onClose} />
                    <motion.div className="fixed inset-0 z-[70] flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div className="bg-white w-full max-w-md p-6 shadow-2xl border-2 border-brand-dark relative my-8">

                            {/* Header */}
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="font-display font-bold text-xl uppercase text-brand-dark">Datos de Envío</h3>
                                    <p className="text-xs text-gray-500">¿A dónde te enviamos tu compra?</p>
                                </div>
                                <button onClick={onClose}><X size={24} className="text-brand-dark" /></button>
                            </div>

                            {/* Resumen Precio */}
                            <div className="mb-4 bg-gray-50 p-3 border border-gray-200 flex justify-between items-center">
                                <span className="text-xs text-gray-500 font-bold uppercase">Total a Pagar</span>
                                <span className="font-display font-bold text-2xl text-brand-dark">
                                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(cartTotal)}
                                </span>
                            </div>

                            {/* Formulario de Envío */}
                            <form onSubmit={handlePurchase} className="space-y-3">

                                {/* Datos Personales */}
                                <div className="grid grid-cols-1 gap-3">
                                    <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-300 focus:border-brand-dark outline-none text-sm" placeholder="Nombre Completo" />
                                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-300 focus:border-brand-dark outline-none text-sm" placeholder="Email" />
                                    <div className="relative">
                                        <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                                        <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full pl-9 pr-3 py-2 border-2 border-gray-300 focus:border-brand-dark outline-none text-sm" placeholder="Teléfono (para el correo)" />
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 my-2 pt-2">
                                    <p className="text-xs font-bold text-brand-dark uppercase mb-2 flex items-center gap-1"><MapPin size={12} /> Dirección de Entrega</p>
                                </div>

                                {/* Dirección */}
                                <input type="text" required value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-300 focus:border-brand-dark outline-none text-sm" placeholder="Calle y Altura (Ej: San Martin 123)" />

                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" required value={city} onChange={e => setCity(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-300 focus:border-brand-dark outline-none text-sm" placeholder="Ciudad / Localidad" />
                                    <input type="text" required value={zip} onChange={e => setZip(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-300 focus:border-brand-dark outline-none text-sm" placeholder="Código Postal" />
                                </div>

                                {error && <div className="text-red-500 text-xs bg-red-50 p-2">{error}</div>}

                                <button type="submit" disabled={loading} className="w-full mt-4 bg-brand-dark text-white py-3 font-bold text-lg uppercase flex justify-center items-center gap-2 hover:bg-black transition-all shadow-lg">
                                    {loading ? <Loader2 className="animate-spin" /> : "CONFIRMAR PEDIDO"}
                                </button>
                            </form>

                            <p className="mt-3 text-center text-[10px] text-gray-400"><Lock size={10} className="inline mr-1" /> Tus datos viajan encriptados.</p>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}