import React from 'react';
import { Truck } from 'lucide-react';

export default function Shipping() {
    return (
        <div className="pt-20 min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-4 py-16">
                <h1 className="text-3xl font-bold mb-8 uppercase">Envíos y Devoluciones</h1>

                <div className="space-y-8">
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <Truck className="text-brand-main" />
                            <h2 className="text-xl font-bold">Promesa Central</h2>
                        </div>
                        <p className="font-medium text-lg text-brand-main">Envío GRATIS en Gran Mendoza - ¡Lo recibís en el día!</p>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-2">Detalle</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Si estás en Ciudad, Godoy Cruz, Guaymallén, Las Heras, Luján de Cuyo o Maipú,
                            tu pedido llega hoy mismo sin costo adicional.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-2">Resto del País</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Despachamos a toda Argentina en menos de 24 horas hábiles.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
