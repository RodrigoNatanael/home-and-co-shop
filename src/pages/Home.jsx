import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, ShieldCheck, Thermometer } from 'lucide-react';
import { supabase } from '../supabaseClient';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/Button';

export default function Home() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*, image_url');

            if (error) {
                console.error('Error fetching products:', error);
            } else {
                setProducts(data || []);
            }
        };

        fetchProducts();
    }, []);

    // Filter featured products (e.g., first 3)
    const featuredProducts = products.slice(0, 3);

    return (
        <div className="min-h-screen bg-brand-light">
            {/* Hero Section */}
            <section className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden bg-gray-900 text-white">
                {/* Background Image / Overlay */}
                <div className="absolute inset-0 z-0 opacity-60">
                    {/* Placeholder for video/image */}
                    <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1533240332313-0dbdd31c16ca?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center" />
                </div>
                <div className="absolute inset-0 bg-black/40 z-0" />

                {/* Content */}
                <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="font-display font-bold text-5xl md:text-7xl lg:text-8xl tracking-tighter uppercase mb-6"
                    >
                        DISEÑADO PARA LA<br />AVENTURA EN MENDOZA
                    </motion.h1>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <Link to="/catalog">
                            <Button size="lg" variant="primary" className="border-white bg-white text-black hover:bg-transparent hover:text-white">
                                COMPRAR AHORA
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Featured Categories (Lifestyle Strips) */}
            <section className="py-0">
                <div className="grid grid-cols-1 md:grid-cols-3">
                    {/* Category 1: Mates */}
                    <Link to="/catalog?category=Mates" className="group relative h-96 overflow-hidden">
                        <div className="absolute inset-0 bg-gray-800 transition-transform duration-700 group-hover:scale-105">
                            {/* Placeholder Img */}
                            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1616422838323-95e263c9b78e?q=80&w=1780&auto=format&fit=crop')] bg-cover bg-center opacity-70 group-hover:opacity-60 transition-opacity" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <h2 className="font-display font-bold text-4xl text-white tracking-wide uppercase border-b-4 border-transparent group-hover:border-white transition-all pb-2">
                                Mates
                            </h2>
                        </div>
                    </Link>

                    {/* Category 2: Hidratación */}
                    <Link to="/catalog?category=Hidratación" className="group relative h-96 overflow-hidden">
                        <div className="absolute inset-0 bg-gray-800 transition-transform duration-700 group-hover:scale-105">
                            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1605152276897-4f618f831968?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-70 group-hover:opacity-60 transition-opacity" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <h2 className="font-display font-bold text-4xl text-white tracking-wide uppercase border-b-4 border-transparent group-hover:border-white transition-all pb-2">
                                Hidratación
                            </h2>
                        </div>
                    </Link>

                    {/* Category 3: Coolers */}
                    <Link to="/catalog?category=Coolers" className="group relative h-96 overflow-hidden">
                        <div className="absolute inset-0 bg-gray-800 transition-transform duration-700 group-hover:scale-105">
                            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-70 group-hover:opacity-60 transition-opacity" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <h2 className="font-display font-bold text-4xl text-white tracking-wide uppercase border-b-4 border-transparent group-hover:border-white transition-all pb-2">
                                Coolers
                            </h2>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Trust Section */}
            <section className="bg-white border-y border-gray-200 py-16">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="flex flex-col items-center">
                            <Truck size={48} strokeWidth={1} className="mb-4 text-brand-dark" />
                            <h3 className="font-display font-bold text-xl mb-2">Envíos a todo el país</h3>
                            <p className="text-gray-500 max-w-xs">Llevamos la aventura a tu puerta, estés donde estés.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <Thermometer size={48} strokeWidth={1} className="mb-4 text-brand-dark" />
                            <h3 className="font-display font-bold text-xl mb-2">Tecnología Térmica</h3>
                            <p className="text-gray-500 max-w-xs">Aislamiento de doble pared para máxima retención de temperatura.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <ShieldCheck size={48} strokeWidth={1} className="mb-4 text-brand-dark" />
                            <h3 className="font-display font-bold text-xl mb-2">Garantía de Calidad</h3>
                            <p className="text-gray-500 max-w-xs">Productos probados en las condiciones más exigentes.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products Grid */}
            <section className="py-20 max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex justify-between items-end mb-12">
                    <h2 className="font-display font-bold text-4xl text-brand-dark">DESTACADOS</h2>
                    <Link to="/catalog" className="text-brand-dark font-bold border-b-2 border-brand-dark uppercase tracking-widest hover:text-gray-600 hover:border-gray-600 transition-colors">
                        Ver Todo
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {featuredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>
        </div>
    );
}
