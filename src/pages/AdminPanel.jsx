import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseclient';
import { Trash2, Plus, Power, Search, Dices, Package, ShoppingBag, ImageIcon, CheckCircle, Clock, Send, Palette, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { generateProductDescription } from '../services/ai';

export default function AdminPanel() {
    // --- ESTADOS DE NAVEGACIÓN Y CARGA ---
    const [activeTab, setActiveTab] = useState('products');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);

    // --- ESTADOS DE DATOS ---
    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [combos, setCombos] = useState([]);
    const [allSales, setAllSales] = useState([]);
    const [wheelConfig, setWheelConfig] = useState([]);
    const [isWheelActive, setIsWheelActive] = useState(false);

    // --- FORMULARIOS ---
    const [productFormData, setProductFormData] = useState({
        name: '', price: '', category: '', description: '', stock: '', variants: []
    });
    const [productImageFile, setProductImageFile] = useState(null);
    const [manualSaleFormData, setManualSaleFormData] = useState({
        client_name: '', client_phone: '', items: [], total_amount: 0, paid_amount: ''
    });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        const { data: p } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        const { data: b } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
        const { data: c } = await supabase.from('combos').select('*').order('created_at', { ascending: false });
        const { data: m } = await supabase.from('manual_sales').select('*').order('created_at', { ascending: false });
        const { data: w } = await supabase.from('wheel_config').select('*').order('id');
        const { data: cfg } = await supabase.from('site_config').select('value').eq('id', 'is_wheel_active').single();
        const { data: leads } = await supabase.from('leads').select('*').order('created_at', { ascending: false });

        if (p) setProducts(p);
        if (b) setBanners(b);
        if (c) setCombos(c);
        if (w) setWheelConfig(w);
        if (cfg) setIsWheelActive(cfg.value === 'true');

        const manualNorm = (m || []).map(s => ({
            id: s.id, date: s.created_at, client: s.client_name, total: s.total_amount, paid: s.paid_amount,
            status: s.status, origin: 'MANUAL', items: s.items_json || []
        }));
        const webNorm = (leads || []).map(l => {
            const meta = typeof l.metadata === 'string' ? JSON.parse(l.metadata) : l.metadata;
            return {
                id: l.id, date: l.created_at, client: l.name, total: meta?.total || 0, paid: meta?.total || 0,
                status: 'Pagado', origin: 'WEB', items: meta?.items || []
            };
        });
        setAllSales([...manualNorm, ...webNorm].sort((a, b) => new Date(b.date) - new Date(a.date)));
    };

    // --- HANDLERS ---
    const handleGenerateDescription = async () => {
        if (!productFormData.name) return alert("Poné un nombre primero");
        setGeneratingAI(true);
        const desc = await generateProductDescription(productFormData.name, productFormData.category);
        setProductFormData(prev => ({ ...prev, description: desc }));
        setGeneratingAI(false);
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            let imageUrl = '';
            if (productImageFile) {
                const fileName = `${Date.now()}_${productImageFile.name}`;
                await supabase.storage.from('product-images').upload(fileName, productImageFile);
                const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
                imageUrl = data.publicUrl;
            }

            const { error } = await supabase.from('products').insert([{
                ...productFormData,
                image_url: imageUrl,
                price: parseFloat(productFormData.price),
                stock: parseInt(productFormData.stock) || 0
            }]);

            if (error) throw error;
            alert("Producto creado exitosamente!");
            setProductFormData({ name: '', price: '', category: '', description: '', stock: '', variants: [] });
            setProductImageFile(null);
            fetchAllData();
        } catch (err) {
            alert("Error al subir: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    const toggleWheelStatus = async () => {
        const next = !isWheelActive;
        setIsWheelActive(next);
        await supabase.from('site_config').upsert({ id: 'is_wheel_active', value: String(next) });
    };

    const handleUpdateWheelConfig = async (id, field, value) => {
        setWheelConfig(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
        await supabase.from('wheel_config').update({ [field]: value }).eq('id', id);
    };

    const handleCloseDay = () => {
        const total = allSales.reduce((acc, s) => acc + parseFloat(s.paid || 0), 0);
        const text = `📊 *CIERRE HOME & CO*\nTotal: $${total.toLocaleString()}`;
        window.open(`https://wa.me/5492617523156?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12 font-sans">
            {/* HEADER */}
            <div className="max-w-7xl mx-auto px-4 pt-10 border-b pb-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter text-gray-900 italic">ADMIN <span className="text-brand-primary">H&C</span></h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Mendoza • Rugged Premium Shop</p>
                </div>
                <nav className="flex bg-gray-200 p-1.5 rounded-2xl gap-1 shadow-inner overflow-x-auto">
                    {['products', 'manual_sales', 'all_sales', 'wheel'].map(t => (
                        <button key={t} onClick={() => setActiveTab(t)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeTab === t ? 'bg-white shadow-md text-black scale-105' : 'text-gray-500'}`}>
                            {t.replace('_', ' ').toUpperCase()}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-10">
                {/* PESTAÑA PRODUCTOS */}
                {activeTab === 'products' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="bg-white p-8 rounded-[40px] border-2 border-gray-100 shadow-xl space-y-6">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Nuevo Ingreso</h2>
                            <form onSubmit={handleProductSubmit} className="space-y-4">
                                <input placeholder="Nombre del Producto" value={productFormData.name} onChange={e => setProductFormData({ ...productFormData, name: e.target.value })} className="w-full border-2 border-gray-50 p-4 rounded-2xl focus:border-black outline-none font-bold" required />

                                <input list="cats" placeholder="Categoría (escribí o elegí)" value={productFormData.category} onChange={e => setProductFormData({ ...productFormData, category: e.target.value })} className="w-full border-2 border-gray-50 p-4 rounded-2xl focus:border-black outline-none font-bold" required />
                                <datalist id="cats">
                                    {[...new Set(products.map(p => p.category))].map(c => <option key={c} value={c} />)}
                                </datalist>

                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" placeholder="Precio" value={productFormData.price} onChange={e => setProductFormData({ ...productFormData, price: e.target.value })} className="border-2 border-gray-50 p-4 rounded-2xl font-black text-green-600 outline-none" required />
                                    <input type="number" placeholder="Stock Total" value={productFormData.stock} onChange={e => setProductFormData({ ...productFormData, stock: e.target.value })} className="border-2 border-gray-50 p-4 rounded-2xl font-black outline-none" required />
                                </div>

                                {/* VARIANTES */}
                                <div className="bg-gray-50 p-4 rounded-3xl border-2 border-dashed border-gray-200">
                                    <div className="flex justify-between items-center mb-3">
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Colores / Variantes</p>
                                        <button type="button" onClick={() => setProductFormData({ ...productFormData, variants: [...productFormData.variants, { color: '', stock: '' }] })} className="bg-black text-white p-1 rounded-full"><Plus size={14} /></button>
                                    </div>
                                    {productFormData.variants.map((v, i) => (
                                        <div key={i} className="flex gap-2 mb-2">
                                            <input placeholder="Color" className="flex-1 text-xs p-2 rounded-lg border" value={v.color} onChange={e => {
                                                const newV = [...productFormData.variants];
                                                newV[i].color = e.target.value;
                                                setProductFormData({ ...productFormData, variants: newV });
                                            }} />
                                            <input placeholder="Stock" type="number" className="w-16 text-xs p-2 rounded-lg border" value={v.stock} onChange={e => {
                                                const newV = [...productFormData.variants];
                                                newV[i].stock = e.target.value;
                                                setProductFormData({ ...productFormData, variants: newV });
                                            }} />
                                        </div>
                                    ))}
                                </div>

                                <div className="relative">
                                    <textarea placeholder="Descripción del producto..." value={productFormData.description} onChange={e => setProductFormData({ ...productFormData, description: e.target.value })} className="w-full border-2 border-gray-50 p-4 rounded-2xl text-sm h-32 outline-none" />
                                    <button type="button" onClick={handleGenerateDescription} className="absolute bottom-4 right-4 bg-brand-primary text-white text-[10px] px-3 py-1 rounded-full font-black animate-pulse uppercase" disabled={generatingAI}>
                                        {generatingAI ? 'Escribiendo...' : 'Generar con IA'}
                                    </button>
                                </div>

                                <div className="border-2 border-dashed border-gray-100 p-6 rounded-2xl text-center cursor-pointer relative hover:bg-gray-50 transition-all">
                                    <input type="file" onChange={e => setProductImageFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <ImageIcon className="mx-auto text-gray-300 mb-1" />
                                    <p className="text-[10px] font-black text-gray-400 uppercase">{productImageFile ? productImageFile.name : 'Subir Foto Principal'}</p>
                                </div>

                                <Button type="submit" className="w-full py-5 bg-black text-white rounded-2xl font-black text-lg shadow-xl" disabled={uploading}>
                                    {uploading ? 'GUARDANDO...' : 'PUBLICAR PRODUCTO'}
                                </Button>
                            </form>
                        </div>

                        <div className="lg:col-span-2 bg-white rounded-[40px] border-2 border-gray-100 shadow-sm overflow-hidden h-fit">
                            <div className="p-6 bg-gray-50 border-b flex justify-between items-center">
                                <h3 className="font-black uppercase text-xs tracking-widest text-gray-400">Stock en tiempo real</h3>
                                <span className="bg-black text-white text-[10px] px-3 py-1 rounded-full font-black">{products.length} PRODUCTOS</span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {products.map(p => (
                                    <div key={p.id} className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <img src={p.image_url} className="w-16 h-16 object-cover rounded-2xl border-2 border-white shadow-sm" alt="" />
                                            <div>
                                                <p className="font-black text-gray-900">{p.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">{p.category} • Stock: {p.stock}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <p className="font-black text-xl text-gray-900">${p.price.toLocaleString()}</p>
                                            <button onClick={async () => { if (confirm("¿Borrar?")) { await supabase.from('products').delete().eq('id', p.id); fetchAllData(); } }} className="text-gray-200 hover:text-red-500 transition-colors">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* PESTAÑA RULETA */}
                {activeTab === 'wheel' && (
                    <div className="space-y-8 max-w-4xl mx-auto">
                        <div className={`p-10 rounded-[50px] border-4 flex justify-between items-center transition-all shadow-2xl ${isWheelActive ? 'bg-green-50 border-green-200 shadow-green-100' : 'bg-red-50 border-red-200 shadow-red-100'}`}>
                            <div>
                                <h2 className="text-4xl font-black uppercase italic tracking-tighter">
                                    RULETA: {isWheelActive ? 'ENCENDIDA 🔥' : 'APAGADA ❄️'}
                                </h2>
                                <p className="font-bold text-gray-500 uppercase text-xs tracking-widest mt-2">Visibilidad en la página principal</p>
                            </div>
                            <button onClick={toggleWheelStatus} className={`px-12 py-5 rounded-3xl font-black text-white shadow-xl transition-transform active:scale-95 ${isWheelActive ? 'bg-red-600' : 'bg-black'}`}>
                                {isWheelActive ? 'DESACTIVAR' : 'ACTIVAR'}
                            </button>
                        </div>

                        <div className="bg-white p-8 rounded-[40px] border-2 border-gray-100 shadow-xl">
                            <h3 className="font-black text-xl mb-8 flex items-center gap-3"><Dices size={24} /> CONFIGURACIÓN DE PREMIOS</h3>
                            <div className="space-y-4">
                                {wheelConfig.map(p => (
                                    <div key={p.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus-within:border-black transition-all">
                                        <div className="col-span-1 md:col-span-1">
                                            <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Etiqueta</label>
                                            <input value={p.label} onChange={e => handleUpdateWheelConfig(p.id, 'label', e.target.value)} className="w-full bg-white p-2 rounded-lg font-black text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Cupón</label>
                                            <input value={p.value} onChange={e => handleUpdateWheelConfig(p.id, 'value', e.target.value)} className="w-full bg-white p-2 rounded-lg font-mono text-xs text-gray-500" />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Probabilidad %</label>
                                            <input type="number" value={p.probability} onChange={e => handleUpdateWheelConfig(p.id, 'probability', e.target.value)} className="w-full bg-white p-2 rounded-lg font-black text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Stock</label>
                                            <input type="number" value={p.stock} onChange={e => handleUpdateWheelConfig(p.id, 'stock', e.target.value)} className="w-full bg-white p-2 rounded-lg font-black text-sm" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* TODAS LAS VENTAS */}
                {activeTab === 'all_sales' && (
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-[40px] border-2 border-gray-100 flex flex-col md:flex-row justify-between items-center shadow-xl gap-4">
                            <div>
                                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Historial Comercial</h2>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Web + Ventas Manuales</p>
                            </div>
                            <Button onClick={handleCloseDay} className="bg-green-600 hover:bg-green-700 text-white font-black px-10 py-5 rounded-2xl shadow-lg shadow-green-100 flex items-center gap-3">
                                <Send size={20} /> CERRAR JORNADA Y ENVIAR WHATSAPP
                            </Button>
                        </div>
                        <div className="bg-white rounded-[40px] border-2 border-gray-100 shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <tr><th className="p-6">Fecha</th><th className="p-6">Cliente</th><th className="p-6">Canal</th><th className="p-6">Monto</th><th className="p-6">Estado</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {allSales.map(s => (
                                        <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-6 text-xs font-bold text-gray-300">{new Date(s.date).toLocaleDateString()}</td>
                                            <td className="p-6 font-black text-gray-900">{s.client}</td>
                                            <td className="p-6">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black ${s.origin === 'WEB' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                                    {s.origin}
                                                </span>
                                            </td>
                                            <td className="p-6 font-black text-gray-900">$ {s.total.toLocaleString()}</td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-2 text-[10px] font-black">
                                                    {s.status === 'Pagado' ? <CheckCircle size={16} className="text-green-500" /> : <Clock size={16} className="text-orange-500" />}
                                                    {s.status.toUpperCase()}
                                                </div>
                                            </td>
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