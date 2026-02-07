import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Solo transparente en la home
    const isHome = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Estilos dinámicos según scroll y ubicación
    const navBackground = isHome && !isScrolled
        ? 'bg-transparent text-white'
        : 'bg-white text-brand-dark shadow-md';

    const linkHover = isHome && !isScrolled
        ? 'hover:text-brand-accent'
        : 'hover:text-brand-accent';

    const iconColor = isHome && !isScrolled ? 'text-white' : 'text-brand-dark';

    const links = [
        { name: 'Mates', path: '/catalog?category=Mates' },
        { name: 'Hidratación', path: '/catalog?category=Hidratación' },
        { name: 'Coolers', path: '/catalog?category=Coolers' },
        { name: 'Nosotros', path: '/about' },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBackground}`}>
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* 1. LOGO */}
                    <Link to="/" className="font-display font-bold text-3xl tracking-tighter z-50">
                        HOME & CO
                    </Link>

                    {/* 2. MENU DESKTOP (Links + Botón + Carrito) */}
                    <div className="hidden md:flex items-center space-x-8">
                        {/* Links */}
                        {links.map((link) => (
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

                        {/* Carrito Desktop */}
                        <Link to="/cart" className={`transition-colors ${linkHover}`}>
                            <ShoppingCart size={24} />
                        </Link>
                    </div>

                    {/* 3. CONTROLES MOBILE (Carrito + Hamburguesa) */}
                    <div className="md:hidden flex items-center gap-4 z-50">
                        {/* Carrito visible en Mobile también */}
                        <Link to="/cart" className={iconColor}>
                            <ShoppingCart size={24} />
                        </Link>

                        {/* Botón Hamburguesa */}
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
                        animate={{ opacity: 1, height: '100vh' }} // Pantalla completa para mejor UX
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden absolute top-0 left-0 w-full bg-brand-dark text-white overflow-hidden flex flex-col pt-24 px-8"
                    >
                        <div className="flex flex-col space-y-6">
                            {links.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="font-display font-bold text-2xl uppercase tracking-wider hover:text-brand-accent border-b border-gray-700 pb-2"
                                >
                                    {link.name}
                                </Link>
                            ))}

                            {/* El botón de acción también en el menú móvil */}
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