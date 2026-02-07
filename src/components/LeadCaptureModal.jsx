import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Lock, MapPin, Phone } from 'lucide-react'; // Agregamos iconos
import { supabase } from '../supabaseclient';

export default function LeadCaptureModal({ isOpen, onClose, cartItems }) {
    // Estados para datos personales y de envío
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');       // Nuevo
    const [address, setAddress] = useState('');   // Nuevo
    const [city, setCity] = useState('');         // Nuevo
    const [zip, setZip] = useState('');           // Nuevo

    // Local Calculation State
    const [localTotalData, setLocalTotalData] = useState({ total: 0, subtotal: 0, discount: 0, code: '' });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- FAILSAFE: CALCULATE TOTAL & DISCOUNT LOCALLY ---
    React.useEffect(() => {
        if (!isOpen) return;

        // 1. Calculate Subtotal from Items
        const rawSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        // 2. Check LocalStorage for Coupon
        const expiry = localStorage.getItem('wheel_won_expiry');
        const code = localStorage.getItem('wheel_prize_code');
        // label is display only

        let discountAmount = 0;
        let activeCode = '';

        if (expiry && code && Date.now() < parseInt(expiry)) {
            activeCode = code;
            if (code === 'HOME10') {
                discountAmount = rawSubtotal * 0.10;
            } else if (code === 'HOME5') {
                discountAmount = rawSubtotal * 0.05;
            } else if (code === 'DESC1000') {
                discountAmount = 1000;
            }
            // Add more codes if needed
        }

        const finalTotal = Math.max(0, rawSubtotal - discountAmount);

        setLocalTotalData({
            subtotal: rawSubtotal,
            discount: discountAmount,
            total: finalTotal,
            code: activeCode
        });

        console.log("--- MODAL CALCULATION ---");
        console.log("Subtotal:", rawSubtotal);
        console.log("Discount:", discountAmount);
        console.log("Final Total:", finalTotal);

    }, [isOpen, cartItems]);
    // ----------------------------------------------------

    const handlePurchase = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const finalPriceToSend = Math.round(localTotalData.total);

        // --- HARDCODE VERIFICATION ---
        console.log("--- ENVIANDO A MP ---");
        console.log("Monto Final:", finalPriceToSend);
        // alert(`ENVIANDO A MP: $${finalPriceToSend}`); // Uncomment to debug alert
        // -----------------------------

        try {

            // 1. Limpieza del precio (Usamos el calculado localmente)
            const unit_price = Math.round(localTotalData.total);
            const discount_clean = Math.round(localTotalData.discount);

            if (!unit_price || isNaN(unit_price) || unit_price < 0) throw new Error("Precio inválido");

            // --- VALIDACIÓN DE STOCK ---
            for (const item of cartItems) {
                // Determine table: Combos have 'products_json', Products don't
                const table = item.products_json ? 'combos' : 'products';

                const { data: itemData, error: stockError } = await supabase
                    .from(table)
                    .select('stock, name')
                    .eq('id', item.id)
                    .single();

                if (stockError) {
                    console.error(`Error verificando stock para ${item.name}:`, stockError);
                    throw new Error(`Error verificando stock del producto: ${item.name}`);
                }

                if (itemData.stock < item.quantity) {
                    throw new Error(`¡Lo sentimos! No hay suficiente stock para "${item.name}". Disponibles: ${itemData.stock}`);
                }
            }
            // ---------------------------

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

            // --- GOOGLE SHEETS INTEGRATION (NON-BLOCKING) ---
            const logToSheets = async () => {
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

                    console.log('--- ENVIANDO A GOOGLE SHEETS (BACKGROUND) ---');
                    await fetch(GOOGLE_SCRIPT_URL, {
                        method: 'POST',
                        mode: 'no-cors',
                        body: formData
                    });
                } catch (sheetErr) {
                    console.warn('Error en integración Google Sheets:', sheetErr);
                }
            };

            // Execute without awaiting
            logToSheets();
            // ---------------------------------

            // 4. Ir a Mercado Pago
            console.log('Iniciando checkout de Mercado Pago...');
            const { data, error: funcError } = await supabase.functions.invoke('create-checkout', {
                body: {
                    unit_price: unit_price,
                    title: `Pedido Home & Co - ${name}`,
                    quantity: 1,
                    payer: { email: email }
                }
            });

            if (funcError) {
                console.error('Error en Edge Function create-checkout:', funcError);
                throw new Error(`Error al crear preferencia de MP: ${funcError.message}`);
            }

            if (data?.url) {
                console.log('Redirigiendo a Mercado Pago:', data.url);
                window.location.href = data.url;
            } else {
                console.error('Respuesta de MP sin URL:', data);
                throw new Error("No se recibió la URL de pago de Mercado Pago.");
            }

        } catch (err) {
            console.error('Error crítico en el proceso de compra:', err);
            // Show specific error if it's a logic error (like stock), otherwise generic
            setError(err.message || 'Hubo un error al procesar. Intenta nuevamente.');
        } finally {
            if (error) setLoading(false);
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
                            <div className="mb-4 bg-gray-50 p-3 border border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 font-bold uppercase">Total a Pagar</span>
                                    <span className="font-display font-bold text-2xl text-brand-dark">
                                        {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(localTotalData.total)}
                                    </span>
                                </div>
                                {localTotalData.discount > 0 && (
                                    <div className="flex justify-between items-center mt-1 border-t border-gray-200 pt-1">
                                        <span className="text-[10px] text-green-600 font-bold uppercase flex items-center gap-1">
                                            <Lock size={10} /> Descuento aplicado ({localTotalData.code})
                                        </span>
                                        <span className="text-xs font-bold text-green-600">
                                            - {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(localTotalData.discount)}
                                        </span>
                                    </div>
                                )}
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
                                    {loading ? <Loader2 className="animate-spin" /> : "IR A PAGAR"}
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