import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { supabase } from '../../supabaseclient';

export default function BannerCarousel() {
    const [banners, setBanners] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            const { data, error } = await supabase
                .from('banners')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching banners:', error);
            } else {
                setBanners(data || []);
            }
            setLoading(false);
        };

        fetchBanners();
    }, []);

    // Auto-play
    useEffect(() => {
        if (banners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000); // 5 seconds per slide

        return () => clearInterval(interval);
    }, [banners.length]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    };

    if (loading) {
        return <div className="h-[85vh] bg-gray-900 animate-pulse" />;
    }

    // Fallback if no banners
    if (banners.length === 0) {
        return (
            <section className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden bg-gray-900 text-white">
                <div className="absolute inset-0 z-0 opacity-60">
                    <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1533240332313-0dbdd31c16ca?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center" />
                </div>
                <div className="absolute inset-0 bg-black/40 z-0" />
                <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                    <h1 className="font-display font-bold text-5xl md:text-7xl lg:text-8xl tracking-tighter uppercase mb-6">
                        DISEÑADO PARA LA<br />AVENTURA EN MENDOZA
                    </h1>
                    <Link to="/catalog">
                        <Button size="lg" variant="primary" className="border-white bg-white text-black hover:bg-transparent hover:text-white">
                            COMPRAR AHORA
                        </Button>
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="relative h-[85vh] w-full overflow-hidden bg-gray-900 group">
            <AnimatePresence initial={false} mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src={banners[currentIndex].image_url}
                            alt={banners[currentIndex].title}
                            className="w-full h-full object-cover opacity-60"
                        />
                    </div>
                    <div className="absolute inset-0 bg-black/40 z-0" />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 max-w-5xl mx-auto text-white">
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="font-display font-bold text-5xl md:text-7xl lg:text-8xl tracking-tighter uppercase mb-6"
                        >
                            {banners[currentIndex].title}
                        </motion.h1>

                        {banners[currentIndex].link && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            >
                                <Link to={banners[currentIndex].link}>
                                    <Button size="lg" variant="primary" className="border-white bg-white text-black hover:bg-transparent hover:text-white">
                                        VER MÁS
                                    </Button>
                                </Link>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Controls (only if > 1 banner) */}
            {banners.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 text-white rounded-full hover:bg-black/50 transition-colors hidden md:block"
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 text-white rounded-full hover:bg-black/50 transition-colors hidden md:block"
                    >
                        <ChevronRight size={32} />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
