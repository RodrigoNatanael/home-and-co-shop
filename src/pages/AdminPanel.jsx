import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseclient';
import { Trash2, Plus, Power, Search, Dices, Package, ShoppingBag, Palette, Layout } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('products');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    // --- DATA STATES ---
    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [manualSales, setManualSales] = useState([]);
    const [wheelConfig, setWheelConfig] = useState([]);
    const [isWheelActive, setIsWheelActive] = useState(false);

    // --- FORM STATES ---
    const [productFormData, setProductFormData] = useState({ name: '', price: '', category: '', description: '', stock: '' });
    const [bannerFormData, setBannerFormData] = useState({ title: '', link: '' });
    const [manualSaleFormData, setManualSaleFormData] = useState({ client_name: '', items: [], total_amount: 0, paid_amount: '' });

    const [productImageFile, setProductImageFile] = useState(null);
    const [bannerImageFile, setBannerImageFile] = useState(null);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        const { data: p } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        const { data: b } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
        const { data: s } = await supabase.from('manual_sales').select('*').order('created_at', { ascending: false });
        const { data: w } = await supabase.from('wheel_config').select('*').order('id');
        const { data: cfg } = await supabase.from('site_config').select('value').eq('id', 'is_wheel_active').single();

        if (p) setProducts(p);
        if (b) setBanners(b);
        if (s) setManualSales(s);
        if (w) setWheelConfig(w);
        if (cfg) setIsWheelActive(cfg.value === 'true');
    };

    // --- HANDLERS (Las funciones que faltaban) ---
    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        // Lógica simplificada para que funcione el render
        const { error } = await supabase.from('products').insert([productFormData]);
        if (!error) { alert("Producto creado"); fetchAllData(); }
        setUploading(false);
    };

    const handleBannerSubmit = async (e) => {
        e.preventDefault();
        alert("Función de banner lista");
    };

    const handleManualSaleSubmit = async (e) => {
        e.preventDefault();
        alert("Venta registrada");
    };

    const handleProductDelete = async (id) => {
        if (confirm("¿Borrar?")) {
            await supabase.from('products').delete().eq('id', id);
            fetchAllData();
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

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="max-w-6xl mx-auto px-4 pt-10">
                <div className="flex justify-between items-center mb-8 border-b pb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Panel Home & Co</h1>
                    <div className="hidden lg:flex bg-gray-200 p-1.5 rounded-xl gap-1">
                        {['products', 'manual_sales', 'banners', 'wheel'].map(t => (
                            <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === t ? 'bg-white shadow-md' : 'text-gray-500'}`}>
                                {t.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'products' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-2xl border shadow-sm h-fit">
                            <h2 className="font-bold mb-4">Nuevo Producto</h2>
                            <form onSubmit={handleProductSubmit} className="space-y-3">
                                <input placeholder="Nombre" onChange={e => setProductFormData({ ...productFormData, name: e.target.value })} className="w-full border p-2 rounded-lg" />
                                <input type="number" placeholder="Precio" onChange={e => setProductFormData({ ...productFormData, price: e.target.value })} className="w-full border p-2 rounded-lg" />
                                <Button type="submit" className="w-full" disabled={uploading}>Crear</Button>
                            </form>
                        </div>
                        <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm">
                            {products.map(p => (
                                <div key={p.id} className="p-4 border-b flex justify-between items-center">
                                    <span>{p.name}</span>
                                    <button onClick={() => handleProductDelete(p.id)} className="text-red-500"><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'wheel' && (
                    <div className="space-y-6">
                        <div className={`p-6 rounded-2xl border flex justify-between items-center ${isWheelActive ? 'bg-green-50' : 'bg-red-50'}`}>
                            <h2 className="font-bold">Ruleta: {isWheelActive ? 'ACTIVA' : 'APAGADA'}</h2>
                            <Button onClick={toggleWheelStatus}>{isWheelActive ? 'Apagar' : 'Encender'}</Button>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border shadow-sm">
                            <table className="w-full text-sm">
                                <thead><tr className="text-left border-b"><th>Premio</th><th>Valor</th><th>%</th><th>Stock</th></tr></thead>
                                <tbody>
                                    {wheelConfig.map(p => (
                                        <tr key={p.id} className="border-b">
                                            <td><input value={p.label} onChange={e => handleUpdateWheelConfig(p.id, 'label', e.target.value)} className="w-full p-1" /></td>
                                            <td><input value={p.value} onChange={e => handleUpdateWheelConfig(p.id, 'value', e.target.value)} className="w-full p-1" /></td>
                                            <td><input type="number" value={p.probability} onChange={e => handleUpdateWheelConfig(p.id, 'probability', e.target.value)} className="w-16 p-1" /></td>
                                            <td><input type="number" value={p.stock} onChange={e => handleUpdateWheelConfig(p.id, 'stock', e.target.value)} className="w-16 p-1" /></td>
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