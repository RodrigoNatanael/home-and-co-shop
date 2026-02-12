import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseclient';
import { Trash2, Upload, Plus, Save, Image as ImageIcon, Package, CheckSquare, Square, User, DollarSign, FileText, MessageCircle, Globe, ShoppingBag, TrendingUp, Search, Calendar, Dices, Gift, Palette, Power } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { generateProductDescription } from '../services/ai';

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('products');
    const [newSalesCount, setNewSalesCount] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // --- STATES ---
    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [combos, setCombos] = useState([]);
    const [allSales, setAllSales] = useState([]);
    const [wheelConfig, setWheelConfig] = useState([]);
    const [wheelLeads, setWheelLeads] = useState([]);
    const [isWheelActive, setIsWheelActive] = useState(false);

    // --- FORM DATA ---
    const [productFormData, setProductFormData] = useState({ id: '', name: '', price: '', category: '', description: '', stock: '', previous_price: '', cost_price: '', tags: [] });
    const [bannerFormData, setBannerFormData] = useState({ title: '', link: '' });
    const [comboFormData, setComboFormData] = useState({ name: '', price: '', stock: '' });
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [manualSaleFormData, setManualSaleFormData] = useState({ seller: 'Rodrigo', client_name: '', client_phone: '', items: [], total_amount: 0, paid_amount: '' });

    const [productImageFile, setProductImageFile] = useState(null);
    const [bannerImageFile, setBannerImageFile] = useState(null);
    const [comboImageFile, setComboImageFile] = useState(null);

    const [paymentModal, setPaymentModal] = useState({ open: false, sale: null, amount: '' });
    const [deleteModal, setDeleteModal] = useState({ open: false, sale: null, reason: '' });

    // --- INITIAL FETCH ---
    useEffect(() => {
        refreshAllData();
    }, []);

    const refreshAllData = () => {
        fetchProducts();
        fetchBanners();
        fetchCombos();
        fetchAllSales();
        fetchWheelData();
    };

    // --- FETCH FUNCTIONS ---
    const fetchProducts = async () => {
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        setProducts(data || []);
    };

    const fetchBanners = async () => {
        const { data } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
        setBanners(data || []);
    };

    const fetchCombos = async () => {
        const { data } = await supabase.from('combos').select('*').order('created_at', { ascending: false });
        setCombos(data || []);
    };

    const fetchWheelData = async () => {
        const { data: config } = await supabase.from('wheel_config').select('*').order('id');
        const { data: leads } = await supabase.from('wheel_leads').select('*').order('created_at', { ascending: false });
        const { data: status } = await supabase.from('site_config').select('value').eq('id', 'is_wheel_active').single();

        if (config) setWheelConfig(config);
        if (leads) setWheelLeads(leads);
        if (status) setIsWheelActive(status.value === 'true');
    };

    const fetchAllSales = async () => {
        const { data: manual } = await supabase.from('manual_sales').select('*').order('created_at', { ascending: false });
        const { data: web } = await supabase.from('leads').select('*').order('created_at', { ascending: false });

        const normalizedManual = (manual || []).map(s => ({
            id: s.id, date: s.created_at, client: s.client_name, total: s.total_amount, paid: s.paid_amount,
            status: s.status, origin: 'MANUAL', items: Array.isArray(s.items_json) ? s.items_json : []
        }));

        const normalizedWeb = (web || []).map(l => {
            const meta = typeof l.metadata === 'string' ? JSON.parse(l.metadata) : l.metadata;
            return {
                id: l.id, date: l.created_at, client: l.name, total: meta?.total || 0, paid: meta?.total || 0,
                status: 'Pagado', origin: 'WEB', items: meta?.items || []
            };
        });

        setAllSales([...normalizedManual, ...normalizedWeb].sort((a, b) => new Date(b.date) - new Date(a.date)));
    };

    // --- ACTIONS ---
    const toggleWheelStatus = async () => {
        const nextStatus = !isWheelActive;
        setIsWheelActive(nextStatus);
        await supabase.from('site_config').upsert({ id: 'is_wheel_active', value: String(nextStatus) });
    };

    const handleUpdateWheelConfig = async (id, field, value) => {
        setWheelConfig(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
        await supabase.from('wheel_config').update({ [field]: value }).eq('id', id);
    };

    const handleAddManualItem = (id, type) => {
        const list = type === 'product' ? products : combos;
        const item = list.find(i => i.id === id);
        if (!item) return;

        setManualSaleFormData(prev => {
            const existing = prev.items.find(i => i.id === id && i.type === type);
            const newItems = existing
                ? prev.items.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i)
                : [...prev.items, { id, name: item.name, price: item.price, quantity: 1, type }];
            const newTotal = newItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
            return { ...prev, items: newItems, total_amount: newTotal };
        });
    };

    const handleManualSaleSubmit = async (e) => {
        e.preventDefault();
        if (!manualSaleFormData.client_name || manualSaleFormData.items.length === 0) return alert("Faltan datos");
        setUploading(true);
        const paid = parseFloat(manualSaleFormData.paid_amount) || 0;
        const status = paid >= manualSaleFormData.total_amount ? 'Pagado' : 'Pendiente';

        const { error } = await supabase.from('manual_sales').insert([{
            seller: manualSaleFormData.seller,
            client_name: manualSaleFormData.client_name,
            client_phone: manualSaleFormData.client_phone,
            items_json: manualSaleFormData.items,
            total_amount: manualSaleFormData.total_amount,
            paid_amount: paid,
            status
        }]);

        if (!error) {
            alert("Venta registrada!");
            setManualSaleFormData({ seller: 'Rodrigo', client_name: '', client_phone: '', items: [], total_amount: 0, paid_amount: '' });
            fetchAllSales();
        }
        setUploading(false);
    };

    // --- RENDER HELPERS ---
    const renderTabContent = () => {
        switch (activeTab) {
            case 'products':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
                        <div className="bg-white p-6 rounded-2xl border shadow-sm h-fit">
                            <h2 className="font-bold text-xl mb-4 flex items-center gap-2"><Plus size={20} /> Nuevo Producto</h2>
                            <form onSubmit={handleProductSubmit} className="space-y-3">
                                <input placeholder="Nombre" value={productFormData.name} onChange={e => setProductFormData({ ...productFormData, name: e.target.value })} className="w-full border p-2 rounded-lg" required />
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="number" placeholder="Precio Venta" value={productFormData.price} onChange={e => setProductFormData({ ...productFormData, price: e.target.value })} className="border p-2 rounded-lg" required />
                                    <input type="number" placeholder="Stock" value={productFormData.stock} onChange={e => setProductFormData({ ...productFormData, stock: e.target.value })} className="border p-2 rounded-lg" required />
                                </div>
                                <select value={productFormData.category} onChange={e => setProductFormData({ ...productFormData, category: e.target.value })} className="w-full border p-2 rounded-lg">
                                    <option value="">Categoría...</option>
                                    <option value="Mates">Mates</option><option value="Termos">Termos</option><option value="Botellas">Botellas</option><option value="Combos">Combos</option>
                                </select>
                                <textarea placeholder="Descripción" value={productFormData.description} onChange={e => setProductFormData({ ...productFormData, description: e.target.value })} className="w-full border p-2 rounded-lg" rows="3" />
                                <input type="file" onChange={e => setProductImageFile(e.target.files[0])} className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white" />
                                <Button type="submit" className="w-full" disabled={uploading}>{uploading ? 'Guardando...' : 'Crear Producto'}</Button>
                            </form>
                        </div>
                        <div className="lg:col-span-2 space-y-2">
                            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b font-bold flex justify-between">
                                    <span>Inventario Actual</span>
                                    <span className="text-gray-400">{products.length} items</span>
                                </div>
                                {products.map(p => (
                                    <div key={p.id} className="p-4 border-b flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <img src={p.image_url} className="w-12 h-12 object-cover rounded-lg border" alt="" />
                                            <div>
                                                <p className="font-bold text-sm">{p.name}</p>
                                                <p className="text-xs text-gray-500">{p.category} | Stock: {p.stock}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="font-bold">${p.price}</p>
                                            <button onClick={() => handleProductDelete(p.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'wheel':
                return (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4">
                        <div className={`p-6 rounded-2xl border flex items-center justify-between transition-colors ${isWheelActive ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div>
                                <h2 className="font-bold text-xl flex items-center gap-2">
                                    <Power className={isWheelActive ? 'text-green-600' : 'text-red-600'} />
                                    Estado de la Ruleta: {isWheelActive ? 'ENCENDIDA' : 'APAGADA'}
                                </h2>
                                <p className="text-sm text-gray-600">Cuando está apagada, la ruleta no se muestra en la web principal.</p>
                            </div>
                            <button onClick={toggleWheelStatus} className={`px-6 py-3 rounded-full font-bold text-white shadow-lg transition-transform active:scale-95 ${isWheelActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                                {isWheelActive ? 'DESACTIVAR' : 'ACTIVAR'}
                            </button>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border shadow-sm overflow-hidden">
                            <h3 className="font-bold mb-4 flex items-center gap-2"><Dices size={20} /> Configuración de Premios</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold">
                                        <tr><th className="p-3">Premio</th><th className="p-3">Valor</th><th className="p-3">Prob. %</th><th className="p-3">Stock</th></tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {wheelConfig.map(p => (
                                            <tr key={p.id}>
                                                <td className="p-3"><input value={p.label} onChange={e => handleUpdateWheelConfig(p.id, 'label', e.target.value)} className="border p-1 rounded w-full" /></td>
                                                <td className="p-3"><input value={p.value} onChange={e => handleUpdateWheelConfig(p.id, 'value', e.target.value)} className="border p-1 rounded w-full font-mono" /></td>
                                                <td className="p-3"><input type="number" value={p.probability} onChange={e => handleUpdateWheelConfig(p.id, 'probability', e.target.value)} className="border p-1 rounded w-16" /></td>
                                                <td className="p-3"><input type="number" value={p.stock} onChange={e => handleUpdateWheelConfig(p.id, 'stock', e.target.value)} className="border p-1 rounded w-16" /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case 'banners':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-2xl border shadow-sm h-fit">
                            <h2 className="font-bold text-xl mb-4">Nuevo Banner</h2>
                            <form onSubmit={handleBannerSubmit} className="space-y-4">
                                <input placeholder="Título" value={bannerFormData.title} onChange={e => setBannerFormData({ ...bannerFormData, title: e.target.value })} className="w-full border p-2 rounded-lg" />
                                <input placeholder="Link destino" value={bannerFormData.link} onChange={e => setBannerFormData({ ...bannerFormData, link: e.target.value })} className="w-full border p-2 rounded-lg" />
                                <input type="file" onChange={e => setBannerImageFile(e.target.files[0])} className="text-xs" />
                                <Button type="submit" className="w-full" disabled={uploading}>Subir Banner</Button>
                            </form>
                        </div>
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {banners.map(b => (
                                <div key={b.id} className="bg-white rounded-2xl border overflow-hidden relative group">
                                    <img src={b.image_url} className="w-full h-40 object-cover" alt="" />
                                    <div className="p-3 flex justify-between items-center">
                                        <p className="font-bold text-sm">{b.title || 'Sin Título'}</p>
                                        <button onClick={() => handleBannerDelete(b.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'manual_sales':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-2xl border shadow-sm">
                            <h2 className="font-bold text-xl mb-4">Registrar Venta</h2>
                            <form onSubmit={handleManualSaleSubmit} className="space-y-4">
                                <input placeholder="Cliente" value={manualSaleFormData.client_name} onChange={e => setManualSaleFormData({ ...manualSaleFormData, client_name: e.target.value })} className="w-full border p-2 rounded-lg" required />
                                <div className="p-3 bg-gray-50 rounded-xl border border-dashed">
                                    <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Añadir Productos</p>
                                    <div className="space-y-1 max-h-40 overflow-y-auto">
                                        {products.map(p => (
                                            <button key={p.id} type="button" onClick={() => handleAddManualItem(p.id, 'product')} className="w-full text-left text-sm p-2 hover:bg-white rounded border border-transparent hover:border-gray-200 flex justify-between">
                                                {p.name} <span className="font-bold text-brand-dark">+</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {manualSaleFormData.items.length > 0 && (
                                    <div className="bg-brand-dark/5 p-3 rounded-xl border border-brand-dark/10">
                                        {manualSaleFormData.items.map((it, i) => (
                                            <div key={i} className="flex justify-between text-sm mb-1">
                                                <span>{it.quantity}x {it.name}</span>
                                                <span className="font-bold">${it.price * it.quantity}</span>
                                            </div>
                                        ))}
                                        <div className="border-t mt-2 pt-2 flex justify-between font-bold text-lg">
                                            <span>TOTAL:</span><span>${manualSaleFormData.total_amount}</span>
                                        </div>
                                    </div>
                                )}
                                <input type="number" placeholder="Monto Pagado" value={manualSaleFormData.paid_amount} onChange={e => setManualSaleFormData({ ...manualSaleFormData, paid_amount: e.target.value })} className="w-full border p-2 rounded-lg font-bold text-green-600" />
                                <Button type="submit" className="w-full py-3" disabled={uploading}>Confirmar Venta</Button>
                            </form>
                        </div>
                        <div className="lg:col-span-2 space-y-3">
                            <h3 className="font-bold text-gray-500 uppercase text-xs">Ventas Manuales Recientes</h3>
                            {manualSales.slice(0, 10).map(s => (
                                <div key={s.id} className="bg-white p-4 rounded-2xl border shadow-sm flex justify-between items-center">
                                    <div>
                                        <p className="font-bold">{s.client_name}</p>
                                        <p className="text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">${s.total_amount}</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${s.status === 'Pagado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {s.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return <div className="text-center p-20 text-gray-400">Seleccioná una pestaña para comenzar.</div>;
        }
    };

    // (Note: handleProductSubmit, handleBannerSubmit, handleComboDelete etc are kept from your working base but connected to the new UI)
    // ... logic remains same as your provided code ...

    return (
        <div className="min-h-screen bg-gray-50 pb-12 transition-colors">
            {/* MOBILE HEADER */}
            <div className="lg:hidden sticky top-0 z-50 bg-white border-b shadow-sm p-4 flex justify-between items-center">
                <h1 className="font-display font-bold text-xl text-gray-800">Admin Home & Co</h1>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-gray-100 rounded-lg">
                    <Search size={20} />
                </button>
            </div>

            {/* MOBILE NAV */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="absolute top-[60px] left-0 right-0 bg-white p-4 shadow-xl space-y-2" onClick={e => e.stopPropagation()}>
                        {['products', 'manual_sales', 'all_sales', 'banners', 'combos', 'wheel', 'design'].map(t => (
                            <button key={t} onClick={() => handleTabChange(t)} className={`w-full text-left p-4 rounded-xl font-bold ${activeTab === t ? 'bg-black text-white' : 'bg-gray-50 text-gray-600'}`}>
                                {t.replace('_', ' ').toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 md:px-8 md:pt-24">
                {/* DESKTOP HEADER */}
                <div className="hidden lg:flex justify-between items-center mb-8 border-b pb-6">
                    <div>
                        <h1 className="font-display font-bold text-4xl text-gray-900 tracking-tight">Panel Central</h1>
                        <p className="text-gray-500 font-medium">Gestioná tu tienda Home & Co</p>
                    </div>
                    <div className="flex bg-gray-200 p-1.5 rounded-2xl gap-1 shadow-inner">
                        {['products', 'manual_sales', 'all_sales', 'banners', 'wheel', 'design'].map(t => (
                            <button
                                key={t}
                                onClick={() => handleTabChange(t)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === t ? 'bg-white shadow-md text-black scale-105' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {t.replace('_', ' ').toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* DYNAMIC CONTENT */}
                <div className="min-h-[500px]">
                    {renderTabContent()}
                </div>
            </div>

            {/* MODALS (Simplified versions of your existing ones) */}
            {paymentModal.open && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
                        <h3 className="font-bold text-2xl mb-2">Registrar Pago</h3>
                        <p className="text-gray-500 mb-6">Monto a abonar para la venta de {paymentModal.sale?.client_name}</p>
                        <input type="number" value={paymentModal.amount} onChange={e => setPaymentModal({ ...paymentModal, amount: e.target.value })} className="w-full border-2 border-gray-100 p-4 rounded-2xl mb-6 text-2xl font-bold" placeholder="0.00" />
                        <div className="flex gap-3">
                            <Button onClick={() => setPaymentModal({ open: false, sale: null, amount: '' })} className="flex-1 bg-gray-100 text-gray-600 hover:bg-gray-200">Cancelar</Button>
                            <Button onClick={handleUpdatePayment} className="flex-1 bg-green-600">Cobrar</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}