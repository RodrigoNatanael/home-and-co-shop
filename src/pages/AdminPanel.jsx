import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseclient';
import { Trash2, Upload, Plus, Save, Image as ImageIcon, Package, CheckSquare, Square, User, DollarSign, FileText, MessageCircle, Globe, ShoppingBag, TrendingUp, Search, Calendar, Dices, Gift, Palette } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { generateProductDescription } from '../services/ai';

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('products');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // <--- ESTA FALTABA Y ROMPIA LA WEB
    const [newSalesCount, setNewSalesCount] = useState(0);
    const [uploading, setUploading] = useState(false);

    // --- PRODUCTS STATE ---
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [productFormData, setProductFormData] = useState({
        id: '', name: '', price: '', category: '', description: '', stock: '', previous_price: '', cost_price: '', tags: []
    });
    const [productImageFile, setProductImageFile] = useState(null);
    const [generatingAI, setGeneratingAI] = useState(false);

    // --- BANNERS STATE ---
    const [banners, setBanners] = useState([]);
    const [loadingBanners, setLoadingBanners] = useState(false);
    const [bannerFormData, setBannerFormData] = useState({ title: '', link: '' });
    const [bannerImageFile, setBannerImageFile] = useState(null);

    // --- COMBOS STATE ---
    const [combos, setCombos] = useState([]);
    const [loadingCombos, setLoadingCombos] = useState(false);
    const [comboFormData, setComboFormData] = useState({ name: '', price: '', stock: '' });
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [comboImageFile, setComboImageFile] = useState(null);

    // --- SALES STATE ---
    const [manualSales, setManualSales] = useState([]);
    const [allSales, setAllSales] = useState([]);
    const [manualSaleFormData, setManualSaleFormData] = useState({
        seller: 'Rodrigo', client_name: '', client_phone: '', items: [], total_amount: 0, paid_amount: ''
    });
    const [paymentModal, setPaymentModal] = useState({ open: false, sale: null, amount: '' });
    const [deleteModal, setDeleteModal] = useState({ open: false, sale: null, reason: '' });

    // --- RULETA & SITE CONFIG STATE ---
    const [wheelConfig, setWheelConfig] = useState([]);
    const [wheelLeads, setWheelLeads] = useState([]);
    const [siteConfig, setSiteConfig] = useState({
        hero_video_url: '', cat1_img: '', cat1_link: '', cat1_title: '',
        cat2_img: '', cat2_link: '', cat2_title: '', cat3_img: '', cat3_link: '', cat3_title: ''
    });
    const [availableCategories, setAvailableCategories] = useState([]);

    useEffect(() => {
        fetchProducts();
        fetchBanners();
        fetchCombos();
        fetchManualSales();
        fetchAllSales();
        fetchWheelData();
        fetchSiteConfig();
        fetchUniqueCategories();
    }, []);

    // --- FUNCIONES DE CARGA (FETCH) ---
    const fetchSiteConfig = async () => {
        const { data } = await supabase.from('site_config').select('*');
        if (data) {
            const newConfig = { ...siteConfig };
            data.forEach(item => { newConfig[item.id] = item.value; });
            setSiteConfig(newConfig);
        }
    };

    const fetchUniqueCategories = async () => {
        const { data } = await supabase.from('products').select('category');
        if (data) {
            const unique = [...new Set(data.map(item => item.category))].filter(Boolean);
            setAvailableCategories(unique);
        }
    };

    const fetchProducts = async () => {
        setLoadingProducts(true);
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        setProducts(data || []);
        setLoadingProducts(false);
    };

    const fetchBanners = async () => {
        const { data } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
        setBanners(data || []);
    };

    const fetchCombos = async () => {
        const { data } = await supabase.from('combos').select('*').order('created_at', { ascending: false });
        setCombos(data || []);
    };

    const fetchManualSales = async () => {
        const { data } = await supabase.from('manual_sales').select('*').order('created_at', { ascending: false });
        setManualSales(data || []);
    };

    const fetchAllSales = async () => {
        const { data: manual } = await supabase.from('manual_sales').select('*').order('created_at', { ascending: false });
        const { data: leads } = await supabase.from('leads').select('*').order('created_at', { ascending: false });

        const manualNorm = (manual || []).map(s => ({
            id: s.id, date: s.created_at, client: s.client_name, total: s.total_amount, paid: s.paid_amount,
            status: s.status, origin: 'MANUAL', items: s.items_json || []
        }));
        const leadsNorm = (leads || []).map(l => {
            const meta = typeof l.metadata === 'string' ? JSON.parse(l.metadata) : l.metadata;
            return {
                id: l.id, date: l.created_at, client: l.name, total: meta?.total || 0, paid: meta?.total || 0,
                status: 'Pagado', origin: 'WEB', items: meta?.items || []
            };
        });
        setAllSales([...manualNorm, ...leadsNorm].sort((a, b) => new Date(b.date) - new Date(a.date)));
    };

    const fetchWheelData = async () => {
        const { data: config } = await supabase.from('wheel_config').select('*').order('id');
        const { data: leads } = await supabase.from('wheel_leads').select('*').order('created_at', { ascending: false });
        if (config) setWheelConfig(config);
        if (leads) setWheelLeads(leads);
    };

    // --- HANDLERS (Guardar, Editar, Borrar) ---
    const handleGenerateDescription = async () => {
        if (!productFormData.name || !productFormData.category) return alert('Poné nombre y categoría primero.');
        setGeneratingAI(true);
        const desc = await generateProductDescription(productFormData.name, productFormData.category);
        setProductFormData(prev => ({ ...prev, description: desc }));
        setGeneratingAI(false);
    };

    const handleConfigChange = (e) => {
        const { name, value } = e.target;
        setSiteConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveConfig = async () => {
        setUploading(true);
        const updates = Object.keys(siteConfig).map(k => ({ id: k, value: siteConfig[k] }));
        await supabase.from('site_config').upsert(updates);
        alert('Configuración guardada!');
        setUploading(false);
    };

    const handleCategorySelect = (e, prefix) => {
        const val = e.target.value;
        setSiteConfig(prev => ({ ...prev, [`${prefix}_title`]: val, [`${prefix}_link`]: `/catalog?category=${val}` }));
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        let imageUrl = null;
        if (productImageFile) {
            const fileName = `prod_${Date.now()}_${productImageFile.name}`;
            await supabase.storage.from('product-images').upload(fileName, productImageFile);
            imageUrl = supabase.storage.from('product-images').getPublicUrl(fileName).data.publicUrl;
        }
        await supabase.from('products').insert([{
            ...productFormData,
            price: parseFloat(productFormData.price),
            stock: parseInt(productFormData.stock) || 0,
            image_url: imageUrl
        }]);
        alert('Producto creado!');
        setProductFormData({ id: '', name: '', price: '', category: '', description: '', stock: '', tags: [] });
        setProductImageFile(null);
        fetchProducts();
        setUploading(false);
    };

    const handleProductDelete = async (id) => {
        if (confirm('¿Borrar?')) {
            await supabase.from('products').delete().eq('id', id);
            fetchProducts();
        }
    };

    const handleBannerSubmit = async (e) => {
        e.preventDefault();
        if (!bannerImageFile) return alert('Falta imagen');
        setUploading(true);
        const fileName = `banner_${Date.now()}_${bannerImageFile.name}`;
        await supabase.storage.from('product-images').upload(fileName, bannerImageFile);
        const url = supabase.storage.from('product-images').getPublicUrl(fileName).data.publicUrl;
        await supabase.from('banners').insert([{ title: bannerFormData.title, link: bannerFormData.link, image_url: url }]);
        alert('Banner creado');
        fetchBanners();
        setUploading(false);
    };

    const handleBannerDelete = async (id) => {
        if (confirm('¿Borrar banner?')) {
            await supabase.from('banners').delete().eq('id', id);
            fetchBanners();
        }
    };

    const handleComboSubmit = async (e) => {
        e.preventDefault();
        if (selectedProductIds.length === 0) return alert('Elegí productos para el combo');
        setUploading(true);
        const productsJson = products.filter(p => selectedProductIds.includes(p.id)).map(p => ({ id: p.id, name: p.name }));
        await supabase.from('combos').insert([{ name: comboFormData.name, price: parseFloat(comboFormData.price), products_json: productsJson }]);
        alert('Combo creado');
        fetchCombos();
        setUploading(false);
    };

    const handleManualSaleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        const paid = parseFloat(manualSaleFormData.paid_amount) || 0;
        const status = paid >= manualSaleFormData.total_amount ? 'Pagado' : 'Pendiente';
        await supabase.from('manual_sales').insert([{
            seller: manualSaleFormData.seller, client_name: manualSaleFormData.client_name,
            items_json: manualSaleFormData.items, total_amount: manualSaleFormData.total_amount,
            paid_amount: paid, status, date: new Date().toISOString()
        }]);
        alert('Venta registrada');
        fetchManualSales();
        fetchAllSales();
        setUploading(false);
    };

    const handleAddManualItem = (id) => {
        const item = products.find(i => i.id === id);
        if (!item) return;
        setManualSaleFormData(prev => {
            const newItems = [...prev.items, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
            const total = newItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
            return { ...prev, items: newItems, total_amount: total };
        });
    };

    const handleUpdateWheelConfig = async (id, field, value) => {
        setWheelConfig(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
        await supabase.from('wheel_config').update({ [field]: value }).eq('id', id);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12 transition-colors">
            {/* MOBILE HEADER */}
            <div className="lg:hidden sticky top-0 z-50 bg-white border-b shadow-sm p-4 flex justify-between items-center">
                <h1 className="font-bold text-xl">Admin Panel</h1>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-gray-100 rounded">
                    <div className="space-y-1"><span className="block w-5 h-0.5 bg-black"></span><span className="block w-5 h-0.5 bg-black"></span></div>
                </button>
            </div>

            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="absolute top-[60px] left-0 right-0 bg-white p-4 space-y-2">
                        {['products', 'manual_sales', 'all_sales', 'banners', 'combos', 'wheel', 'design'].map(t => (
                            <button key={t} onClick={() => setActiveTab(t)} className="w-full text-left p-3 bg-gray-50 rounded font-bold uppercase">{t.replace('_', ' ')}</button>
                        ))}
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 md:pt-10">
                {/* DESKTOP NAV */}
                <div className="hidden lg:flex justify-between mb-8 border-b pb-4 items-center">
                    <h1 className="font-bold text-3xl">Administración</h1>
                    <div className="flex bg-gray-200 p-1 rounded-lg gap-1">
                        {['products', 'manual_sales', 'all_sales', 'banners', 'combos', 'wheel', 'design'].map(t => (
                            <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-md text-xs font-bold uppercase transition-all ${activeTab === t ? 'bg-white shadow-md text-black' : 'text-gray-500'}`}>
                                {t.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* CONTENIDO PESTAÑAS */}

                {/* 1. DISEÑO (VIDEOS Y CATEGORIAS) */}
                {activeTab === 'design' && (
                    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl border shadow-sm">
                        <h2 className="font-bold text-xl mb-6">Configuración del Sitio (Home)</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold mb-2">Video Hero (Banner Principal URL)</label>
                                <input name="hero_video_url" value={siteConfig.hero_video_url} onChange={handleConfigChange} className="w-full border p-2 rounded" placeholder="https://..." />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[1, 2, 3].map(n => (
                                    <div key={n} className="p-4 bg-gray-50 rounded border">
                                        <p className="font-bold mb-2">Categoría {n}</p>
                                        <select onChange={(e) => handleCategorySelect(e, `cat${n}`)} className="w-full border p-2 rounded mb-2 text-sm">
                                            <option value="">Seleccionar de existentes...</option>
                                            {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <input name={`cat${n}_title`} value={siteConfig[`cat${n}_title`]} onChange={handleConfigChange} placeholder="Título Manual" className="w-full border p-2 rounded mb-2 text-sm" />
                                        <input name={`cat${n}_img`} value={siteConfig[`cat${n}_img`]} onChange={handleConfigChange} placeholder="URL Imagen/Video Fondo" className="w-full border p-2 rounded text-sm" />
                                    </div>
                                ))}
                            </div>
                            <Button onClick={handleSaveConfig} className="w-full py-3 bg-black text-white font-bold rounded">Guardar Cambios de Diseño</Button>
                        </div>
                    </div>
                )}

                {/* 2. PRODUCTOS (CARGA COMPLETA) */}
                {activeTab === 'products' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-xl border shadow-sm h-fit">
                            <h2 className="font-bold text-xl mb-4">Cargar Producto</h2>
                            <form onSubmit={handleProductSubmit} className="space-y-3">
                                <input name="name" value={productFormData.name} onChange={e => setProductFormData({ ...productFormData, name: e.target.value })} placeholder="Nombre" className="w-full border p-2 rounded" />
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="number" name="price" value={productFormData.price} onChange={e => setProductFormData({ ...productFormData, price: e.target.value })} placeholder="Precio" className="border p-2 rounded" />
                                    <input type="number" name="stock" value={productFormData.stock} onChange={e => setProductFormData({ ...productFormData, stock: e.target.value })} placeholder="Stock" className="border p-2 rounded" />
                                </div>
                                <select name="category" value={productFormData.category} onChange={e => setProductFormData({ ...productFormData, category: e.target.value })} className="w-full border p-2 rounded">
                                    <option value="">Categoría...</option>
                                    <option value="Mates">Mates</option><option value="Termos">Termos</option><option value="Combos">Combos</option><option value="Bombillas">Bombillas</option>
                                </select>
                                <textarea name="description" value={productFormData.description} onChange={e => setProductFormData({ ...productFormData, description: e.target.value })} placeholder="Descripción" className="w-full border p-2 rounded h-24" />
                                <button type="button" onClick={handleGenerateDescription} className="text-xs text-blue-600 font-bold mb-2">✨ Generar con IA</button>
                                <div className="border p-2 rounded bg-gray-50">
                                    <p className="text-xs mb-1 font-bold">Imagen Principal</p>
                                    <input type="file" onChange={e => setProductImageFile(e.target.files[0])} className="text-xs w-full" />
                                </div>
                                <Button type="submit" className="w-full bg-black text-white py-2 rounded font-bold" disabled={uploading}>{uploading ? 'Subiendo...' : 'Guardar Producto'}</Button>
                            </form>
                        </div>
                        <div className="lg:col-span-2 space-y-2">
                            {products.map(p => (
                                <div key={p.id} className="p-4 bg-white border rounded flex justify-between items-center">
                                    <div className="flex gap-4 items-center">
                                        <img src={p.image_url} className="w-12 h-12 object-cover rounded" />
                                        <div><p className="font-bold">{p.name}</p><p className="text-xs text-gray-500">{p.category} | ${p.price}</p></div>
                                    </div>
                                    <button onClick={() => handleProductDelete(p.id)} className="text-red-500"><Trash2 size={18} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. BANNERS */}
                {activeTab === 'banners' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-xl border shadow-sm h-fit">
                            <h2 className="font-bold text-xl mb-4">Subir Banner</h2>
                            <form onSubmit={handleBannerSubmit} className="space-y-4">
                                <input placeholder="Título (Opcional)" value={bannerFormData.title} onChange={e => setBannerFormData({ ...bannerFormData, title: e.target.value })} className="w-full border p-2 rounded" />
                                <input placeholder="Link destino (/catalog...)" value={bannerFormData.link} onChange={e => setBannerFormData({ ...bannerFormData, link: e.target.value })} className="w-full border p-2 rounded" />
                                <input type="file" onChange={e => setBannerImageFile(e.target.files[0])} className="w-full" />
                                <Button type="submit" className="w-full bg-black text-white py-2 rounded font-bold" disabled={uploading}>Subir Banner</Button>
                            </form>
                        </div>
                        <div className="space-y-4">
                            {banners.map(b => (
                                <div key={b.id} className="bg-white p-2 rounded border relative">
                                    <img src={b.image_url} className="w-full h-32 object-cover rounded" />
                                    <button onClick={() => handleBannerDelete(b.id)} className="absolute top-2 right-2 bg-white p-1 rounded-full text-red-500 shadow"><Trash2 size={16} /></button>
                                    <p className="mt-2 font-bold text-sm text-center">{b.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. COMBOS */}
                {activeTab === 'combos' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-xl border shadow-sm h-fit">
                            <h2 className="font-bold text-xl mb-4">Crear Combo</h2>
                            <form onSubmit={handleComboSubmit} className="space-y-4">
                                <input name="name" value={comboFormData.name} onChange={e => setComboFormData({ ...comboFormData, name: e.target.value })} placeholder="Nombre Combo" className="w-full border p-2 rounded" />
                                <input type="number" name="price" value={comboFormData.price} onChange={e => setComboFormData({ ...comboFormData, price: e.target.value })} placeholder="Precio Final" className="w-full border p-2 rounded" />
                                <div className="h-40 overflow-y-auto border p-2 rounded bg-gray-50">
                                    <p className="text-xs font-bold mb-2">Seleccionar Productos:</p>
                                    {products.map(p => (
                                        <div key={p.id} className="flex items-center gap-2 mb-1">
                                            <input type="checkbox" onChange={(e) => {
                                                if (e.target.checked) setSelectedProductIds([...selectedProductIds, p.id]);
                                                else setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
                                            }} />
                                            <span className="text-xs">{p.name}</span>
                                        </div>
                                    ))}
                                </div>
                                <Button type="submit" className="w-full bg-black text-white py-2 rounded font-bold">Crear Combo</Button>
                            </form>
                        </div>
                        <div className="lg:col-span-2 space-y-2">
                            {combos.map(c => (
                                <div key={c.id} className="p-4 bg-white border rounded flex justify-between items-center">
                                    <div><p className="font-bold">{c.name}</p><p className="text-xs text-gray-500">${c.price}</p></div>
                                    <Trash2 className="text-gray-300" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 5. VENTAS MANUALES */}
                {activeTab === 'manual_sales' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-xl border shadow-sm">
                            <h2 className="font-bold text-xl mb-4">Nueva Venta</h2>
                            <form onSubmit={handleManualSaleSubmit} className="space-y-4">
                                <input placeholder="Cliente" value={manualSaleFormData.client_name} onChange={e => setManualSaleFormData({ ...manualSaleFormData, client_name: e.target.value })} className="w-full border p-2 rounded" />
                                <div className="h-40 overflow-y-auto border p-2 rounded">
                                    {products.map(p => (
                                        <div key={p.id} onClick={() => handleAddManualItem(p.id)} className="cursor-pointer hover:bg-gray-100 p-1 text-xs flex justify-between">
                                            <span>{p.name}</span><span>${p.price}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-gray-100 p-2 rounded text-sm">
                                    {manualSaleFormData.items.map((i, idx) => <div key={idx}>{i.name} (${i.price})</div>)}
                                    <div className="font-bold mt-2 border-t pt-1">Total: ${manualSaleFormData.total_amount}</div>
                                </div>
                                <Button type="submit" className="w-full bg-black text-white py-2 rounded font-bold">Registrar</Button>
                            </form>
                        </div>
                    </div>
                )}

                {/* 6. TODAS LAS VENTAS */}
                {activeTab === 'all_sales' && (
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h2 className="font-bold text-xl mb-4">Historial de Ventas</h2>
                        <table className="w-full text-left text-sm">
                            <thead><tr className="border-b"><th className="p-2">Fecha</th><th className="p-2">Cliente</th><th className="p-2">Total</th><th className="p-2">Estado</th></tr></thead>
                            <tbody>
                                {allSales.map(s => (
                                    <tr key={s.id} className="border-b">
                                        <td className="p-2">{new Date(s.date).toLocaleDateString()}</td>
                                        <td className="p-2">{s.client}</td>
                                        <td className="p-2 font-bold">${s.total}</td>
                                        <td className="p-2"><span className={`px-2 py-1 rounded text-xs ${s.status === 'Pagado' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{s.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 7. RULETA */}
                {activeTab === 'wheel' && (
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h2 className="font-bold text-xl mb-4">Configuración Ruleta</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr><th>Premio</th><th>Valor</th><th>%</th><th>Stock</th></tr></thead>
                                <tbody>
                                    {wheelConfig.map(p => (
                                        <tr key={p.id}>
                                            <td><input value={p.label} onChange={e => handleUpdateWheelConfig(p.id, 'label', e.target.value)} className="border p-1 w-full" /></td>
                                            <td><input value={p.value} onChange={e => handleUpdateWheelConfig(p.id, 'value', e.target.value)} className="border p-1 w-full" /></td>
                                            <td><input type="number" value={p.probability} onChange={e => handleUpdateWheelConfig(p.id, 'probability', e.target.value)} className="border p-1 w-16" /></td>
                                            <td><input type="number" value={p.stock} onChange={e => handleUpdateWheelConfig(p.id, 'stock', e.target.value)} className="border p-1 w-16" /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}