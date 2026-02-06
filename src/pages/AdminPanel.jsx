import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseclient';
import { Trash2, Upload, Plus, Save, Image as ImageIcon, Package } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('products'); // 'products' | 'banners'

    // --- PRODUCTS STATE ---
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [productFormData, setProductFormData] = useState({
        id: '',
        name: '',
        price: '',
        category: '',
        description: ''
    });
    const [productImageFile, setProductImageFile] = useState(null);

    // --- BANNERS STATE ---
    const [banners, setBanners] = useState([]);
    const [loadingBanners, setLoadingBanners] = useState(false);
    const [bannerFormData, setBannerFormData] = useState({
        title: '',
        link: ''
    });
    const [bannerImageFile, setBannerImageFile] = useState(null);

    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchBanners();
    }, []);

    // --- FETCH DATA ---
    const fetchProducts = async () => {
        setLoadingProducts(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching products:', error);
        else setProducts(data || []);
        setLoadingProducts(false);
    };

    const fetchBanners = async () => {
        setLoadingBanners(true);
        const { data, error } = await supabase
            .from('banners')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching banners:', error);
        else setBanners(data || []);
        setLoadingBanners(false);
    };

    // --- HANDLERS: PRODUCTS ---
    const handleProductInputChange = (e) => {
        const { name, value } = e.target;
        setProductFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProductImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setProductImageFile(e.target.files[0]);
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        if (!productFormData.name || !productFormData.price || !productFormData.category) {
            alert('Por favor completá los campos obligatorios');
            return;
        }

        try {
            setUploading(true);
            let imageUrl = null;

            if (productImageFile) {
                const fileExt = productImageFile.name.split('.').pop();
                const fileName = `prod_${Math.random().toString(36).substring(2)}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(fileName, productImageFile);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
                imageUrl = data.publicUrl;
            }

            const newProduct = {
                name: productFormData.name,
                price: parseFloat(productFormData.price),
                category: productFormData.category,
                description: productFormData.description,
                image_url: imageUrl
            };

            if (productFormData.id) newProduct.id = productFormData.id;

            const { error } = await supabase.from('products').insert([newProduct]);
            if (error) throw error;

            alert('Producto creado!');
            setProductFormData({ id: '', name: '', price: '', category: '', description: '' });
            setProductImageFile(null);
            fetchProducts();
        } catch (error) {
            console.error('Error:', error);
            alert('Error creating product');
        } finally {
            setUploading(false);
        }
    };

    const handleProductDelete = async (id) => {
        if (!confirm('¿Borrar producto?')) return;
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) alert('Error deleting');
        else fetchProducts();
    };

    // --- HANDLERS: BANNERS ---
    const handleBannerInputChange = (e) => {
        const { name, value } = e.target;
        setBannerFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBannerImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setBannerImageFile(e.target.files[0]);
        }
    };

    const handleBannerSubmit = async (e) => {
        e.preventDefault();
        if (!bannerImageFile) {
            alert('La imagen del banner es obligatoria');
            return;
        }

        try {
            setUploading(true);

            // Upload Banner Image
            const fileExt = bannerImageFile.name.split('.').pop();
            const fileName = `banner_${Math.random().toString(36).substring(2)}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('product-images') // Using same bucket as requested
                .upload(fileName, bannerImageFile);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
            const imageUrl = data.publicUrl;

            // Insert Banner
            const { error } = await supabase.from('banners').insert([{
                title: bannerFormData.title,
                link: bannerFormData.link,
                image_url: imageUrl
            }]);

            if (error) throw error;

            alert('Banner creado!');
            setBannerFormData({ title: '', link: '' });
            setBannerImageFile(null);
            fetchBanners();

        } catch (error) {
            console.error('Error:', error);
            alert('Error creating banner');
        } finally {
            setUploading(false);
        }
    };

    const handleBannerDelete = async (id) => {
        if (!confirm('¿Borrar banner?')) return;
        const { error } = await supabase.from('banners').delete().eq('id', id);
        if (error) alert('Error deleting');
        else fetchBanners();
    };


    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h1 className="font-display font-bold text-3xl">Panel de Administración</h1>

                    {/* TABS */}
                    <div className="flex bg-gray-200 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'products' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Package size={16} /> Productos
                        </button>
                        <button
                            onClick={() => setActiveTab('banners')}
                            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'banners' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <ImageIcon size={16} /> Banners
                        </button>
                    </div>
                </div>

                {/* --- CONTENT: PRODUCTS --- */}
                {activeTab === 'products' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Product Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-24">
                                <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                                    <Plus size={20} /> Nuevo Producto
                                </h2>
                                <form onSubmit={handleProductSubmit} className="space-y-4">
                                    <input type="text" name="id" value={productFormData.id} onChange={handleProductInputChange} placeholder="ID (Opcional)" className="w-full border p-2 rounded" />
                                    <input type="text" name="name" value={productFormData.name} onChange={handleProductInputChange} required placeholder="Nombre *" className="w-full border p-2 rounded" />
                                    <input type="number" name="price" value={productFormData.price} onChange={handleProductInputChange} required placeholder="Precio *" className="w-full border p-2 rounded" />
                                    <select name="category" value={productFormData.category} onChange={handleProductInputChange} required className="w-full border p-2 rounded">
                                        <option value="">Categoría...</option>
                                        <option value="Mates">Mates</option>
                                        <option value="Termos">Termos</option>
                                        <option value="Botellas">Botellas</option>
                                        <option value="Coolers">Coolers</option>
                                        <option value="Accesorios">Accesorios</option>
                                    </select>
                                    <textarea name="description" value={productFormData.description} onChange={handleProductInputChange} placeholder="Descripción" rows="3" className="w-full border p-2 rounded" />

                                    <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center">
                                        <input type="file" onChange={handleProductImageChange} className="hidden" id="prod-file" />
                                        <label htmlFor="prod-file" className="cursor-pointer flex flex-col items-center">
                                            <Upload className="mb-2 text-gray-400" />
                                            <span className="text-sm text-gray-500">{productImageFile ? productImageFile.name : 'Imagen del Producto'}</span>
                                        </label>
                                    </div>

                                    <Button type="submit" disabled={uploading} className="w-full mt-4">
                                        {uploading ? 'Guardando...' : 'Guardar Producto'}
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* Product List */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b flex justify-between">
                                    <h2 className="font-bold">Inventario</h2>
                                </div>
                                <div className="p-0">
                                    {products.map(p => (
                                        <div key={p.id} className="p-4 border-b flex items-center gap-4 hover:bg-gray-50">
                                            <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                {p.image_url && <img src={p.image_url} alt="" className="w-full h-full object-cover" />}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-sm">{p.name}</h3>
                                                <p className="text-xs text-gray-500">{p.id}</p>
                                            </div>
                                            <div className="font-bold text-sm">
                                                {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(p.price)}
                                            </div>
                                            <button onClick={() => handleProductDelete(p.id)} className="text-gray-400 hover:text-red-500 p-2">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- CONTENT: BANNERS --- */}
                {activeTab === 'banners' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Banner Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-24">
                                <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                                    <Plus size={20} /> Nuevo Banner
                                </h2>
                                <form onSubmit={handleBannerSubmit} className="space-y-4">
                                    <input type="text" name="title" value={bannerFormData.title} onChange={handleBannerInputChange} placeholder="Título Principal (Ej: VERANO 2026)" className="w-full border p-2 rounded" />
                                    <input type="text" name="link" value={bannerFormData.link} onChange={handleBannerInputChange} placeholder="Link destino (Ej: /catalog?category=Mates)" className="w-full border p-2 rounded" />

                                    <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center">
                                        <input type="file" onChange={handleBannerImageChange} className="hidden" id="banner-file" />
                                        <label htmlFor="banner-file" className="cursor-pointer flex flex-col items-center">
                                            <Upload className="mb-2 text-gray-400" />
                                            <span className="text-sm text-gray-500">{bannerImageFile ? bannerImageFile.name : 'Imagen (Horizontal)'}</span>
                                        </label>
                                    </div>

                                    <Button type="submit" disabled={uploading} className="w-full mt-4">
                                        {uploading ? 'Subiendo...' : 'Crear Banner'}
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* Banner List */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b flex justify-between">
                                    <h2 className="font-bold">Banners Activos</h2>
                                </div>
                                <div className="p-4 grid grid-cols-1 gap-4">
                                    {banners.map(b => (
                                        <div key={b.id} className="border rounded-lg overflow-hidden relative group">
                                            <div className="h-40 w-full bg-gray-100">
                                                <img src={b.image_url} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <button
                                                    onClick={() => handleBannerDelete(b.id)}
                                                    className="bg-white text-red-500 p-2 rounded-full shadow-lg hover:bg-red-50"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                            <div className="p-3 bg-white">
                                                <h3 className="font-bold text-sm truncate">{b.title || '(Sin título)'}</h3>
                                                <p className="text-xs text-gray-400 truncate">{b.link}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {banners.length === 0 && <p className="text-gray-500 text-center py-8">No hay banners.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
