import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, ShieldCheck, Thermometer } from 'lucide-react';
import { supabase } from '../supabaseclient';
import ProductCard from '../components/ProductCard';
import BannerCarousel from '../components/ui/BannerCarousel';
import { ComboCard } from '../components/ui/ComboCard';
import { Button } from '../components/ui/Button';

export default function Home() {
    // --- ESTADOS ---
    const [config, setConfig] = useState({});
    const [categories, setCategories] = useState([]); // NUEVO: Categorías dinámicas
    const [products, setProducts] = useState([]);
    const [combos, setCombos] = useState([]);

    useEffect(() => {
        // 1. Cargar Configuración General (Hero video, etc)
        const fetchConfig = async () => {
            const { data } = await supabase.from('site_config').select('*');
            if (data) {
                const newConfig = {};
                data.forEach(item => newConfig[item.id] = item.value);
                setConfig(newConfig);
            }
        };

        // 2. NUEVO: Cargar Categorías Dinámicas
        const fetchCategories = async () => {
            const { data } = await supabase
                .from('categories')
                .select('*')
                .order('name'); // Orden alfabético o por fecha
            if (data) setCategories(data);
        };

        // 3. Cargar Productos
        const fetchProducts = async () => {
            const { data } = await supabase.from('products').select('*');
            if (data) setProducts(data);
        };

        // 4. Cargar Combos
        const fetchCombos = async () => {
            const { data } = await supabase.from('combos').select('*');
            if (data) setCombos(data);
        };

        fetchConfig();
        fetchCategories();
        fetchProducts();
        fetchCombos();
    }, []);

    // Productos destacados (ej: los primeros 3)
    const featuredProducts = products.slice(0, 3);

    return (
        <div className="min-h-screen bg-white transition-colors">

            {/* --- HERO SECTION --- */}
            {config?.hero_video_url ? (
                <div className="relative w-full h-[80vh] md:h-screen overflow-hidden">
                    <video
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                        src={config.hero_video_url}
                        autoPlay loop muted playsInline
                        poster="https://images.unsplash.com/photo-1616422838323-95e263c9b78e?q=80&w=1780&auto=format&fit=crop"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
                        <div className="text-center text-white p-4">
                            <h1 className="font-display font-black italic text-5xl md:text-7xl mb-6 tracking-tight drop-shadow-xl uppercase">
                                HOME & CO
                            </h1>
                            <Link to="/catalog">
                                <Button size="lg" className="bg-white text-black hover:bg-gray-100 border-none shadow-xl transform hover:scale-105 transition-all font-black uppercase tracking-widest px-8">
                                    COMPRAR AHORA <ArrowRight className="ml-2" size={18} />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <BannerCarousel />
            )}

            {/* --- SECCIÓN CATEGORÍAS (DINÁMICA) --- */}
            <section className="py-0 bg-black">
                {/* Grid adaptable: 1 col móvil, 2 tablet, 3 desktop (si hay muchas) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full">
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            to={`/catalog?category=${encodeURIComponent(cat.name)}`}
                            className="group relative h-[500px] block overflow-hidden bg-gray-900 border-r border-b border-gray-800"
                        >
                            {/* VIDEO / IMAGEN DE FONDO */}
                            <div className="absolute inset-0 z-0">
                                {cat.video_url ? (
                                    <video
                                        src={cat.video_url}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80"
                                        autoPlay loop muted playsInline
                                        style={{ pointerEvents: 'none' }}
                                    />
                                ) : (
                                    // Fallback: Fondo gris si no hay video
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center transition-colors group-hover:bg-gray-700 opacity-50" />
                                )}
                            </div>

                            {/* TEXTO DE CATEGORÍA */}
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4">
                                <h2 className="font-display font-black italic text-4xl md:text-5xl text-white uppercase tracking-tighter text-center mb-4 drop-shadow-2xl">
                                    {cat.name}
                                </h2>
                                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white border border-white/30 px-4 py-2 rounded-full backdrop-blur-sm group-hover:bg-white group-hover:text-black transition-all">
                                    EXPLORAR <ArrowRight size={14} />
                                </span>
                            </div>

                            {/* Overlay degradado */}
                            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                        </Link>
                    ))}
                </div>
            </section>

            {/* --- TRUST BADGES --- */}
            <section className="bg-white border-y border-gray-100 py-16">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="flex flex-col items-center group">
                            <Truck size={40} className="mb-4 text-black group-hover:scale-110 transition-transform" />
                            <h3 className="font-bold uppercase tracking-widest text-sm mb-2">Envíos a todo el país</h3>
                            <p className="text-gray-400 text-xs max-w-xs">Llevamos la aventura a tu puerta, estés donde estés.</p>
                        </div>
                        <div className="flex flex-col items-center group">
                            <ShieldCheck size={40} className="mb-4 text-black group-hover:scale-110 transition-transform" />
                            <h3 className="font-bold uppercase tracking-widest text-sm mb-2">Compra Protegida</h3>
                            <p className="text-gray-400 text-xs max-w-xs">Tu satisfacción es nuestra prioridad absoluta.</p>
                        </div>
                        <div className="flex flex-col items-center group">
                            <Thermometer size={40} className="mb-4 text-black group-hover:scale-110 transition-transform" />
                            <h3 className="font-bold uppercase tracking-widest text-sm mb-2">Calidad Premium</h3>
                            <p className="text-gray-400 text-xs max-w-xs">Materiales seleccionados para durar toda la vida.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- DESTACADOS --- */}
            <section id="featured-products" className="py-20 max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex justify-between items-end mb-12 border-b border-gray-100 pb-4">
                    <h2 className="font-display font-black italic text-4xl text-black uppercase tracking-tighter">DESTACADOS</h2>
                    <Link to="/catalog" className="text-black font-bold text-xs uppercase tracking-widest hover:text-gray-500 transition-colors flex items-center gap-2">
                        Ver Todo <ArrowRight size={14} />
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {featuredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>

            {/* --- COMBOS --- */}
            {combos.length > 0 && (
                <section className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 md:px-8">
                        <h2 className="font-display font-black italic text-4xl text-black mb-12 text-center uppercase tracking-tighter">
                            COMBOS IMPERDIBLES
                        </h2>
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