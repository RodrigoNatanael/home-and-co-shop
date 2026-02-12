import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseclient';
import {
    Trash2, Plus, RefreshCw, ShoppingBag, Video, Image as ImageIcon,
    Package, CheckSquare, FolderPlus, Tag, Settings, Layout, Ticket, List
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function AdminPanel() {
    // --- ESTADOS NAVEGACIÓN ---
    const [activeTab, setActiveTab] = useState('products');

    // --- ESTADOS DATOS ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [banners, setBanners] = useState([]);
    const [combos, setCombos] = useState([]);
    const [allSales, setAllSales] = useState([]);
    const [siteConfig, setSiteConfig] = useState({ hero_video_url: '', cat1_title: '', cat2_title: '', cat3_title: '' });

    // --- ESTADOS FORMULARIOS ---
    const [uploading, setUploading] = useState(false);
    const [imageFiles, setImageFiles] = useState([null, null, null]);
    const [newCategory, setNewCategory] = useState({ name: '', video_url: '' });
    const [productFormData, setProductFormData] = useState({
        name: '', price: '', previous_price: '', cost_price: '', category: '', description: '', stock: '', tags: [], variants: ''
    });
    const [bannerFormData, setBannerFormData] = useState({ title: '', link: '' });
    const [bannerImage, setBannerImage] = useState(null);

    useEffect(() => {
        refreshAll();
    }, []);

    const refreshAll = async () => {
        fetchProducts();
        fetchCategories();
        fetchBanners();
        fetchCombos();
        fetchSales();
        fetchConfig();
    };

    // --- FETCH FUNCTIONS ---
    const fetchProducts = async () => {
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (data) setProducts(data);
    };

    const fetchCategories = async () => {
        const { data } = await supabase.from('categories').select('*').order('name');
        if (data) setCategories(data);
    };

    const fetchBanners = async () => {
        const { data } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
        if (data) setBanners(data);
    };

    const fetchCombos = async () => {
        const { data } = await supabase.from('combos').select('*').order('created_at', { ascending: false });
        if (data) setCombos(data);
    };

    const fetchSales = async () => {
        const { data: manual } = await supabase.from('manual_sales').select('*').order('created_at', { ascending: false });
        if (manual) setAllSales(manual);
    };

    const fetchConfig = async () => {
        const { data } = await supabase.from('site_config').select('*');
        if (data) {
            const cfg = {};
            data.forEach(i => cfg[i.id] = i.value);
            setSiteConfig(prev => ({ ...prev, ...cfg }));
        }
    };

    // --- ACCIONES CATEGORÍAS ---
    const handleAddCategory = async (e) => {
        e.preventDefault();
        const { error } = await supabase.from('categories').insert([newCategory]);
        if (!error) {
            setNewCategory({ name: '', video_url: '' });
            fetchCategories();
        }
    };

    // --- ACCIONES PRODUCTOS ---
    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            const uploadedUrls = [];
            for (let i = 0; i < imageFiles.length; i++) {
                if (imageFiles[i]) {
                    const fileName = `prod_${Date.now()}_${i}`;
                    await supabase.storage.from('product-images').upload(fileName, imageFiles[i]);
                    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
                    uploadedUrls.push(data.publicUrl);
                }
            }

            const newProduct = {
                id: crypto.randomUUID(),
                ...productFormData,
                price: parseFloat(productFormData.price),
                previous_price: productFormData.previous_price ? parseFloat(productFormData.previous_price) : null,
                stock: parseInt(productFormData.stock),
                variants: productFormData.variants.split(',').map(v => v.trim()).filter(Boolean),
                image_url: uploadedUrls[0] || null,
                gallery: uploadedUrls
            };

            const { error } = await supabase.from('products').insert([newProduct]);
            if (error) throw error;
            setProductFormData({ name: '', price: '', previous_price: '', cost_price: '', category: '', description: '', stock: '', tags: [], variants: '' });
            setImageFiles([null, null, null]);
            fetchProducts();
        } catch (err) { alert(err.message); }
        setUploading(false);
    };

    // --- ACCIONES DISEÑO ---
    const handleConfigSave = async () => {
        const updates = Object.keys(siteConfig).map(k => ({ id: k, value: siteConfig[k] }));
        await supabase.from('site_config').upsert(updates);
        alert("Diseño guardado");
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12 font-sans text-gray-900">
            {/* NAV PANEL RESTAURADA */}
            <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center overflow-x-auto gap-4">
                    <h1 className="text-xl font-black italic shrink-0">ADMIN H&C</h1>
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                        {[
                            { id: 'products', label: 'Productos', icon: <Package size={14} /> },
                            { id: 'categories_mgr', label: 'Categorías', icon: <FolderPlus size={14} /> },
                            { id: 'all_sales', label: 'Ventas', icon: <Ticket size={14} /> },
                            { id: 'banners', label: 'Banners', icon: <ImageIcon size={14} /> },
                            { id: 'design', label: 'Diseño', icon: <Layout size={14} /> }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'}`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">

                {/* 1. PRODUCTOS */}
                {activeTab === 'products' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border shadow-md h-fit">
                            <h2 className="font-black text-lg mb-4 uppercase flex items-center gap-2"><Plus /> Nuevo Producto</h2>
                            <form onSubmit={handleProductSubmit} className="space-y-4">
                                <input placeholder="Nombre" value={productFormData.name} onChange={e => setProductFormData({ ...productFormData, name: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold" required />
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="number" placeholder="Precio" value={productFormData.price} onChange={e => setProductFormData({ ...productFormData, price: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-green-600" required />
                                    <input type="number" placeholder="Stock" value={productFormData.stock} onChange={e => setProductFormData({ ...productFormData, stock: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold" required />
                                </div>
                                <select value={productFormData.category} onChange={e => setProductFormData({ ...productFormData, category: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold bg-white" required>
                                    <option value="">Seleccionar categoría...</option>
                                    {categories.map(c => <option key={c.id} value={c.name}>{c.name.toUpperCase()}</option>)}
                                </select>
                                <textarea placeholder="Descripción..." value={productFormData.description} onChange={e => setProductFormData({ ...productFormData, description: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl h-20 text-sm" />
                                <div className="grid grid-cols-3 gap-2">
                                    {[0, 1, 2].map(i => (
                                        <div key={i} className="aspect-square border-2 border-dashed border-gray-100 rounded-xl relative flex items-center justify-center overflow-hidden">
                                            <input type="file" onChange={e => { const f = [...imageFiles]; f[i] = e.target.files[0]; setImageFiles(f); }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                            {imageFiles[i] ? <img src={URL.createObjectURL(imageFiles[i])} className="w-full h-full object-cover" alt="" /> : <ImageIcon className="text-gray-200" />}
                                        </div>
                                    ))}
                                </div>
                                <Button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold" disabled={uploading}>{uploading ? 'GUARDANDO...' : 'GUARDAR PRODUCTO'}</Button>
                            </form>
                        </div>
                        <div className="lg:col-span-7 bg-white rounded-2xl border shadow-sm overflow-hidden h-[600px] flex flex-col">
                            <div className="p-4 border-b bg-gray-50 flex justify-between items-center font-bold text-xs text-gray-400 uppercase tracking-widest">Inventario ({products.length}) <RefreshCw size={14} className="cursor-pointer" onClick={fetchProducts} /></div>
                            <div className="divide-y divide-gray-100 overflow-y-auto">
                                {products.map(p => (
                                    <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <img src={p.image_url} className="w-12 h-12 rounded-lg object-cover border" alt="" />
                                            <div>
                                                <p className="font-black text-sm">{p.name}</p>
                                                <span className="text-[9px] bg-gray-100 px-2 py-0.5 rounded font-bold uppercase">{p.category}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => { if (confirm('¿Borrar?')) supabase.from('products').delete().eq('id', p.id).then(fetchProducts) }} className="text-gray-200 hover:text-red-500"><Trash2 size={18} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. CATEGORÍAS */}
                {activeTab === 'categories_mgr' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-2xl border shadow-md h-fit">
                            <h2 className="font-black text-lg mb-4 uppercase flex items-center gap-2"><FolderPlus /> Crear Categoría</h2>
                            <form onSubmit={handleAddCategory} className="space-y-4">
                                <input placeholder="Nombre" value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold" required />
                                <input placeholder="URL Video" value={newCategory.video_url} onChange={e => setNewCategory({ ...newCategory, video_url: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-mono text-xs" />
                                <Button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold">GUARDAR</Button>
                            </form>
                        </div>
                        <div className="bg-white rounded-2xl border shadow-sm divide-y overflow-hidden">
                            <div className="p-4 bg-gray-50 font-bold text-xs text-gray-400 uppercase">Listado</div>
                            {categories.map(c => (
                                <div key={c.id} className="p-4 flex justify-between items-center uppercase font-bold text-sm">
                                    {c.name}
                                    <button onClick={() => supabase.from('categories').delete().eq('id', c.id).then(fetchCategories)} className="text-gray-200 hover:text-red-500"><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. VENTAS */}
                {activeTab === 'all_sales' && (
                    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 font-bold uppercase text-gray-400">
                                <tr><th className="p-4">Fecha</th><th className="p-4">Cliente</th><th className="p-4">Total</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {allSales.map(s => (
                                    <tr key={s.id} className="hover:bg-gray-50">
                                        <td className="p-4">{new Date(s.created_at).toLocaleDateString()}</td>
                                        <td className="p-4 font-bold">{s.client_name}</td>
                                        <td className="p-4 font-black">${s.total_amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 4. DISEÑO HOME */}
                {activeTab === 'design' && (
                    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border shadow-md">
                        <h2 className="font-black text-xl mb-6 flex items-center gap-2 uppercase"><Settings /> Configuración Home</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Video Principal (URL)</label>
                                <input value={siteConfig.hero_video_url} onChange={e => setSiteConfig({ ...siteConfig, hero_video_url: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-mono text-sm" placeholder="https://..." />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {[1, 2, 3].map(n => (
                                    <div key={n}>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Cat. Destacada {n}</label>
                                        <input value={siteConfig[`cat${n}_title`]} onChange={e => setSiteConfig({ ...siteConfig, [`cat${n}_title`]: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold" />
                                    </div>
                                ))}
                            </div>
                            <Button onClick={handleConfigSave} className="w-full bg-black text-white py-4 rounded-xl font-bold">GUARDAR DISEÑO</Button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}