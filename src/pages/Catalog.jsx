import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import { products } from '../data/mockData';
import ProductCard from '../components/ProductCard';

export default function Catalog() {
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');

    // State for filters
    const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'Todos');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Derived state for filtered products
    const filteredProducts = selectedCategory === 'Todos'
        ? products
        : products.filter(p => p.category === selectedCategory);

    // Extract unique categories
    const categories = ['Todos', ...new Set(products.map(p => p.category))];

    useEffect(() => {
        if (categoryParam) {
            setSelectedCategory(categoryParam);
        }
    }, [categoryParam]);

    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat);
        if (cat === 'Todos') {
            searchParams.delete('category');
        } else {
            searchParams.set('category', cat);
        }
        setSearchParams(searchParams);
        setIsFilterOpen(false); // Close mobile drawer on selection
    };

    return (
        <div className="pt-20 min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="font-display font-bold text-4xl uppercase">Colección</h1>
                    <button
                        className="md:hidden flex items-center gap-2 font-bold uppercase text-sm border-b border-black pb-1"
                        onClick={() => setIsFilterOpen(true)}
                    >
                        <Filter size={18} /> Filtros
                    </button>
                </div>

                <div className="flex gap-12">
                    {/* Sidebar Filters (Desktop) */}
                    <aside className="hidden md:block w-64 shrink-0">
                        <div className="sticky top-24">
                            <h3 className="font-bold text-lg mb-6 uppercase border-b border-gray-200 pb-2">Filtros</h3>

                            <div className="mb-8">
                                <h4 className="font-bold text-sm text-gray-500 mb-4 uppercase tracking-wider">Categoría</h4>
                                <ul className="space-y-3">
                                    {categories.map(cat => (
                                        <li key={cat}>
                                            <button
                                                onClick={() => handleCategoryChange(cat)}
                                                className={`text-left w-full hover:underline transition-all ${selectedCategory === cat ? 'font-bold text-black' : 'text-gray-600'}`}
                                            >
                                                {cat}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </aside>

                    {/* Mobile Filter Drawer */}
                    {isFilterOpen && (
                        <div className="fixed inset-0 z-50 bg-black/50 md:hidden flex justify-end">
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                className="bg-white w-3/4 h-full p-6 shadow-2xl"
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="font-display font-bold text-2xl uppercase">Filtros</h2>
                                    <button onClick={() => setIsFilterOpen(false)}><X size={24} /></button>
                                </div>

                                <div>
                                    <h4 className="font-bold text-sm text-gray-500 mb-4 uppercase tracking-wider">Categoría</h4>
                                    <ul className="space-y-4">
                                        {categories.map(cat => (
                                            <li key={cat}>
                                                <button
                                                    onClick={() => handleCategoryChange(cat)}
                                                    className={`text-left w-full text-lg ${selectedCategory === cat ? 'font-bold text-black' : 'text-gray-600'}`}
                                                >
                                                    {cat}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                        {filteredProducts.length === 0 && (
                            <div className="py-20 text-center text-gray-500">
                                No se encontraron productos en esta categoría.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
