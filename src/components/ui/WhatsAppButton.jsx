import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
    const WHATSAPP_NUMBER = '5492617523156';
    const message = "Hola! Tengo una consulta sobre Home & Co.";
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#20bd5a] transition-all hover:scale-110 flex items-center justify-center cursor-pointer"
            aria-label="Contactar por WhatsApp"
        >
            <MessageCircle size={32} fill="white" className="text-white" />
        </a>
    );
}
