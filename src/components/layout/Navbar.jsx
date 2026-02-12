import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabaseclient';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState([]); // 2. Estado para categorías

    const location = useLocation();
    const { totalItems } = useCart(); // (Opcional) Badge del carrito

    // Solo transparente en la home
    const isHome = location.pathname === '/';

    // 3. FETCH DE CATEGORÍAS (Lógica Nueva)
    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase
                .from('categories')
                .select('name')
                .order('name');

            if (data) {
                // Transformamos los datos de Supabase al formato que usa tu Navbar
                const dynamicLinks = data.map(cat => ({
                    name: cat.name,
                    path: `/catalog?category=${encodeURIComponent(cat.name)}`
                }));
                // Agregamos "Nosotros" al final
                setCategories([...dynamicLinks, { name: 'Nosotros', path: '/about' }]);
            }
        };

        fetchCategories();

        // Lógica de Scroll original
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Estilos dinámicos según scroll y ubicación (Lógica Original)
    const navBackground = isHome && !isScrolled
        ? 'bg-transparent text-white'
        : 'bg-white text-brand-dark shadow-md';

    const linkHover = isHome && !isScrolled
        ? 'hover:text-brand-accent'
        : 'hover:text-brand-accent';

    const iconColor = isHome && !isScrolled ? 'text-white' : 'text-brand-dark';

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBackground}`}>
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* 1. LOGO */}
                    <Link to="/" className="font-display font-bold text-3xl tracking-tighter z-50">
                        HOME & CO
                    </Link>

                    {/* 2. MENU DESKTOP */}
                    <div className="hidden md:flex items-center space-x-8">
                        {/* Links Dinámicos */}
                        {categories.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`font-display font-bold uppercase tracking-wider text-sm transition-colors ${linkHover}`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {/* Botón WhatsApp */}
                        <a
                            href="https://wa.me/5492617523156?text=Hola! Quiero ver el catálogo actualizado de Home & Co"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-brand-accent text-white px-4 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform"
                        >
                            PEDIR CATÁLOGO
                        </a>

                        {/* Carrito Desktop con Badge */}
                        <Link to="/cart" className={`transition-colors relative ${linkHover}`}>
                            <ShoppingCart size={24} />
                            {/* Badge rojo si hay items (Opcional) */}
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* 3. CONTROLES MOBILE */}
                    <div className="md:hidden flex items-center gap-4 z-50">
                        <Link to="/cart" className={`${iconColor} relative`}>
                            <ShoppingCart size={24} />
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                                    {totalItems}
                                </span>
                            )}
                        </Link>

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={iconColor}
                        >
                            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* 4. MENU MOBILE DESPLEGABLE */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: '100vh' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden absolute top-0 left-0 w-full bg-brand-dark text-white overflow-hidden flex flex-col pt-24 px-8"
                    >
                        <div className="flex flex-col space-y-6">
                            {/* Links Dinámicos en Mobile */}
                            {categories.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="font-display font-bold text-2xl uppercase tracking-wider hover:text-brand-accent border-b border-gray-700 pb-2"
                                >
                                    {link.name}
                                </Link>
                            ))}

                            <a
                                href="https://wa.me/5492617523156?text=Hola! Quiero ver el catálogo actualizado de Home & Co"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-brand-accent text-white text-center py-3 rounded-full font-bold text-lg mt-4"
                            >
                                PEDIR CATÁLOGO 📲
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}