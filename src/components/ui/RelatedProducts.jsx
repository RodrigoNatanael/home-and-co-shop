import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseclient';
import ProductCard from '../ProductCard';

const RelatedProducts = ({ currentProductId, category }) => {
    const [related, setRelated] = useState([]);

    useEffect(() => {
        const fetchRelated = async () => {
            // Busca productos de la misma categoría, excluyendo el que ya está viendo
            const { data } = await supabase
                .from('products')
                .select('*')
                .eq('category', category)
                .not('id', 'eq', currentProductId)
                .limit(3);

            if (data) setRelated(data);
        };

        if (currentProductId) fetchRelated();
    }, [currentProductId, category]);

    if (related.length === 0) return null;

    return (
        <div className="mt-12 border-t pt-8">
            <h3 className="text-xl font-bold mb-6 uppercase tracking-wider text-gray-800">
                Completá tu equipo de aventura 🏔️
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default RelatedProducts;
