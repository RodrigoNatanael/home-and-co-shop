import React from 'react';
import { Link } from 'react-router-dom';
import { Check, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function Success() {
    return (
        <div className="min-h-screen bg-brand-light flex items-center justify-center p-8 pt-20">
            <div className="text-center max-w-lg">
                <div className="bg-brand-dark text-white w-20 h-20 rounded-none flex items-center justify-center mx-auto mb-8 shadow-2xl">
                    <Check size={40} strokeWidth={3} />
                </div>

                <h1 className="font-display font-bold text-5xl md:text-6xl text-brand-dark uppercase mb-4 leading-none">
                    ¡Compra Exitosa!
                </h1>

                <p className="text-xl text-gray-600 mb-12 font-light">
                    Tu aventura está por comenzar. Te enviamos un email con los detalles de tu pedido.
                </p>

                {/* WhatsApp Button */}
                {(() => {
                    const savedInfo = localStorage.getItem('latest_purchase_info');
                    let whatsappLink = "https://wa.me/5492617523156"; // Fallback URL

                    if (savedInfo) {
                        try {
                            const { name, amount } = JSON.parse(savedInfo);
                            const text = `Hola! Acabo de realizar una compra en Home & Co por ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount)}. Mi nombre es ${name} y este es mi comprobante.`;
                            whatsappLink = `https://wa.me/5492617523156?text=${encodeURIComponent(text)}`;
                        } catch (e) {
                            console.error("Error parsing purchase info", e);
                        }
                    }

                    return (
                        <div className="flex flex-col gap-4 justify-center items-center">
                            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                                <Button variant="primary" size="lg" className="bg-[#25D366] hover:bg-[#128C7E] border-none text-white shadow-lg animate-bounce">
                                    <MessageCircle className="mr-2" /> ¡LISTO! NOTIFICAR POR WHATSAPP
                                </Button>
                            </a>
                            <Link to="/" className="text-gray-400 hover:text-gray-600 underline text-sm">
                                Volver al inicio
                            </Link>
                        </div>
                    );
                })()}
            </div>
        </div>
    )
}
