import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseclient';
import { Trash2, Plus, RefreshCw, Save, ShoppingBag, Video, Image as ImageIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function AdminPanel() {
    // --- ESTADOS ---
    const [activeTab, setActiveTab] = useState('products');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    // --- DATOS ---
    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [combos, setCombos] = useState([]);
    const [allSales, setAllSales] = useState([]);
    const [siteConfig, setSiteConfig] = useState({ hero_video_url: '', cat1_title: '', cat2_title: '', cat3_title: '' });

    // --- FORMULARIO PRODUCTO (Estructura Completa) ---
    const [productFormData, setProductFormData] = useState({
        name: '',
        price: '',
        previous_price: '',
        cost_price: '',
        category: '',
        description: '',
        stock: '',
        tags: [] // Array para checkboxes
    });
    const [productImageFile, setProductImageFile] = useState(null);

    // --- OTROS FORMULARIOS ---
    const [manualSaleFormData, setManualSaleFormData] = useState({
        seller: 'Rodrigo', client_name: '', client_phone: '', items: [], total_amount: 0, paid_amount: ''
    });
    const [bannerFormData, setBannerFormData] = useState({ title: '', link: '' });
    const [bannerImageFile, setBannerImageFile] = useState(null);

    // --- CARGA INICIAL ---
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        fetchProducts();
        fetchBanners();
        fetchCombos();
        fetchSales();
        fetchConfig();
    };

    // --- FUNCIONES DE CONEXIÓN SUPABASE ---
    const fetchProducts = async () => {
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (data) setProducts(data);
    };

    const fetchSales = async () => {
        const { data: manual } = await supabase.from('manual_sales').select('*').order('created_at', { ascending: false });
        const { data: leads } = await supabase.from('leads').select('*').order('created_at', { ascending: false });

        const manualNorm = (manual || []).map(s => ({ ...s, origin: 'MANUAL', date: s.created_at, client: s.client_name, total: s.total_amount, paid: s.paid_amount || 0 }));
        const leadsNorm = (leads || []).map(l => ({
            id: l.id, date: l.created_at, client: l.name,
            total: JSON.parse(l.metadata || '{}').total || 0, paid: JSON.parse(l.metadata || '{}').total || 0,
            status: 'Pagado', origin: 'WEB'
        }));
        setAllSales([...manualNorm, ...leadsNorm].sort((a, b) => new Date(b.date) - new Date(a.date)));
    };

    const fetchBanners = async () => {
        const { data } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
        if (data) setBanners(data);
    };

    const fetchCombos = async () => {
        const { data } = await supabase.from('combos').select('*').order('created_at', { ascending: false });
        if (data) setCombos(data);
    };

    const fetchConfig = async () => {
        const { data } = await supabase.from('site_config').select('*');
        if (data) {
            const cfg = {};
            data.forEach(i => cfg[i.id] = i.value);
            setSiteConfig(prev => ({ ...prev, ...cfg }));
        }
    };

    // --- LOGICA PRODUCTOS ---
    const handleTagChange = (tag) => {
        setProductFormData(prev => {
            const currentTags = prev.tags || [];
            return currentTags.includes(tag)
                ? { ...prev, tags: currentTags.filter(t => t !== tag) }
                : { ...prev, tags: [...currentTags, tag] };
        });
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            let imageUrl = null;
            if (productImageFile) {
                const fileName = `prod_${Date.now()}`;
                await supabase.storage.from('product-images').upload(fileName, productImageFile);
                imageUrl = supabase.storage.from('product-images').getPublicUrl(fileName).data.publicUrl;
            }

            const newProduct = {
                name: productFormData.name,
                price: parseFloat(productFormData.price),
                previous_price: productFormData.previous_price ? parseFloat(productFormData.previous_price) : null,
                cost_price: productFormData.cost_price ? parseFloat(productFormData.cost_price) : null,
                category: productFormData.category,
                description: productFormData.description,
                stock: parseInt(productFormData.stock),
                tags: productFormData.tags, // Esto se guarda como array en Supabase
                image_url: imageUrl
            };

            const { error } = await supabase.from('products').insert([newProduct]);

            if (error) throw error;

            alert("✅ Producto creado correctamente");
            setProductFormData({ name: '', price: '', previous_price: '', cost_price: '', category: '', description: '', stock: '', tags: [] });
            setProductImageFile(null);
            fetchProducts();

        } catch (error) {
            alert("❌ Error: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleProductDelete = async (id) => {
        if (confirm("¿Borrar producto?")) {
            await supabase.from('products').delete().eq('id', id);
            fetchProducts();
        }
    };

    // --- LOGICA OTRAS PESTAÑAS ---
    const handleManualSaleSubmit = async (e) => {
        e.preventDefault();
        const paid = parseFloat(manualSaleFormData.paid_amount) || 0;
        const status = paid >= manualSaleFormData.total_amount ? 'Pagado' : 'Pendiente';
        await supabase.from('manual_sales').insert([{
            seller: manualSaleFormData.seller, client_name: manualSaleFormData.client_name,
            client_phone: manualSaleFormData.client_phone, items_json: manualSaleFormData.items,
            total_amount: manualSaleFormData.total_amount, paid_amount: paid, status, date: new Date().toISOString()
        }]);
        alert("Venta registrada");
        setManualSaleFormData({ seller: 'Rodrigo', client_name: '', client_phone: '', items: [], total_amount: 0, paid_amount: '' });
        fetchSales();
    };

    const handleAddManualItem = (p) => {
        setManualSaleFormData(prev => {
            const newItems = [...prev.items, { id: p.id, name: p.name, price: p.price, quantity: 1 }];
            const total = newItems.reduce((acc, i) => acc + i.price, 0);
            return { ...prev, items: newItems, total_amount: total };
        });
    };

    const handleConfigSave = async () => {
        const updates = Object.keys(siteConfig).map(k => ({ id: k, value: siteConfig[k] }));
        await supabase.from('site_config').upsert(updates);
        alert("Diseño guardado");
    };

    const handleBannerSubmit = async (e) => {
        e.preventDefault();
        let url = '';
        if (bannerImageFile) {
            const fileName = `ban_${Date.now()}`;
            await supabase.storage.from('product-images').upload(fileName, bannerImageFile);
            url = supabase.storage.from('product-images').getPublicUrl(fileName).data.publicUrl;
        }
        await supabase.from('banners').insert([{ ...bannerFormData, image_url: url }]);
        fetchBanners();
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12 font-sans text-gray-900">
            {/* HEADER */}
            <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
                    <h1 className="text-2xl font-black italic tracking-tighter">ADMIN <span className="text-brand-primary">H&C</span></h1>

                    {/* Menu Desktop */}
                    <div className="hidden lg:flex gap-1 bg-gray-100 p-1 rounded-lg">
                        {['products', 'manual_sales', 'all_sales', 'banners', 'combos', 'design'].map(t => (
                            <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 text-xs font-bold uppercase rounded-md transition-all ${activeTab === t ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-900'}`}>
                                {t.replace('_', ' ')}
                            </button>
                        ))}
                    </div>

                    {/* Menu Mobile */}
                    <button className="lg:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <div className="space-y-1"><span className="block w-6 h-0.5 bg-black"></span><span className="block w-6 h-0.5 bg-black"></span><span className="block w-6 h-0.5 bg-black"></span></div>
                    </button>
                </div>
                {isMobileMenuOpen && (
                    <div className="lg:hidden bg-white border-t">
                        {['products', 'manual_sales', 'all_sales', 'banners', 'combos', 'design'].map(t => (
                            <button key={t} onClick={() => { setActiveTab(t); setIsMobileMenuOpen(false) }} className="block w-full text-left p-3 font-bold text-sm border-b uppercase">{t.replace('_', ' ')}</button>
                        ))}
                    </div>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">

                {/* --- 1. SECCIÓN PRODUCTOS (ESTRUCTURA ORIGINAL + FUNCIONAL) --- */}
                {activeTab === 'products' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* COLUMNA IZQUIERDA: FORMULARIO */}
                        <div className="lg:col-span-5">
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md sticky top-24">
                                <h2 className="font-black text-lg mb-4 flex items-center gap-2 uppercase">
                                    <Plus size={20} /> Cargar Producto
                                </h2>
                                <form onSubmit={handleProductSubmit} className="space-y-4">

                                    {/* Nombre */}
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Nombre del Producto</label>
                                        <input
                                            value={productFormData.name}
                                            onChange={e => setProductFormData({ ...productFormData, name: e.target.value })}
                                            className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold focus:border-black outline-none"
                                            required
                                        />
                                    </div>

                                    {/* Precios (Venta y Costo) */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Precio Venta</label>
                                            <input type="number" value={productFormData.price} onChange={e => setProductFormData({ ...productFormData, price: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-green-600 outline-none" required />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Precio Costo</label>
                                            <input type="number" value={productFormData.cost_price} onChange={e => setProductFormData({ ...productFormData, cost_price: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl text-gray-500 outline-none" placeholder="(Opcional)" />
                                        </div>
                                    </div>

                                    {/* Precio Anterior y Stock */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Precio Anterior</label>
                                            <input type="number" value={productFormData.previous_price} onChange={e => setProductFormData({ ...productFormData, previous_price: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none" placeholder="Tachado" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Stock Inicial</label>
                                            <input type="number" value={productFormData.stock} onChange={e => setProductFormData({ ...productFormData, stock: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold outline-none" required />
                                        </div>
                                    </div>

                                    {/* Categoría */}
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Categoría</label>
                                        <select value={productFormData.category} onChange={e => setProductFormData({ ...productFormData, category: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold bg-white outline-none">
                                            <option value="">Seleccionar...</option>
                                            <option value="Mates">Mates</option>
                                            <option value="Termos">Termos</option>
                                            <option value="Bombillas">Bombillas</option>
                                            <option value="Combos">Combos</option>
                                            <option value="Accesorios">Accesorios</option>
                                        </select>
                                    </div>

                                    {/* Etiquetas (Checkboxes) */}
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Etiquetas / Filtros</label>
                                        <div className="flex flex-wrap gap-3">
                                            {['NUEVO', 'OFERTA', 'DESTACADO', 'RUGGED', 'ENVIO GRATIS'].map(tag => (
                                                <label key={tag} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={productFormData.tags.includes(tag)}
                                                        onChange={() => handleTagChange(tag)}
                                                        className="rounded border-gray-300 text-black focus:ring-black w-4 h-4"
                                                    />
                                                    <span className="text-xs font-bold">{tag}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Descripción */}
                                    <textarea placeholder="Descripción detallada..." value={productFormData.description} onChange={e => setProductFormData({ ...productFormData, description: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl h-24 text-sm outline-none" />

                                    {/* Subir Imagen */}
                                    <div className="border-2 border-dashed border-gray-200 p-4 rounded-xl text-center hover:bg-gray-50 cursor-pointer relative transition-colors">
                                        <input type="file" onChange={e => setProductImageFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        <div className="flex flex-col items-center gap-1">
                                            <ImageIcon className="text-gray-300" size={24} />
                                            <p className="text-xs font-bold text-gray-400">{productImageFile ? productImageFile.name : '+ FOTO PRINCIPAL'}</p>
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 transition-colors" disabled={uploading}>
                                        {uploading ? 'SUBIENDO...' : 'GUARDAR PRODUCTO'}
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: INVENTARIO */}
                        <div className="lg:col-span-7">
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-[800px] flex flex-col">
                                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-500 uppercase text-xs tracking-widest">Inventario ({products.length})</h3>
                                    <button onClick={fetchProducts} className="text-gray-400 hover:text-black transition-colors"><RefreshCw size={18} /></button>
                                </div>
                                <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
                                    {products.map(p => (
                                        <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                                                    <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm text-gray-900">{p.name}</p>
                                                    <div className="flex gap-2 items-center text-xs text-gray-500 mt-1">
                                                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">{p.category}</span>
                                                        <span className="font-bold text-green-600">${p.price}</span>
                                                        {p.previous_price && <span className="line-through text-gray-300 text-[10px]">${p.previous_price}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Stock</p>
                                                    <span className={`text-sm font-bold ${p.stock < 5 ? 'text-red-500' : 'text-gray-900'}`}>{p.stock}</span>
                                                </div>
                                                <button onClick={async () => { if (confirm('¿Eliminar definitivamente?')) { await supabase.from('products').delete().eq('id', p.id); fetchProducts(); } }} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {products.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-50">
                                            <ShoppingBag size={48} className="mb-2" />
                                            <p className="text-sm font-bold">Sin productos</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* --- 2. VENTAS MANUALES (Vendedor + Seña) --- */}
                {activeTab === 'manual_sales' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Formulario Izquierda */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
                            <h2 className="font-black text-lg mb-4 uppercase">Registrar Venta</h2>
                            <form onSubmit={handleManualSaleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <select value={manualSaleFormData.seller} onChange={e => setManualSaleFormData({ ...manualSaleFormData, seller: e.target.value })} className="border-2 border-gray-100 p-3 rounded-xl font-bold bg-white">
                                        <option value="Rodrigo">Rodrigo</option>
                                        <option value="Vane">Vane</option>
                                    </select>
                                    <input placeholder="WhatsApp Cliente" value={manualSaleFormData.client_phone} onChange={e => setManualSaleFormData({ ...manualSaleFormData, client_phone: e.target.value })} className="border-2 border-gray-100 p-3 rounded-xl" />
                                </div>
                                <input placeholder="Nombre Cliente" value={manualSaleFormData.client_name} onChange={e => setManualSaleFormData({ ...manualSaleFormData, client_name: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold" required />

                                {/* Lista items */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-[100px]">
                                    {manualSaleFormData.items.map((i, idx) => (
                                        <div key={idx} className="flex justify-between text-sm mb-1">
                                            <span>{i.name}</span>
                                            <b>${i.price}</b>
                                        </div>
                                    ))}
                                    <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-black text-lg">
                                        <span>TOTAL</span>
                                        <span>${manualSaleFormData.total_amount}</span>
                                    </div>
                                </div>

                                {/* Seña */}
                                <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                                    <label className="text-xs font-bold text-yellow-700 uppercase">¿Cuánto paga ahora? (Seña)</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="font-bold text-yellow-600">$</span>
                                        <input type="number" value={manualSaleFormData.paid_amount} onChange={e => setManualSaleFormData({ ...manualSaleFormData, paid_amount: e.target.value })} className="bg-transparent font-black text-xl w-full outline-none text-yellow-900" placeholder="0" />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold">FINALIZAR VENTA</Button>
                            </form>
                        </div>

                        {/* Selector Derecha */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-[600px] overflow-y-auto">
                            <h3 className="font-bold text-sm text-gray-400 uppercase mb-4">Click para agregar al ticket</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {products.map(p => (
                                    <button key={p.id} onClick={() => handleAddManualItem(p)} className="text-left p-3 border rounded-xl hover:bg-gray-50 hover:border-black transition-all flex justify-between items-center group">
                                        <span className="font-bold text-sm group-hover:text-black">{p.name}</span>
                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">${p.price}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- 3. DISEÑO (CONFIG WEB) --- */}
                {activeTab === 'design' && (
                    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm max-w-2xl mx-auto">
                        <h2 className="font-black text-xl mb-6 flex items-center gap-2"><Video size={24} /> Configuración Visual Home</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Video Portada (URL)</label>
                                <input value={siteConfig.hero_video_url} onChange={e => setSiteConfig({ ...siteConfig, hero_video_url: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-mono text-sm focus:border-black outline-none" placeholder="https://..." />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[1, 2, 3].map(n => (
                                    <div key={n}>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Categoría {n}</label>
                                        <input value={siteConfig[`cat${n}_title`]} onChange={e => setSiteConfig({ ...siteConfig, [`cat${n}_title`]: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-black outline-none" />
                                    </div>
                                ))}
                            </div>
                            <Button onClick={handleConfigSave} className="w-full bg-black text-white py-4 rounded-xl font-bold shadow-lg">GUARDAR DISEÑO</Button>
                        </div>
                    </div>
                )}

                {/* --- 4. ALL SALES --- */}
                {activeTab === 'all_sales' && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="font-black text-lg">Historial de Ventas</h2>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                                <tr><th className="p-4">Fecha</th><th className="p-4">Cliente</th><th className="p-4">Origen</th><th className="p-4">Total</th><th className="p-4">Estado</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {allSales.map(s => (
                                    <tr key={s.id} className="hover:bg-gray-50">
                                        <td className="p-4">{new Date(s.date).toLocaleDateString()}</td>
                                        <td className="p-4 font-bold">{s.client}</td>
                                        <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${s.origin === 'MANUAL' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{s.origin}</span></td>
                                        <td className="p-4 font-black">${s.total}</td>
                                        <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${s.status === 'Pagado' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{s.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* --- 5. BANNERS --- */}
                {activeTab === 'banners' && (
                    <div className="bg-white p-6 rounded-2xl border shadow-sm">
                        <h2 className="font-bold text-lg mb-4">Gestión de Banners</h2>
                        <form onSubmit={handleBannerSubmit} className="flex gap-4 items-end mb-6">
                            <div className="flex-1 border-2 border-dashed border-gray-200 p-3 rounded-xl cursor-pointer relative">
                                <input type="file" onChange={e => setBannerImageFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                                <p className="text-center text-xs font-bold text-gray-400">{bannerImageFile ? bannerImageFile.name : 'Click para subir imagen'}</p>
                            </div>
                            <Button type="submit" className="bg-black text-white px-6 py-3 rounded-xl font-bold">SUBIR</Button>
                        </form>
                        <div className="grid grid-cols-2 gap-4">
                            {banners.map(b => <img key={b.id} src={b.image_url} className="w-full rounded-xl border shadow-sm" alt="" />)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}