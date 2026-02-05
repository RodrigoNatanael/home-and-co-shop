import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-brand-dark text-white py-16">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <h2 className="font-display font-bold text-3xl mb-6">HOME & CO</h2>
                        <p className="text-gray-400 max-w-sm mb-6">
                            Equipamiento premium para la aventura. Nacidos al pie de los Andes, diseñados para resistir todo.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram /></a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors"><Facebook /></a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors"><Mail /></a>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-display font-bold text-lg mb-6 tracking-wide">NAVEGACIÓN</h3>
                        <ul className="space-y-4">
                            <li><Link to="/catalog" className="text-gray-400 hover:text-white transition-colors">Productos</Link></li>
                            <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">Nosotros</Link></li>
                            <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contacto</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-display font-bold text-lg mb-6 tracking-wide">LEGAL</h3>
                        <ul className="space-y-4">
                            <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Términos y Condiciones</Link></li>
                            <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Política de Privacidad</Link></li>
                            <li><Link to="/shipping" className="text-gray-400 hover:text-white transition-colors">Envíos y Devoluciones</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} Home & Co. Todos los derechos reservados.</p>
                    <p className="mt-2 md:mt-0">Mendoza, Argentina.</p>
                </div>
            </div>
        </footer>
    );
}
