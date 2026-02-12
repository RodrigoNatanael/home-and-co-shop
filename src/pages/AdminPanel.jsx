import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseclient';
import { Trash2, Plus, Search, Package, ShoppingBag, Smartphone, Video, Tag, User, DollarSign, Send, Power, Layers } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { generateProductDescription } from '../services/ai';

export default function AdminPanel() {
    // --- ESTADOS PRINCIPALES ---
    const [activeTab, setActiveTab] = useState('products');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);

    // --- DATOS ---
    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [combos, setCombos] = useState([]);
    const [allSales, setAllSales] = useState([]); // Mezcla de Manuales y Web
    const [wheelConfig, setWheelConfig] = useState([]);
    const [isWheelActive, setIsWheelActive] = useState(false);
    const [siteConfig, setSiteConfig] = useState({ hero_video_url: '', cat1_title: '', cat2_title: '', cat3_title: '' });
    const [availableCategories, setAvailableCategories] = useState([]);

    // --- FORMULARIOS ---
    const [productFormData, setProductFormData] = useState({
        name: '', price: '', category: '', description: '', stock: '', tags: '', variants: []
    });
    const [productImageFile, setProductImageFile] = useState(null);

    const [manualSaleFormData, setManualSaleFormData] = useState({
        seller: 'Rodrigo', client_name: '', client_phone: '', items: [], total_amount: 0, paid_amount: ''
    });

    const [bannerFormData, setBannerFormData] = useState({ title: '', link: '' });
    const [bannerImageFile, setBannerImageFile] = useState(null);
    const [comboFormData, setComboFormData] = useState({ name: '', price: '' });
    const [selectedProductIds, setSelectedProductIds] = useState([]);

    // --- CARGA INICIAL ---
    useEffect(() => {
        refreshAllData();
    }, []);

    const refreshAllData = async () => {
        fetchProducts();
        fetchBanners();
        fetchCombos();
        fetchSalesAndLeads();
        fetchWheelData();
        fetchSiteConfig();
    };

    // --- FETCH FUNCTIONS ---
    const fetchProducts = async () => {
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (data) {
            setProducts(data);
            const cats = [...new Set(data.map(p => p.category).filter(Boolean))];
            setAvailableCategories(cats);
        }
    };

    const fetchSalesAndLeads = async () => {
        const { data: manual } = await supabase.from('manual_sales').select('*').order('created_at', { ascending: false });
        const { data: leads } = await supabase.from('leads').select('*').order('created_at', { ascending: false });

        const manualNorm = (manual || []).map(s => ({
            id: s.id, date: s.created_at, client: s.client_name, phone: s.client_phone,
            total: s.total_amount, paid: s.paid_amount, seller: s.seller,
            status: s.status, origin: 'MANUAL', items: s.items_json
        }));

        const leadsNorm = (leads || []).map(l => {
            const meta = typeof l.metadata === 'string' ? JSON.parse(l.metadata) : l.metadata;
            return {
                id: l.id, date: l.created_at, client: l.name, phone: meta?.shipping?.phone || '',
                total: meta?.total || 0, paid: meta?.total || 0, seller: 'Web',
                status: 'Pagado', origin: 'WEB', items: meta?.items
            };
        });

        setAllSales([...manualNorm, ...leadsNorm].sort((a, b) => new Date(b.date) - new Date(a.date)));
    };

    const fetchWheelData = async () => {
        const { data: w } = await supabase.from('wheel_config').select('*').order('id');
        if (w) setWheelConfig(w);
    };

    const fetchSiteConfig = async () => {
        const { data } = await supabase.from('site_config').select('*');
        if (data) {
            const configObj = {};
            data.forEach(item => configObj[item.id] = item.value);
            setSiteConfig(prev => ({ ...prev, ...configObj }));
            setIsWheelActive(configObj.is_wheel_active === 'true');
        }
    };

    const fetchBanners = async () => {
        const { data } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
        if (data) setBanners(data);
    };

    const fetchCombos = async () => {
        const { data } = await supabase.from('combos').select('*').order('created_at', { ascending: false });
        if (data) setCombos(data);
    };

    // --- ACTIONS ---
    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        let imageUrl = null;
        if (productImageFile) {
            const fileName = `prod_${Date.now()}_${productImageFile.name}`;
            await supabase.storage.from('product-images').upload(fileName, productImageFile);
            imageUrl = supabase.storage.from('product-images').getPublicUrl(fileName).data.publicUrl;
        }

        // Tags logic
        const tagsArray = productFormData.tags.split(',').map(t => t.trim()).filter(Boolean);

        await supabase.from('products').insert([{
            ...productFormData,
            price: parseFloat(productFormData.price),
            stock: parseInt(productFormData.stock),
            image_url: imageUrl,
            tags: tagsArray
        }]);

        alert("¡Producto cargado!");
        setProductFormData({ name: '', price: '', category: '', description: '', stock: '', tags: '', variants: [] });
        setProductImageFile(null);
        refreshAllData();
        setUploading(false);
    };

    const handleManualSaleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        const paid = parseFloat(manualSaleFormData.paid_amount) || 0;
        const total = manualSaleFormData.total_amount;
        const status = paid >= total ? 'Pagado' : 'Pendiente'; // Lógica de Seña

        await supabase.from('manual_sales').insert([{
            seller: manualSaleFormData.seller,
            client_name: manualSaleFormData.client_name,
            client_phone: manualSaleFormData.client_phone,
            items_json: manualSaleFormData.items,
            total_amount: total,
            paid_amount: paid,
            status,
            date: new Date().toISOString()
        }]);

        alert("Venta registrada correctamente");
        setManualSaleFormData({ seller: 'Rodrigo', client_name: '', client_phone: '', items: [], total_amount: 0, paid_amount: '' });
        refreshAllData();
        setUploading(false);
    };

    const handleAddManualItem = (product) => {
        setManualSaleFormData(prev => {
            const newItems = [...prev.items, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
            const newTotal = newItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
            return { ...prev, items: newItems, total_amount: newTotal };
        });
    };

    const handleCloseDay = () => {
        // Filtrar solo ventas de HOY
        const today = new Date().toLocaleDateString();
        const salesToday = allSales.filter(s => new Date(s.date).toLocaleDateString() === today);
        const total = salesToday.reduce((acc, s) => acc + (parseFloat(s.paid) || 0), 0);

        const message = `📊 *CIERRE DE CAJA - ${today}*\n\n💰 Total Recaudado: $${total.toLocaleString()}\n📦 Ventas: ${salesToday.length}\n\n_Generado por Admin Panel_`;
        window.open(`https://wa.me/5492617523156?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleBannerSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        let url = '';
        if (bannerImageFile) {
            const fileName = `banner_${Date.now()}`;
            await supabase.storage.from('product-images').upload(fileName, bannerImageFile);
            url = supabase.storage.from('product-images').getPublicUrl(fileName).data.publicUrl;
        }
        await supabase.from('banners').insert([{ ...bannerFormData, image_url: url }]);
        fetchBanners();
        setUploading(false);
    };

    const handleConfigSave = async () => {
        const updates = Object.keys(siteConfig).map(k => ({ id: k, value: siteConfig[k] }));
        await supabase.from('site_config').upsert(updates);
        alert("Diseño actualizado");
    };

    const toggleWheel = async () => {
        const next = !isWheelActive;
        setIsWheelActive(next);
        await supabase.from('site_config').upsert({ id: 'is_wheel_active', value: String(next) });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12 font-sans">
            {/* --- HEADER SUPERIOR --- */}
            <div className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-2xl font-black italic tracking-tighter">ADMIN <span className="text-brand-primary">H&C</span></h1>

                        {/* Menú Desktop */}
                        <div className="hidden lg:flex gap-1 bg-gray-100 p-1 rounded-lg">
                            {['products', 'manual_sales', 'all_sales', 'banners', 'combos', 'design', 'wheel'].map(t => (
                                <button key={t} onClick={() => setActiveTab(t)}
                                    className={`px-4 py-2 text-xs font-bold uppercase rounded-md transition-all ${activeTab === t ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-900'}`}>
                                    {t.replace('_', ' ')}
                                </button>
                            ))}
                        </div>

                        {/* Menú Mobile */}
                        <button className="lg:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            <div className="space-y-1.5"><span className="block w-6 h-0.5 bg-black"></span><span className="block w-6 h-0.5 bg-black"></span><span className="block w-6 h-0.5 bg-black"></span></div>
                        </button>
                    </div>
                </div>
                {/* Desplegable Mobile */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden bg-white border-t p-2">
                        {['products', 'manual_sales', 'all_sales', 'banners', 'combos', 'design', 'wheel'].map(t => (
                            <button key={t} onClick={() => { setActiveTab(t); setIsMobileMenuOpen(false); }} className="block w-full text-left p-3 font-bold uppercase text-sm border-b last:border-0">{t.replace('_', ' ')}</button>
                        ))}
                    </div>
                )}
            </div>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <div className="max-w-7xl mx-auto px-4 py-8">

                {/* 1. SECCIÓN PRODUCTOS (MEJORADA) */}
                {activeTab === 'products' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-2xl border shadow-sm h-fit">
                            <h2 className="font-black text-lg mb-4 uppercase flex items-center gap-2"><Package size={20} /> Nuevo Producto</h2>
                            <form onSubmit={handleProductSubmit} className="space-y-4">
                                <input placeholder="Nombre del Producto" value={productFormData.name} onChange={e => setProductFormData({ ...productFormData, name: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold focus:border-black outline-none" required />
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="number" placeholder="Precio" value={productFormData.price} onChange={e => setProductFormData({ ...productFormData, price: e.target.value })} className="border-2 border-gray-100 p-3 rounded-xl font-bold" required />
                                    <input type="number" placeholder="Stock" value={productFormData.stock} onChange={e => setProductFormData({ ...productFormData, stock: e.target.value })} className="border-2 border-gray-100 p-3 rounded-xl" required />
                                </div>
                                <input placeholder="Categoría (Mates, Termos...)" list="cats" value={productFormData.category} onChange={e => setProductFormData({ ...productFormData, category: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl" required />
                                <datalist id="cats">{availableCategories.map(c => <option key={c} value={c} />)}</datalist>

                                <input placeholder="Etiquetas (ej: Nuevo, Oferta, Premium)" value={productFormData.tags} onChange={e => setProductFormData({ ...productFormData, tags: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl text-sm" />

                                <textarea placeholder="Descripción..." value={productFormData.description} onChange={e => setProductFormData({ ...productFormData, description: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl h-24 text-sm" />
                                <div className="border-2 border-dashed border-gray-200 p-4 rounded-xl text-center">
                                    <input type="file" onChange={e => setProductImageFile(e.target.files[0])} className="w-full text-xs" />
                                </div>
                                <Button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold" disabled={uploading}>{uploading ? 'Subiendo...' : 'Guardar Producto'}</Button>
                            </form>
                        </div>
                        <div className="lg:col-span-2 space-y-3">
                            {products.map(p => (
                                <div key={p.id} className="bg-white p-4 rounded-xl border flex justify-between items-center hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <img src={p.image_url} className="w-12 h-12 rounded-lg object-cover border" />
                                        <div>
                                            <p className="font-black text-sm">{p.name}</p>
                                            <div className="flex gap-2 text-xs text-gray-500">
                                                <span>{p.category}</span>
                                                <span className="font-bold text-black">${p.price}</span>
                                                {p.tags && p.tags.map(t => <span key={t} className="bg-gray-100 px-1 rounded text-[10px] uppercase">{t}</span>)}
                                            </div>
                                        </div>
                                    </div>
                                    <button className="text-gray-300 hover:text-red-500"><Trash2 size={18} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. VENTAS MANUALES (OPTIMIZADA: Vendedor + Seña) */}
                {activeTab === 'manual_sales' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-2xl border shadow-sm">
                            <h2 className="font-black text-lg mb-4 uppercase flex items-center gap-2"><User size={20} /> Datos de Venta</h2>
                            <form onSubmit={handleManualSaleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <select value={manualSaleFormData.seller} onChange={e => setManualSaleFormData({ ...manualSaleFormData, seller: e.target.value })} className="border-2 border-gray-100 p-3 rounded-xl font-bold">
                                        <option value="Rodrigo">Rodrigo</option>
                                        <option value="Vane">Vane</option>
                                    </select>
                                    <input placeholder="Teléfono (WhatsApp)" value={manualSaleFormData.client_phone} onChange={e => setManualSaleFormData({ ...manualSaleFormData, client_phone: e.target.value })} className="border-2 border-gray-100 p-3 rounded-xl" />
                                </div>
                                <input placeholder="Nombre Cliente" value={manualSaleFormData.client_name} onChange={e => setManualSaleFormData({ ...manualSaleFormData, client_name: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl" required />

                                {/* Lista de productos seleccionados */}
                                <div className="bg-gray-50 p-4 rounded-xl min-h-[100px]">
                                    {manualSaleFormData.items.map((item, i) => (
                                        <div key={i} className="flex justify-between text-sm mb-1">
                                            <span>{item.name}</span>
                                            <span className="font-bold">${item.price}</span>
                                        </div>
                                    ))}
                                    <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-black">
                                        <span>TOTAL</span>
                                        <span>${manualSaleFormData.total_amount}</span>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                                    <label className="text-xs font-bold text-yellow-700 uppercase">¿Cuánto pagó? (Seña/Total)</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <DollarSign size={16} className="text-yellow-600" />
                                        <input type="number" value={manualSaleFormData.paid_amount} onChange={e => setManualSaleFormData({ ...manualSaleFormData, paid_amount: e.target.value })} className="bg-transparent font-black text-lg w-full outline-none" placeholder="0" />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold">REGISTRAR VENTA</Button>
                            </form>
                        </div>

                        {/* Buscador de productos para agregar */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border shadow-sm">
                            <h3 className="font-bold text-sm text-gray-400 uppercase mb-4">Click para agregar al ticket</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-96 overflow-y-auto">
                                {products.map(p => (
                                    <button key={p.id} onClick={() => handleAddManualItem(p)} className="text-left p-3 border rounded-xl hover:bg-gray-50 flex justify-between items-center group">
                                        <span className="font-bold text-sm group-hover:text-brand-primary">{p.name}</span>
                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">${p.price}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. TODAS LAS VENTAS (Métricas + Cierre) */}
                {activeTab === 'all_sales' && (
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-3xl border shadow-md flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h2 className="text-3xl font-black italic">PANEL DE CONTROL</h2>
                                <p className="text-gray-500 font-medium">Resumen de operaciones (Web + Manuales)</p>
                            </div>
                            <Button onClick={handleCloseDay} className="bg-green-600 text-white px-8 py-4 rounded-xl font-black shadow-lg shadow-green-200 flex items-center gap-2 hover:bg-green-700">
                                <Send size={20} /> CERRAR JORNADA (WHATSAPP)
                            </Button>
                        </div>
                        <div className="bg-white rounded-2xl border overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                                    <tr><th className="p-4">Fecha</th><th className="p-4">Cliente</th><th className="p-4">Vendedor/Canal</th><th className="p-4">Total</th><th className="p-4">Pagado</th><th className="p-4">Estado</th></tr>
                                </thead>
                                <tbody className="divide-y">
                                    {allSales.map(s => (
                                        <tr key={s.id} className="hover:bg-gray-50">
                                            <td className="p-4">{new Date(s.date).toLocaleDateString()}</td>
                                            <td className="p-4 font-bold">{s.client} <span className="text-xs font-normal text-gray-400 block">{s.phone}</span></td>
                                            <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${s.origin === 'WEB' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{s.seller || s.origin}</span></td>
                                            <td className="p-4 font-black">${s.total}</td>
                                            <td className="p-4">${s.paid}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${s.status === 'Pagado' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{s.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 4. DISEÑO Y BANNERS */}
                {activeTab === 'design' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-2xl border shadow-sm">
                            <h2 className="font-black text-lg mb-4 flex items-center gap-2"><Video size={20} /> Video de Portada</h2>
                            <div className="space-y-4">
                                <input value={siteConfig.hero_video_url} onChange={e => setSiteConfig({ ...siteConfig, hero_video_url: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl text-sm font-mono" placeholder="URL del video (Cloudinary/YouTube)" />
                                <div className="aspect-video bg-black rounded-xl overflow-hidden relative">
                                    {siteConfig.hero_video_url ? (
                                        <video src={siteConfig.hero_video_url} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                                    ) : <p className="text-white absolute inset-0 flex items-center justify-center">Sin Video</p>}
                                </div>
                                <Button onClick={handleConfigSave} className="w-full bg-black text-white py-3 rounded-xl font-bold">ACTUALIZAR PORTADA</Button>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border shadow-sm">
                            <h2 className="font-black text-lg mb-4 flex items-center gap-2"><Layers size={20} /> Categorías Destacadas</h2>
                            <div className="space-y-3">
                                <input value={siteConfig.cat1_title} onChange={e => setSiteConfig({ ...siteConfig, cat1_title: e.target.value })} className="w-full border p-2 rounded-lg" placeholder="Título Categoría 1" />
                                <input value={siteConfig.cat2_title} onChange={e => setSiteConfig({ ...siteConfig, cat2_title: e.target.value })} className="w-full border p-2 rounded-lg" placeholder="Título Categoría 2" />
                                <input value={siteConfig.cat3_title} onChange={e => setSiteConfig({ ...siteConfig, cat3_title: e.target.value })} className="w-full border p-2 rounded-lg" placeholder="Título Categoría 3" />
                                <Button onClick={handleConfigSave} className="w-full bg-gray-900 text-white py-2 rounded-lg font-bold">GUARDAR TEXTOS</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. RULETA (ON/OFF SIMPLE) */}
                {activeTab === 'wheel' && (
                    <div className={`p-8 rounded-3xl border-4 text-center transition-colors ${isWheelActive ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                        <h2 className="text-4xl font-black italic uppercase mb-2">RULETA {isWheelActive ? 'ENCENDIDA' : 'APAGADA'}</h2>
                        <p className="text-gray-500 mb-6">Si la ruleta da errores, mantenela apagada.</p>
                        <button onClick={toggleWheel} className={`px-10 py-4 rounded-full font-black text-white shadow-lg text-xl ${isWheelActive ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 hover:bg-gray-500'}`}>
                            {isWheelActive ? 'APAGAR SISTEMA' : 'ENCENDER SISTEMA'}
                        </button>
                    </div>
                )}

                {/* OTRAS PESTAÑAS (Banners / Combos) */}
                {activeTab === 'banners' && (
                    <div className="bg-white p-6 rounded-2xl border">
                        <h2 className="font-bold text-lg mb-4">Subir Nuevo Banner</h2>
                        <form onSubmit={handleBannerSubmit} className="flex gap-4 items-end">
                            <div className="flex-1"><input type="file" onChange={e => setBannerImageFile(e.target.files[0])} className="w-full text-xs" /></div>
                            <Button type="submit" disabled={uploading}>SUBIR</Button>
                        </form>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            {banners.map(b => <img key={b.id} src={b.image_url} className="w-full rounded-xl border" />)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}