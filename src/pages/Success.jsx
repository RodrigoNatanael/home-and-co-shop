import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
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

                <Link to="/">
                    <Button variant="primary" size="lg">
                        VOLVER AL INICIO
                    </Button>
                </Link>
            </div>
        </div>
    )
}
