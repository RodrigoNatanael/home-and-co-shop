import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, ShieldCheck, Thermometer } from 'lucide-react';
import { supabase } from '../supabaseclient';
import ProductCard from '../components/ProductCard';
import BannerCarousel from '../components/ui/BannerCarousel';
import ComboCard from '../components/ui/ComboCard';
import { Button } from '../components/ui/Button';

export default function Home() {
    const [config, setConfig] = useState({
        hero_video_url: '',
        cat1_img: '',
        cat1_link: '',
        cat1_title: '',
        cat2_img: '',
        cat2_link: '',
        cat2_title: '',
        cat3_img: '',
        cat3_link: '',
        cat3_title: ''
    });

    // --- RESTORED MISSING STATE ---
    const [products, setProducts] = useState([]);
    const [combos, setCombos] = useState([]);

    useEffect(() => {
        const fetchConfig = async () => {
            const { data, error } = await supabase.from('site_config').select('*');
            if (data) {
                const newConfig = { ...config };
                data.forEach(item => {
                    // Support both 'key' and 'id' columns
                    const configKey = item.key || item.id;
                    if (configKey) {
                        newConfig[configKey] = item.value;
                    }
                });
                console.log("Config de diseño cargada:", newConfig); // Debug Log
                setConfig(newConfig);
            }
        };

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

        const fetchCombos = async () => {
            const { data, error } = await supabase
                .from('combos')
                .select('*');

            if (error) {
                console.error('Error fetching combos:', error);
            } else {
                setCombos(data || []);
            }
        };

        fetchConfig();
        fetchProducts();
        fetchCombos();
    }, []);

    // Filter featured products (e.g., first 3)
    const featuredProducts = products.slice(0, 3);

    return (
        <div className="min-h-screen bg-brand-light">
            {/* Hero Section: Video or Carousel */}
            {config?.hero_video_url ? (
                <div className="relative w-full h-[80vh] md:h-screen overflow-hidden">
                    <video
                        className="absolute inset-0 w-full h-full object-cover"
                        src={config?.hero_video_url}
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster="https://images.unsplash.com/photo-1616422838323-95e263c9b78e?q=80&w=1780&auto=format&fit=crop"
                        style={{ pointerEvents: 'none' }}
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
                        <div className="text-center text-white p-4">
                            <h1 className="font-display font-bold text-5xl md:text-7xl mb-6 tracking-tight drop-shadow-xl">
                                HOME & CO
                            </h1>
                            <Link to="/catalog">
                                <Button variant="primary" size="lg" className="bg-white text-brand-dark hover:bg-gray-100 border-none shadow-xl transform hover:scale-105 transition-transform">
                                    COMPRAR AHORA <ArrowRight className="ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <BannerCarousel />
            )}

            {/* Featured Categories (Dynamic Video - Background Only) */}
            <section className="py-0">
                <div className="grid grid-cols-1 md:grid-cols-3">
                    {/* Category 1 */}
                    <Link to={config?.cat1_link || '/catalog'} className="group relative h-[500px] block overflow-hidden">
                        {/* Background Video Layer (Z-0) */}
                        <div className="absolute inset-0 z-0 bg-gray-900">
                            {config?.cat1_img ? (
                                <video
                                    src={config.cat1_img}
                                    className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                                    autoPlay loop muted playsInline
                                    style={{ pointerEvents: 'none' }}
                                />
                            ) : (
                                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1616422838323-95e263c9b78e?q=80&w=1780&auto=format&fit=crop')] bg-cover bg-center opacity-70" />
                            )}
                        </div>

                        {/* Gradient Overlay Layer (Z-10) */}
                        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none transition-opacity" />

                        {/* Content Layer (Z-20) */}
                        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                            <h2 className="font-display font-bold text-4xl text-white tracking-wide uppercase border-b-4 border-transparent group-hover:border-white transition-all pb-2 drop-shadow-2xl">
                                {config?.cat1_title || 'Mates'}
                            </h2>
                        </div>
                    </Link>

                    {/* Category 2 */}
                    <Link to={config?.cat2_link || '/catalog'} className="group relative h-[500px] block overflow-hidden">
                        {/* Background Video Layer (Z-0) */}
                        <div className="absolute inset-0 z-0 bg-gray-900">
                            {config?.cat2_img ? (
                                <video
                                    src={config.cat2_img}
                                    className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                                    autoPlay loop muted playsInline
                                    style={{ pointerEvents: 'none' }}
                                />
                            ) : (
                                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1605152276897-4f618f831968?q=80&w=1780&auto=format&fit=crop')] bg-cover bg-center opacity-70" />
                            )}
                        </div>

                        {/* Gradient Overlay Layer (Z-10) */}
                        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none transition-opacity" />

                        {/* Content Layer (Z-20) */}
                        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                            <h2 className="font-display font-bold text-4xl text-white tracking-wide uppercase border-b-4 border-transparent group-hover:border-white transition-all pb-2 drop-shadow-2xl">
                                {config?.cat2_title || 'Hidratación'}
                            </h2>
                        </div>
                    </Link>

                    {/* Category 3 */}
                    <Link to={config?.cat3_link || '/catalog'} className="group relative h-[500px] block overflow-hidden">
                        {/* Background Video Layer (Z-0) */}
                        <div className="absolute inset-0 z-0 bg-gray-900">
                            {config?.cat3_img ? (
                                <video
                                    src={config.cat3_img}
                                    className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                                    autoPlay loop muted playsInline
                                    style={{ pointerEvents: 'none' }}
                                />
                            ) : (
                                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1780&auto=format&fit=crop')] bg-cover bg-center opacity-70" />
                            )}
                        </div>

                        {/* Gradient Overlay Layer (Z-10) */}
                        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none transition-opacity" />

                        {/* Content Layer (Z-20) */}
                        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                            <h2 className="font-display font-bold text-4xl text-white tracking-wide uppercase border-b-4 border-transparent group-hover:border-white transition-all pb-2 drop-shadow-2xl">
                                {config?.cat3_title || 'Coolers'}
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
            <section id="featured-products" className="py-20 max-w-7xl mx-auto px-4 md:px-8">
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

            {/* Combos Section */}
            {combos.length > 0 && (
                <section className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 md:px-8">
                        <h2 className="font-display font-bold text-4xl text-brand-dark mb-12 text-center uppercase tracking-tight">Ofertas de Combos</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {combos.map(combo => (
                                <ComboCard key={combo.id} combo={combo} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
