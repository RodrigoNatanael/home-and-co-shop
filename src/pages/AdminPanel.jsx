import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseclient';
import { Trash2, Plus, Power, Search, Dices, Package, ShoppingBag, ImageIcon, CheckCircle, Clock, Send, Palette, Layout, Tag, Smartphone } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { generateProductDescription } from '../services/ai';

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('products');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);

    // --- DATA STATES ---
    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [combos, setCombos] = useState([]);
    const [allSales, setAllSales] = useState([]);
    const [wheelConfig, setWheelConfig] = useState([]);
    const [isWheelActive, setIsWheelActive] = useState(false);
    const [siteConfig, setSiteConfig] = useState({});

    // --- FORM STATES ---
    const [productFormData, setProductFormData] = useState({
        name: '', price: '', category: '', description: '', stock: '', variants: [], tags: ''
    });
    const [productImageFile, setProductImageFile] = useState(null);
    const [manualSaleFormData, setManualSaleFormData] = useState({ client_name: '', items: [], total_amount: 0 });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        const { data: p } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        const { data: b } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
        const { data: c } = await supabase.from('combos').select('*').order('created_at', { ascending: false });
        const { data: m } = await supabase.from('manual_sales').select('*').order('created_at', { ascending: false });
        const { data: w } = await supabase.from('wheel_config').select('*').order('id');
        const { data: cfg } = await supabase.from('site_config').select('*');
        const { data: leads } = await supabase.from('leads').select('*').order('created_at', { ascending: false });

        if (p) setProducts(p);
        if (b) setBanners(b);
        if (c) setCombos(c);
        if (w) setWheelConfig(w);

        // Configuración de sitio (Hero, Videos, etc)
        if (cfg) {
            const configObj = {};
            cfg.forEach(item => configObj[item.id] = item.value);
            setSiteConfig(configObj);
            setIsWheelActive(configObj.is_wheel_active === 'true');
        }

        const manualNorm = (m || []).map(s => ({
            id: s.id, date: s.created_at, client: s.client_name, total: s.total_amount, paid: s.paid_amount,
            status: s.status, origin: 'MANUAL'
        }));
        const webNorm = (leads || []).map(l => ({
            id: l.id, date: l.created_at, client: l.name, total: JSON.parse(l.metadata || '{}').total || 0,
            status: 'Pagado', origin: 'WEB'
        }));
        setAllSales([...manualNorm, ...webNorm].sort((a, b) => new Date(b.date) - new Date(a.date)));
    };

    // --- ACCIONES ---
    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        let imageUrl = '';
        if (productImageFile) {
            const fileName = `${Date.now()}_${productImageFile.name}`;
            await supabase.storage.from('product-images').upload(fileName, productImageFile);
            imageUrl = supabase.storage.from('product-images').getPublicUrl(fileName).data.publicUrl;
        }
        await supabase.from('products').insert([{ ...productFormData, image_url: imageUrl, tags: productFormData.tags.split(',').map(t => t.trim()) }]);
        alert("Producto creado");
        fetchAllData();
        setUploading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* NAVEGACIÓN PRO */}
            <div className="max-w-7xl mx-auto px-4 pt-10 border-b pb-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <h1 className="text-4xl font-black italic tracking-tighter">ADMIN <span className="text-brand-primary">H&C</span></h1>
                <nav className="flex bg-gray-200 p-1 rounded-2xl gap-1 shadow-inner overflow-x-auto max-w-full">
                    {['products', 'manual_sales', 'all_sales', 'banners', 'combos', 'wheel', 'design'].map(t => (
                        <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === t ? 'bg-white shadow-md text-black' : 'text-gray-500'}`}>
                            {t.toUpperCase()}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-10">
                {/* PESTAÑA PRODUCTOS (Con Etiquetas y Variantes) */}
                {activeTab === 'products' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-[40px] border-2 border-gray-100 shadow-xl space-y-4">
                            <h2 className="font-black text-xl uppercase tracking-tighter">Nuevo Ingreso</h2>
                            <form onSubmit={handleProductSubmit} className="space-y-3">
                                <input placeholder="Nombre" className="w-full border-2 border-gray-50 p-3 rounded-2xl font-bold" value={productFormData.name} onChange={e => setProductFormData({ ...productFormData, name: e.target.value })} />
                                <input placeholder="Etiquetas (separadas por coma)" className="w-full border-2 border-gray-50 p-3 rounded-2xl text-xs" value={productFormData.tags} onChange={e => setProductFormData({ ...productFormData, tags: e.target.value })} />
                                <div className="grid grid-cols-2 gap-2">
                                    <input placeholder="Precio" type="number" className="border-2 border-gray-50 p-3 rounded-2xl font-black text-green-600" value={productFormData.price} onChange={e => setProductFormData({ ...productFormData, price: e.target.value })} />
                                    <input placeholder="Stock" type="number" className="border-2 border-gray-50 p-3 rounded-2xl font-black" value={productFormData.stock} onChange={e => setProductFormData({ ...productFormData, stock: e.target.value })} />
                                </div>
                                <Button type="submit" className="w-full py-4 bg-black text-white rounded-2xl font-black" disabled={uploading}>PUBLICAR PRODUCTO</Button>
                            </form>
                        </div>
                        <div className="lg:col-span-2 bg-white rounded-[40px] border-2 border-gray-100 shadow-sm overflow-hidden h-[600px] overflow-y-auto">
                            {products.map(p => (
                                <div key={p.id} className="p-4 border-b flex justify-between items-center hover:bg-gray-50">
                                    <div className="flex items-center gap-4">
                                        <img src={p.image_url} className="w-12 h-12 object-cover rounded-xl border" alt="" />
                                        <div>
                                            <p className="font-black text-sm">{p.name}</p>
                                            <div className="flex gap-1">
                                                {p.tags?.map(t => <span key={t} className="bg-gray-100 text-[8px] px-2 rounded-full font-bold uppercase">{t}</span>)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="font-black text-lg">${p.price}</p>
                                        <button className="text-gray-200 hover:text-red-500"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* PESTAÑA DISEÑO (Hero, Video, Categorías Home) */}
                {activeTab === 'design' && (
                    <div className="bg-white p-8 rounded-[40px] border-2 border-gray-100 shadow-xl space-y-6">
                        <h2 className="font-black text-2xl uppercase tracking-tighter">Configuración Visual Home</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">URL Video Hero (Banner Principal)</label>
                                <input value={siteConfig.hero_video_url} className="w-full border-2 border-gray-50 p-3 rounded-2xl font-mono text-xs" onChange={async (e) => await supabase.from('site_config').upsert({ id: 'hero_video_url', value: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Categoría Destacada 1</label>
                                <input value={siteConfig.cat1_title} className="w-full border-2 border-gray-50 p-3 rounded-2xl font-bold" />
                            </div>
                        </div>
                        <Button className="bg-black text-white px-8 py-3 rounded-xl font-black">GUARDAR CAMBIOS DISEÑO</Button>
                    </div>
                )}

                {/* PESTAÑA COMBOS */}
                {activeTab === 'combos' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-[40px] border-2 border-gray-100 shadow-xl space-y-4 h-fit">
                            <h2 className="font-black text-xl uppercase tracking-tighter">Nuevo Combo</h2>
                            <input placeholder="Nombre del Combo" className="w-full border-2 border-gray-50 p-3 rounded-2xl font-bold" />
                            <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed">
                                <p className="text-[10px] font-black text-gray-400 mb-2">SELECCIONAR PRODUCTOS</p>
                                {products.slice(0, 5).map(p => (
                                    <div key={p.id} className="flex items-center gap-2 mb-1">
                                        <input type="checkbox" /> <span className="text-xs font-bold">{p.name}</span>
                                    </div>
                                ))}
                            </div>
                            <Button className="w-full py-4 bg-black text-white rounded-2xl font-black">CREAR COMBO</Button>
                        </div>
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {combos.map(c => (
                                <div key={c.id} className="bg-white p-4 rounded-3xl border-2 border-gray-100 flex justify-between items-center shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <Package className="text-brand-primary" />
                                        <p className="font-black">{c.name}</p>
                                    </div>
                                    <button className="text-gray-200 hover:text-red-500"><Trash2 size={18} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}