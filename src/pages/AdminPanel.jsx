import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseclient';
import { Trash2, Plus, RefreshCw, ShoppingBag, Video, Image as ImageIcon, Package, CheckSquare, FolderPlus, Tag, Settings } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('products');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    // --- DATOS ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [allSales, setAllSales] = useState([]);

    // --- FORMULARIOS ---
    const [newCategory, setNewCategory] = useState({ name: '', video_url: '' });
    const [productFormData, setProductFormData] = useState({
        name: '', price: '', previous_price: '', cost_price: '', category: '', description: '', stock: '', tags: [], variants: ''
    });
    const [imageFiles, setImageFiles] = useState([null, null, null]);

    useEffect(() => {
        refreshAll();
    }, []);

    const refreshAll = async () => {
        fetchProducts();
        fetchCategories();
        fetchSales();
    };

    const fetchProducts = async () => {
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (data) setProducts(data);
    };

    const fetchCategories = async () => {
        const { data } = await supabase.from('categories').select('*').order('name');
        if (data) setCategories(data);
    };

    const fetchSales = async () => {
        const { data: manual } = await supabase.from('manual_sales').select('*').order('created_at', { ascending: false });
        if (manual) setAllSales(manual);
    };

    // --- GESTIÓN DE CATEGORÍAS ---
    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.name) return;
        const { error } = await supabase.from('categories').insert([newCategory]);
        if (!error) {
            setNewCategory({ name: '', video_url: '' });
            fetchCategories();
            alert("✅ Categoría creada");
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!confirm("¿Borrar categoría? Solo funcionará si no tiene productos asociados o si la FK está en cascade.")) return;
        await supabase.from('categories').delete().eq('id', id);
        fetchCategories();
    };

    // --- GESTIÓN DE PRODUCTOS ---
    const generateUUID = () => crypto.randomUUID();

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            const uploadedUrls = [];
            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i];
                if (file) {
                    const fileName = `prod_${Date.now()}_${i}`;
                    await supabase.storage.from('product-images').upload(fileName, file);
                    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
                    uploadedUrls.push(data.publicUrl);
                }
            }

            const variantsArray = productFormData.variants.split(',').map(v => v.trim()).filter(Boolean);

            const newProduct = {
                id: generateUUID(),
                ...productFormData,
                price: parseFloat(productFormData.price),
                previous_price: productFormData.previous_price ? parseFloat(productFormData.previous_price) : null,
                cost_price: productFormData.cost_price ? parseFloat(productFormData.cost_price) : null,
                stock: parseInt(productFormData.stock),
                variants: variantsArray,
                image_url: uploadedUrls[0] || null,
                gallery: uploadedUrls
            };

            const { error } = await supabase.from('products').insert([newProduct]);
            if (error) throw error;

            alert("✅ Producto guardado");
            setProductFormData({ name: '', price: '', previous_price: '', cost_price: '', category: '', description: '', stock: '', tags: [], variants: '' });
            setImageFiles([null, null, null]);
            fetchProducts();
        } catch (error) {
            alert("❌ Error: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12 font-sans text-gray-900">
            {/* NAV PANEL */}
            <div className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
                    <h1 className="text-xl font-black italic">ADMIN H&C</h1>
                    <div className="flex gap-2">
                        {['products', 'categories_mgr', 'all_sales'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === tab ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}>
                                {tab === 'categories_mgr' ? 'Categorías' : tab.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">

                {/* --- PESTAÑA CATEGORÍAS --- */}
                {activeTab === 'categories_mgr' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-2xl border shadow-sm h-fit">
                            <h2 className="font-black text-lg mb-4 flex items-center gap-2 uppercase"><FolderPlus size={20} /> Crear Categoría</h2>
                            <form onSubmit={handleAddCategory} className="space-y-4">
                                <input placeholder="Nombre (ej: Mates Imperiales)" value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold outline-none" required />
                                <input placeholder="URL Video (YouTube/Cloudinary)" value={newCategory.video_url} onChange={e => setNewCategory({ ...newCategory, video_url: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-mono text-xs outline-none" />
                                <Button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold">GUARDAR CATEGORÍA</Button>
                            </form>
                        </div>
                        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                            <div className="p-4 border-b bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Listado de Categorías</div>
                            <div className="divide-y divide-gray-100">
                                {categories.map(cat => (
                                    <div key={cat.id} className="p-4 flex justify-between items-center group hover:bg-gray-50">
                                        <div>
                                            <p className="font-bold text-gray-900 uppercase text-sm">{cat.name}</p>
                                            {cat.video_url && <p className="text-[9px] text-blue-500 truncate max-w-xs">{cat.video_url}</p>}
                                        </div>
                                        <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-gray-200 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- PESTAÑA PRODUCTOS --- */}
                {activeTab === 'products' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* FORMULARIO */}
                        <div className="lg:col-span-5">
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
                                <h2 className="font-black text-lg mb-4 flex items-center gap-2 uppercase"><Plus size={20} /> Nuevo Producto</h2>
                                <form onSubmit={handleProductSubmit} className="space-y-4">
                                    <input placeholder="Nombre del producto" value={productFormData.name} onChange={e => setProductFormData({ ...productFormData, name: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold outline-none" required />

                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="number" placeholder="Precio Venta" value={productFormData.price} onChange={e => setProductFormData({ ...productFormData, price: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-green-600 outline-none" required />
                                        <input type="number" placeholder="Stock" value={productFormData.stock} onChange={e => setProductFormData({ ...productFormData, stock: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold outline-none" required />
                                    </div>

                                    {/* SELECT DINÁMICO DE CATEGORÍAS */}
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Categoría</label>
                                        <select
                                            value={productFormData.category}
                                            onChange={e => setProductFormData({ ...productFormData, category: e.target.value })}
                                            className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold bg-white outline-none"
                                            required
                                        >
                                            <option value="">Seleccionar categoría...</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.name}>{cat.name.toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <label className="text-xs font-bold text-blue-800 uppercase block mb-1">Colores / Variantes</label>
                                        <input placeholder="Rojo, Negro, Blanco..." value={productFormData.variants} onChange={e => setProductFormData({ ...productFormData, variants: e.target.value })} className="w-full bg-transparent border-b border-blue-200 p-1 outline-none text-sm" />
                                    </div>

                                    <textarea placeholder="Descripción..." value={productFormData.description} onChange={e => setProductFormData({ ...productFormData, description: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl h-20 text-sm outline-none" />

                                    <div className="grid grid-cols-3 gap-2">
                                        {[0, 1, 2].map(i => (
                                            <div key={i} className="aspect-square border-2 border-dashed border-gray-200 rounded-xl relative flex items-center justify-center overflow-hidden">
                                                <input type="file" onChange={e => { const files = [...imageFiles]; files[i] = e.target.files[0]; setImageFiles(files); }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                                {imageFiles[i] ? <img src={URL.createObjectURL(imageFiles[i])} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-200" />}
                                            </div>
                                        ))}
                                    </div>

                                    <Button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold shadow-lg" disabled={uploading}>
                                        {uploading ? 'SUBIENDO...' : 'GUARDAR PRODUCTO'}
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* LISTA INVENTARIO */}
                        <div className="lg:col-span-7">
                            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden h-[800px] flex flex-col">
                                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-500 uppercase text-xs">Inventario ({products.length})</h3>
                                    <button onClick={fetchProducts} className="text-gray-400 hover:text-black"><RefreshCw size={18} /></button>
                                </div>
                                <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
                                    {products.map(p => (
                                        <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <img src={p.image_url} className="w-12 h-12 rounded-lg object-cover border" alt="" />
                                                <div>
                                                    <p className="font-black text-sm">{p.name}</p>
                                                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-bold uppercase">{p.category}</span>
                                                </div>
                                            </div>
                                            <button onClick={() => { if (confirm('¿Borrar?')) supabase.from('products').delete().eq('id', p.id).then(fetchProducts) }} className="text-gray-200 hover:text-red-500"><Trash2 size={18} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}