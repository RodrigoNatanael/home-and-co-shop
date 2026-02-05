import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Truck, MessageCircle } from 'lucide-react'

export default function Hero() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-4 md:grid-rows-2 gap-4 h-auto md:h-[500px] mb-12">

            {/* Block 1: Main Product (2x2) */}
            <motion.div
                className="col-span-1 md:col-span-2 md:row-span-2 bg-slate-900 rounded-4xl p-8 flex flex-col justify-between relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="z-10 relative">
                    <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">Destacado</span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 leading-tight">
                        Vaso Térmico<br />
                        <span className="text-brand-accent">XL 900ml</span>
                    </h2>
                    <p className="text-slate-300 mt-2 max-w-sm">
                        Frío por +12hs. El compañero ideal para el verano mendocino.
                    </p>
                </div>

                {/* Decorative Circle */}
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-brand-accent/20 rounded-full blur-3xl"></div>

                <button className="mt-8 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold w-fit hover:bg-slate-100 transition-colors z-10">
                    Ver Producto
                </button>
            </motion.div>

            {/* Block 2: Envío Gratis (Vertical) */}
            <motion.div
                className="col-span-1 md:col-span-1 md:row-span-2 bg-brand-accent rounded-4xl p-6 flex flex-col items-center justify-center text-center text-white relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <div className="bg-white/20 p-4 rounded-full mb-4">
                    <Truck size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2">Envío Gratis</h3>
                <p className="text-white/90 text-sm">En todo el Gran Mendoza por compras superiores a $50.000</p>
            </motion.div>

            {/* Block 3: Security (Small) */}
            <motion.div
                className="col-span-1 md:col-span-1 md:row-span-1 bg-white border border-slate-100 rounded-4xl p-6 flex flex-col justify-center shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <ShieldCheck className="text-brand-main mb-2" size={28} />
                <h3 className="font-bold text-slate-800">Compra Segura</h3>
                <p className="text-xs text-slate-500">Procesado por Mercado Pago</p>
            </motion.div>

            {/* Block 4: WhatsApp (Small) */}
            <motion.a
                href="https://wa.me/5492617523156"
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-1 md:col-span-1 md:row-span-1 bg-[#25D366] rounded-4xl p-6 flex items-center justify-between text-white hover:bg-[#20bd5a] transition-colors cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <div>
                    <h3 className="font-bold">¿Dudas?</h3>
                    <p className="text-xs text-white/90">Escribinos</p>
                </div>
                <MessageCircle size={32} />
            </motion.a>

        </div>
    )
}
