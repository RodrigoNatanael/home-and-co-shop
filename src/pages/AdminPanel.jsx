import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Trash2, Upload, Plus, Save } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function AdminPanel() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        price: '',
        category: '',
        description: ''
    });
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching products:', error);
        else setProducts(data || []);
        setLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.price || !formData.category) {
            alert('Por favor completá los campos obligatorios (Nombre, Precio, Categoría)');
            return;
        }

        try {
            setUploading(true);
            let imageUrl = null;

            // 1. Upload Image if exists
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(filePath, imageFile);

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(filePath);

                imageUrl = publicUrlData.publicUrl;
            }

            // 2. Prepare Product Data
            const newProduct = {
                name: formData.name,
                price: parseFloat(formData.price),
                category: formData.category,
                description: formData.description,
                image_url: imageUrl
            };

            // Referencing the ID explicitly if provided
            if (formData.id) {
                newProduct.id = formData.id;
            }

            // 3. Insert into Supabase
            const { error: insertError } = await supabase
                .from('products')
                .insert([newProduct]);

            if (insertError) throw insertError;

            // 4. Reset and Refresh
            alert('Producto creado exitosamente!');
            setFormData({
                id: '',
                name: '',
                price: '',
                category: '',
                description: ''
            });
            setImageFile(null);
            fetchProducts();

        } catch (error) {
            console.error('Error creating product:', error);
            alert('Hubo un error al crear el producto: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de que querés borrar este producto?')) return;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error al borrar producto');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">

                <h1 className="font-display font-bold text-3xl mb-8 border-b pb-4">Panel de Administración</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Form Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-24">
                            <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                                <Plus size={20} /> Nuevo Producto
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">ID (Opcional)</label>
                                    <input
                                        type="text"
                                        name="id"
                                        value={formData.id}
                                        onChange={handleInputChange}
                                        placeholder="Ej: mate-termico-negro"
                                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-black focus:border-black"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Si se deja vacío, se generará autmáticamente.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Nombre *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-black focus:border-black"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Precio *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-black focus:border-black"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Categoría *</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-black focus:border-black"
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="Mates">Mates</option>
                                        <option value="Termos">Termos</option>
                                        <option value="Botellas">Botellas</option>
                                        <option value="Coolers">Coolers</option>
                                        <option value="Accesorios">Accesorios</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-black focus:border-black"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Imagen</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:bg-gray-50 transition-colors relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="flex flex-col items-center pointer-events-none">
                                            <Upload className="mb-2 text-gray-400" size={24} />
                                            <span className="text-sm text-gray-500">
                                                {imageFile ? imageFile.name : 'Click o arrastrar imagen'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full mt-4 flex items-center justify-center gap-2"
                                >
                                    {uploading ? 'Guardando...' : <><Save size={18} /> Guardar Producto</>}
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* List Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                <h2 className="font-bold text-lg">Inventario Actual</h2>
                                <span className="text-sm text-gray-500">{products.length} productos</span>
                            </div>

                            {loading ? (
                                <div className="p-8 text-center text-gray-500">Cargando productos...</div>
                            ) : products.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No hay productos cargados todavía.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
                                            <tr>
                                                <th className="px-4 py-3">Img</th>
                                                <th className="px-4 py-3">Nombre</th>
                                                <th className="px-4 py-3">Categoría</th>
                                                <th className="px-4 py-3 text-right">Precio</th>
                                                <th className="px-4 py-3 text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {products.map(product => (
                                                <tr key={product.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3">
                                                        <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                                                            {product.image_url && <img src={product.image_url} alt="" className="w-full h-full object-cover" />}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 font-medium">
                                                        {product.name}
                                                        <span className="block text-xs text-gray-400 font-normal truncate max-w-[150px]">{product.id}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600 uppercase">
                                                            {product.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold w-32">
                                                        {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(product.price)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center w-20">
                                                        <button
                                                            onClick={() => handleDelete(product.id)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
