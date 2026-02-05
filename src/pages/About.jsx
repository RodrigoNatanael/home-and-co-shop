import React from 'react';
import { motion } from 'framer-motion';

export default function About() {
    return (
        <div className="pt-20 min-h-screen bg-brand-light">
            <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="font-display font-bold text-4xl md:text-5xl uppercase mb-6">Tu casa, tu estilo.</h1>
                    <div className="w-24 h-1 bg-black mx-auto"></div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg md:text-xl text-gray-700 leading-relaxed text-center space-y-6"
                >
                    <p>
                        Home & Co nació para que cada rincón de tu hogar refleje quién sos.
                        Empezamos con los vasos virales que todos buscaban en Mendoza y hoy somos tu aliado
                        para encontrar esas tendencias en deco y lifestyle que hacen tu vida más cómoda.
                    </p>
                    <p>
                        No solo vendemos productos, seleccionamos piezas que transforman tu rutina.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
