import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Mountain, Award } from 'lucide-react';
import { brandInfo } from '../data/mockData';

export default function About() {
    return (
        <div className="pt-20 min-h-screen bg-brand-light">

            {/* Hero Text */}
            <div className="bg-brand-dark text-white py-24 md:py-32">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="block font-bold text-brand-accent uppercase tracking-widest mb-4"
                    >
                        {brandInfo.origin}
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-display font-bold text-5xl md:text-7xl uppercase leading-none mb-8"
                    >
                        {brandInfo.story_title}
                    </motion.h1>
                </div>
            </div>

            {/* Story Content */}
            <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
                <p className="text-xl md:text-2xl text-gray-800 leading-relaxed font-light text-center mb-20">
                    {brandInfo.story_text}
                </p>

                {/* Values Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {brandInfo.values.map((val, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center">
                            <div className="mb-6 p-4 bg-white rounded-full shadow-lg">
                                {val.icon === 'ShieldCheck' && <ShieldCheck size={40} />}
                                {val.icon === 'Mountain' && <Mountain size={40} />}
                                {val.icon === 'Award' && <Award size={40} />}
                            </div>
                            <h3 className="font-display font-bold text-xl uppercase mb-2">{val.title}</h3>
                            <div className="h-1 w-12 bg-black"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Visual Break */}
            <div className="h-96 md:h-[500px] bg-gray-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gray-800">
                    <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-60 mix-blend-overlay" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <h2 className="font-display font-bold text-white text-6xl md:text-8xl opacity-20 uppercase tracking-tighter">
                        Since 2024
                    </h2>
                </div>
            </div>

        </div>
    );
}
