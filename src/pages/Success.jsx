import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, MessageCircle, ShoppingBag, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';

export default function Success() {
    const [searchParams] = useSearchParams();
    const [paymentId, setPaymentId] = useState(null);

    useEffect(() => {
        // Capturamos el ID que manda Mercado Pago por URL
        const id = searchParams.get('payment_id');
        if (id) setPaymentId(id);

        // Limpieza opcional del carrito aquí si fuera necesario
    }, [searchParams]);

    // --- LÓGICA DE WHATSAPP RECUPERADA Y MEJORADA ---
    const getWhatsAppContent = () => {
        const savedInfo = localStorage.getItem('latest_purchase_info');
        const fallbackLink = "https://wa.me/5492617523156";

        if (!savedInfo) return {
            link: fallbackLink,
            text: "NOTIFICAR POR WHATSAPP"
        };

        try {
            const { name, amount } = JSON.parse(savedInfo);
            const formattedAmount = new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
                maximumFractionDigits: 0
            }).format(amount);

            const message = `¡Hola Home & Co! 👋 Acabo de realizar una compra.\n\n👤 *Nombre:* ${name}\n💰 *Monto:* ${formattedAmount}\n🆔 *Pago ID:* ${paymentId || 'Ver adjunto'}\n\nAquí les envío mi comprobante.`;

            return {
                link: `https://wa.me/5492617523156?text=${encodeURIComponent(message)}`,
                name: name,
                amount: formattedAmount
            };
        } catch (e) {
            console.error("Error parsing purchase info", e);
            return { link: fallbackLink };
        }
    };

    const whatsappData = getWhatsAppContent();

    return (
        <div className="min-h-screen bg-brand-light flex items-center justify-center p-6 pt-20 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-lg w-full bg-white rounded-[40px] shadow-2xl p-10 text-center border border-gray-100 relative overflow-hidden"
            >
                {/* DECORACIÓN FONDO */}
                <div className="absolute top-0 left-0 w-full h-2 bg-brand-dark opacity-10"></div>

                {/* ICONO ACEITADO (Tu estilo original mejorado) */}
                <div className="bg-brand-dark text-white w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl transform -rotate-3">
                    <Check size={48} strokeWidth={3} />
                </div>

                <h1 className="font-display font-bold text-5xl md:text-6xl text-brand-dark uppercase mb-4 leading-none tracking-tighter">
                    ¡Compra Exitosa!
                </h1>

                <p className="text-lg text-gray-500 mb-8 font-light leading-relaxed">
                    ¡Excelente elección, <span className="font-bold text-gray-800">{whatsappData.name || 'Mate Amigo'}</span>! 🧉<br />
                    Tu aventura está por comenzar. Te enviamos un email con los detalles.
                </p>

                {/* TARJETA DE RESUMEN TÉCNICO */}
                <div className="bg-gray-50 rounded-3xl p-6 mb-10 border border-gray-100 flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID Operación</span>
                        <span className="text-sm font-mono font-bold text-brand-dark">{paymentId || 'Procesando...'}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Abonado</span>
                        <span className="text-lg font-black text-brand-dark">{whatsappData.amount || '--'}</span>
                    </div>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="flex flex-col gap-4">
                    <a href={whatsappData.link} target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full bg-[#25D366] hover:bg-[#128C7E] border-none text-white shadow-xl py-6 rounded-2xl flex items-center justify-center gap-3 animate-bounce hover:animate-none transition-all"
                        >
                            <MessageCircle size={22} />
                            <span className="font-black tracking-widest">¡LISTO! NOTIFICAR WHATSAPP</span>
                        </Button>
                    </a>

                    <div className="flex flex-col gap-2">
                        <Link to="/" className="group flex items-center justify-center gap-2 text-gray-400 hover:text-brand-dark font-bold text-xs uppercase tracking-widest transition-colors">
                            <ShoppingBag size={14} />
                            Volver al inicio
                        </Link>
                    </div>
                </div>

                {/* PIE DE SEGURIDAD */}
                <div className="mt-10 pt-6 border-t border-gray-50 flex justify-center items-center gap-2 opacity-30">
                    <div className="h-[1px] w-8 bg-gray-400"></div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Home & Co Secure Checkout</span>
                    <div className="h-[1px] w-8 bg-gray-400"></div>
                </div>
            </motion.div>
        </div>
    );
}