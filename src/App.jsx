import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/products/ProductCard';

// Datos harcodeados de productos (Mismos que tenías)
const products = [
  { id: 1, name: 'Mate Imperial', price: 15000, category: 'Mates', image: 'https://images.unsplash.com/photo-1616428782063-71a257c7c3b2?auto=format&fit=crop&q=80&w=800' },
  { id: 2, name: 'Termo Media Manija', price: 45000, category: 'Termos', image: 'https://images.unsplash.com/photo-1621262637242-79075e81d115?auto=format&fit=crop&q=80&w=800' },
  { id: 3, name: 'Bombilla Pico Loro', price: 8500, category: 'Bombillas', image: 'https://images.unsplash.com/photo-1598514972639-656972236a29?auto=format&fit=crop&q=80&w=800' },
  { id: 4, name: 'Mate Camionero', price: 18000, category: 'Mates', image: 'https://images.unsplash.com/photo-1563207604-d02f5a65c276?auto=format&fit=crop&q=80&w=800' },
  { id: 5, name: 'Yerbera de Cuero', price: 12000, category: 'Accesorios', image: 'https://images.unsplash.com/photo-1626105953051-736815340636?auto=format&fit=crop&q=80&w=800' },
  { id: 6, name: 'Termo Stanley', price: 95000, category: 'Termos', image: 'https://images.unsplash.com/photo-1562243296-6b216447cc9d?auto=format&fit=crop&q=80&w=800' },
];

const categories = ['Todos', 'Mates', 'Termos', 'Bombillas', 'Accesorios', 'Hidratación', 'Coolers'];

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Sincronizar URL con estado
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('Todos');
    }
  }, [searchParams]);

  // Filtrar productos cuando cambia la categoría
  useEffect(() => {
    if (selectedCategory === 'Todos') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'Todos') {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
    setIsFilterOpen(false); // Cerrar filtro en mobile al elegir
  };

  return (
    <div className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-2">CATÁLOGO</h1>
          <p className="text-gray-500">Encontrá lo mejor para tus mates.</p>
        </div>

        {/* Botón Filtro Mobile */}
        <button
          className="md:hidden flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full font-bold"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <Filter size={18} /> Filtros <ChevronDown size={18} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filtros (Desktop) */}
        <aside className={`md:w-64 space-y-2 ${isFilterOpen ? 'block' : 'hidden md:block'}`}>
          <h3 className="font-bold text-lg mb-4 hidden md:block">Categorías</h3>
          <div className="flex flex-col gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                // ACÁ ESTABA EL ERROR: YA LO CORREGÍ ABAJO
                className={`text-left px-4 py-2 rounded-lg transition-all ${selectedCategory === cat
                    ? 'bg-black text-white font-bold'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </aside>

        {/* Grilla de Productos */}
        <div className="flex-1">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl">
              <p className="text-xl text-gray-400 font-bold">No hay productos en esta categoría... todavía 😉</p>
              <button onClick={() => handleCategoryChange('Todos')} className="mt-4 text-brand-accent font-bold hover:underline">
                Ver todos los productos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}