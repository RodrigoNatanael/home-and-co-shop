import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseclient';
import {
    Trash2, Plus, RefreshCw, ShoppingBag, Video, Image as ImageIcon,
    Package, CheckSquare, FolderPlus, Tag, Settings, Layout, Ticket, Layers, Palette,
    DollarSign, CheckCircle, AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function AdminPanel() {
    // --- ESTADOS NAVEGACIÓN ---
    const [activeTab, setActiveTab] = useState('manual_sales');

    // --- ESTADOS DATOS ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [banners, setBanners] = useState([]);
    const [allSales, setAllSales] = useState([]);
    const [siteConfig, setSiteConfig] = useState({ hero_video_url: '', cat1_title: '', cat2_title: '', cat3_title: '' });

    // Estadísticas
    const [stats, setStats] = useState({ totalIncome: 0, pendingIncome: 0 });

    // --- ESTADOS FORMULARIOS ---
    const [uploading, setUploading] = useState(false);
    const [imageFiles, setImageFiles] = useState([null, null, null]);
    const [newCategory, setNewCategory] = useState({ name: '', video_url: '' });

    // PRODUCTO
    const [productFormData, setProductFormData] = useState({
        name: '', price: '', previous_price: '', cost_price: '',
        category: '', description: '', stock: '',
        tags: [], variants: ''
    });

    // CAJA / VENTAS (CORREGIDO PARA TU DB)
    const [saleFormData, setSaleFormData] = useState({
        client_name: '',
        products_summary: '',
        total_amount: '',
        paid_amount: '',    // <--- Corregido: coincide con tu DB (antes era amount_paid)
        payment_method: 'Efectivo',
        notes: ''
    });

    // BANNERS
    const [bannerFormData, setBannerFormData] = useState({ title: '', link: '' });
    const [bannerImageFile, setBannerImageFile] = useState(null);

    useEffect(() => {
        refreshAll();
    }, []);

    const refreshAll = async () => {
        fetchProducts();
        fetchCategories();
        fetchBanners();
        fetchSales();
        fetchConfig();
    };

    // --- FETCHS ---
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

    const fetchSales = async () => {
        const { data } = await supabase.from('manual_sales').select('*').order('created_at', { ascending: false });
        if (data) {
            setAllSales(data);
            // Calcular Caja Real (Lo que entró: paid_amount) y Pendiente (Fiado)
            const income = data.reduce((acc, curr) => acc + (parseFloat(curr.paid_amount) || 0), 0);
            const pending = data.reduce((acc, curr) => {
                const total = parseFloat(curr.total_amount) || 0;
                const paid = parseFloat(curr.paid_amount) || 0;
                return acc + (total - paid);
            }, 0);
            setStats({ totalIncome: income, pendingIncome: pending });
        }
    };

    const fetchConfig = async () => {
        const { data } = await supabase.from('site_config').select('*');
        if (data) {
            const cfg = {};
            data.forEach(i => cfg[i.id] = i.value);
            setSiteConfig(prev => ({ ...prev, ...cfg }));
        }
    };

    // --- LÓGICA PRODUCTOS ---
    const handleTagChange = (tag) => {
        setProductFormData(prev => {
            const currentTags = prev.tags || [];
            return currentTags.includes(tag) ? { ...prev, tags: currentTags.filter(t => t !== tag) } : { ...prev, tags: [...currentTags, tag] };
        });
    };
    const handleImageChange = (index, file) => {
        const newImages = [...imageFiles]; newImages[index] = file; setImageFiles(newImages);
    };
    const handleProductSubmit = async (e) => {
        e.preventDefault(); setUploading(true);
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
            const variantsArray = productFormData.variants.split(',').map(v => v.trim()).filter(Boolean);
            const newProduct = {
                id: crypto.randomUUID(), ...productFormData,
                price: parseFloat(productFormData.price), previous_price: productFormData.previous_price ? parseFloat(productFormData.previous_price) : null,
                cost_price: productFormData.cost_price ? parseFloat(productFormData.cost_price) : null, stock: parseInt(productFormData.stock),
                variants: variantsArray, image_url: uploadedUrls[0] || null, gallery: uploadedUrls
            };
            const { error } = await supabase.from('products').insert([newProduct]);
            if (error) throw error;
            setProductFormData({ name: '', price: '', previous_price: '', cost_price: '', category: '', description: '', stock: '', tags: [], variants: '' });
            setImageFiles([null, null, null]); fetchProducts(); alert("✅ Producto Guardado");
        } catch (err) { alert(err.message); }
        setUploading(false);
    };

    // --- LÓGICA VENTAS / CAJA (CORREGIDO paid_amount) ---
    const handleSaleSubmit = async (e) => {
        e.preventDefault();

        const total = parseFloat(saleFormData.total_amount);
        const paid = parseFloat(saleFormData.paid_amount); // <--- Corregido

        let status = 'Pagado';
        if (paid < total) status = 'Señado / Pendiente';
        if (paid === 0) status = 'Fiado Total';

        const { error } = await supabase.from('manual_sales').insert([{
            client_name: saleFormData.client_name,
            products_summary: saleFormData.products_summary,
            total_amount: total,
            paid_amount: paid, // <--- Guardamos en la columna correcta de la DB
            payment_method: saleFormData.payment_method,
            notes: saleFormData.notes,
            status: status,
            created_at: new Date()
        }]);

        if (!error) {
            setSaleFormData({ client_name: '', products_summary: '', total_amount: '', paid_amount: '', payment_method: 'Efectivo', notes: '' });
            fetchSales();
            alert("💰 Venta/Seña Registrada");
        } else {
            alert("Error: " + error.message);
        }
    };

    const handleSettleDebt = async (sale) => {
        if (!confirm(`¿Confirmar que ${sale.client_name} pagó el resto ($${sale.total_amount - sale.paid_amount})?`)) return;

        const { error } = await supabase.from('manual_sales')
            .update({ paid_amount: sale.total_amount, status: 'Pagado' }) // <--- Corregido paid_amount
            .eq('id', sale.id);

        if (!error) {
            fetchSales();
            alert("✅ Deuda saldada exitosamente");
        }
    };

    const handleDeleteSale = async (id) => {
        if (!confirm("¿Borrar venta del historial? Esto afectará el total.")) return;
        await supabase.from('manual_sales').delete().eq('id', id);
        fetchSales();
    };

    // --- LÓGICA BANNERS ---
    const handleBannerSubmit = async (e) => {
        e.preventDefault();
        let url = ''; if (bannerImageFile) { const fileName = `ban_${Date.now()}`; await supabase.storage.from('product-images').upload(fileName, bannerImageFile); url = supabase.storage.from('product-images').getPublicUrl(fileName).data.publicUrl; }
        await supabase.from('banners').insert([{ ...bannerFormData, image_url: url }]); setBannerFormData({ title: '', link: '' }); setBannerImageFile(null); fetchBanners();
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12 font-sans text-gray-900">
            {/* HEADER */}
            <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center overflow-x-auto gap-4">
                    <h1 className="text-xl font-black italic shrink-0">ADMIN H&C</h1>
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                        {[
                            { id: 'products', label: 'Productos', icon: <Package size={14} /> },
                            { id: 'categories_mgr', label: 'Categorías', icon: <FolderPlus size={14} /> },
                            { id: 'manual_sales', label: 'Caja / Señas', icon: <DollarSign size={14} /> },
                            { id: 'banners', label: 'Banners', icon: <ImageIcon size={14} /> },
                            { id: 'design', label: 'Diseño', icon: <Layout size={14} /> }
                        ].map(tab => (
                            <button
                                key={tab.id} onClick={() => setActiveTab(tab.id)}
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
                        <div className="lg:col-span-5">
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md sticky top-24">
                                <h2 className="font-black text-lg mb-4 flex items-center gap-2 uppercase"><Plus size={20} /> Nuevo Producto</h2>
                                <form onSubmit={handleProductSubmit} className="space-y-4">
                                    <input placeholder="Nombre" value={productFormData.name} onChange={e => setProductFormData({ ...productFormData, name: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold" required />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="number" placeholder="Precio" value={productFormData.price} onChange={e => setProductFormData({ ...productFormData, price: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-green-600" required />
                                        <input type="number" placeholder="Costo" value={productFormData.cost_price} onChange={e => setProductFormData({ ...productFormData, cost_price: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl text-gray-500" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="number" placeholder="Anterior" value={productFormData.previous_price} onChange={e => setProductFormData({ ...productFormData, previous_price: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl" />
                                        <input type="number" placeholder="Stock" value={productFormData.stock} onChange={e => setProductFormData({ ...productFormData, stock: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold" required />
                                    </div>
                                    <select value={productFormData.category} onChange={e => setProductFormData({ ...productFormData, category: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold bg-white" required>
                                        <option value="">Categoría...</option>
                                        {categories.map(c => <option key={c.id} value={c.name}>{c.name.toUpperCase()}</option>)}
                                    </select>
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <label className="text-xs font-bold text-blue-800 uppercase block mb-1">Colores / Variantes</label>
                                        <input placeholder="Ej: Rojo, Azul, Negro" value={productFormData.variants} onChange={e => setProductFormData({ ...productFormData, variants: e.target.value })} className="w-full bg-transparent border-b border-blue-200 p-1 outline-none text-sm font-bold text-blue-900" />
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Etiquetas</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['OFERTA', 'DESTACADO', 'RUGGED', 'ENVIO GRATIS'].map(tag => (
                                                <div key={tag} onClick={() => handleTagChange(tag)} className="flex items-center gap-2 cursor-pointer hover:bg-gray-200 p-1 rounded">
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${productFormData.tags.includes(tag) ? 'bg-black border-black text-white' : 'bg-white border-gray-300'}`}>{productFormData.tags.includes(tag) && <CheckSquare size={12} />}</div>
                                                    <span className="text-[10px] font-bold uppercase">{tag}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <textarea placeholder="Descripción..." value={productFormData.description} onChange={e => setProductFormData({ ...productFormData, description: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl h-24 text-sm" />
                                    <div className="grid grid-cols-3 gap-2">
                                        {[0, 1, 2].map(i => (
                                            <div key={i} className="aspect-square border-2 border-dashed border-gray-200 rounded-xl relative flex items-center justify-center overflow-hidden hover:bg-gray-50 cursor-pointer">
                                                <input type="file" onChange={e => handleImageChange(i, e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                                {imageFiles[i] ? <div className="w-full h-full relative"><img src={URL.createObjectURL(imageFiles[i])} className="w-full h-full object-cover" alt="" /><div className="absolute bottom-0 w-full bg-black/50 text-white text-[8px] text-center font-bold py-1">CAMBIAR</div></div> : <ImageIcon className="text-gray-300" />}
                                            </div>
                                        ))}
                                    </div>
                                    <Button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold" disabled={uploading}>{uploading ? 'SUBIENDO...' : 'GUARDAR'}</Button>
                                </form>
                            </div>
                        </div>
                        <div className="lg:col-span-7">
                            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden h-[800px] flex flex-col">
                                <div className="p-4 border-b bg-gray-50 flex justify-between items-center font-bold text-xs text-gray-400 uppercase tracking-widest">Inventario ({products.length}) <RefreshCw size={14} className="cursor-pointer hover:text-black" onClick={fetchProducts} /></div>
                                <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
                                    {products.map(p => (
                                        <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50 group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-gray-100 rounded-lg border overflow-hidden">{p.image_url && <img src={p.image_url} className="w-full h-full object-cover" alt="" />}</div>
                                                <div>
                                                    <p className="font-black text-sm text-gray-900">{p.name}</p>
                                                    <div className="flex gap-2 items-center text-xs mt-1"><span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{p.category}</span><span className="font-bold text-green-600">${p.price}</span></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4"><div className="text-right"><p className="text-[8px] font-bold text-gray-400 uppercase">Stock</p><span className={`text-sm font-bold ${p.stock < 5 ? 'text-red-500' : 'text-gray-900'}`}>{p.stock}</span></div><button onClick={() => { if (confirm('¿Borrar?')) supabase.from('products').delete().eq('id', p.id).then(fetchProducts) }} className="p-2 text-gray-200 hover:text-red-500"><Trash2 size={18} /></button></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. CATEGORÍAS */}
                {activeTab === 'categories_mgr' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-2xl border shadow-md h-fit">
                            <h2 className="font-black text-lg mb-4 uppercase flex items-center gap-2"><FolderPlus /> Crear Categoría</h2>
                            <form onSubmit={async (e) => { e.preventDefault(); await supabase.from('categories').insert([newCategory]); setNewCategory({ name: '', video_url: '' }); fetchCategories(); }} className="space-y-4">
                                <input placeholder="Nombre" value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold" required />
                                <input placeholder="URL Video" value={newCategory.video_url} onChange={e => setNewCategory({ ...newCategory, video_url: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-mono text-xs" />
                                <Button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold">GUARDAR</Button>
                            </form>
                        </div>
                        <div className="bg-white rounded-2xl border shadow-sm divide-y">
                            {categories.map(c => (
                                <div key={c.id} className="p-4 flex justify-between items-center"><span className="font-bold text-sm uppercase">{c.name}</span><button onClick={() => supabase.from('categories').delete().eq('id', c.id).then(fetchCategories)} className="text-gray-200 hover:text-red-500"><Trash2 size={16} /></button></div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. CAJA / VENTAS (CORREGIDO PARA DB ACTUAL) */}
                {activeTab === 'manual_sales' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* TARJETAS DE TOTALES */}
                        <div className="lg:col-span-12 grid grid-cols-2 gap-4">
                            <div className="bg-black text-white p-6 rounded-2xl shadow-lg">
                                <p className="text-[10px] font-bold uppercase opacity-60 mb-1">Caja Real (Lo que entró)</p>
                                <p className="text-3xl font-black">${stats.totalIncome.toLocaleString()}</p>
                            </div>
                            <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl shadow-sm">
                                <p className="text-[10px] font-bold uppercase text-orange-600 mb-1">Por Cobrar (Fiado/Saldos)</p>
                                <p className="text-3xl font-black text-orange-600">${stats.pendingIncome.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* FORMULARIO DE CARGA */}
                        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border shadow-md h-fit">
                            <h2 className="font-black text-lg mb-4 uppercase flex items-center gap-2"><DollarSign /> Nueva Venta / Seña</h2>
                            <form onSubmit={handleSaleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Cliente</label>
                                    <input placeholder="Nombre y Apellido" value={saleFormData.client_name} onChange={e => setSaleFormData({ ...saleFormData, client_name: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold" required />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Productos / Detalle</label>
                                    <textarea placeholder="Ej: 1 Termo Stanley Verde (Reservado)" value={saleFormData.products_summary} onChange={e => setSaleFormData({ ...saleFormData, products_summary: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl text-sm h-20" required />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Total Venta</label>
                                        <input type="number" placeholder="$ Total" value={saleFormData.total_amount} onChange={e => setSaleFormData({ ...saleFormData, total_amount: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold" required />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Entrega / Seña</label>
                                        <input type="number" placeholder="$ Paga hoy" value={saleFormData.paid_amount} onChange={e => setSaleFormData({ ...saleFormData, paid_amount: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-green-600" required />
                                    </div>
                                </div>

                                {/* CALCULADORA VISUAL */}
                                {saleFormData.total_amount && saleFormData.paid_amount && (
                                    <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center text-sm font-bold">
                                        <span className="text-gray-500">Resta Pagar:</span>
                                        <span className={saleFormData.total_amount - saleFormData.paid_amount > 0 ? "text-orange-500" : "text-green-600"}>
                                            ${(saleFormData.total_amount - saleFormData.paid_amount).toLocaleString()}
                                        </span>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <select value={saleFormData.payment_method} onChange={e => setSaleFormData({ ...saleFormData, payment_method: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold bg-white outline-none">
                                        <option>Efectivo</option><option>Transferencia</option><option>Tarjeta</option>
                                    </select>
                                    <input placeholder="Notas (Opcional)" value={saleFormData.notes} onChange={e => setSaleFormData({ ...saleFormData, notes: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl text-sm" />
                                </div>

                                <Button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold">REGISTRAR</Button>
                            </form>
                        </div>

                        {/* LISTA DE MOVIMIENTOS */}
                        <div className="lg:col-span-8 bg-white rounded-2xl border shadow-sm overflow-hidden h-[600px] flex flex-col">
                            <div className="p-4 border-b bg-gray-50 font-bold text-xs text-gray-400 uppercase tracking-widest">Historial de Caja</div>
                            <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
                                {allSales.map(s => {
                                    const debt = s.total_amount - s.paid_amount;
                                    const isPaid = debt <= 0;
                                    return (
                                        <div key={s.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                            <div className="flex gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPaid ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                                    {isPaid ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm uppercase flex items-center gap-2">
                                                        {s.client_name}
                                                        {!isPaid && <span className="text-[9px] bg-orange-500 text-white px-1.5 rounded">DEBE ${debt}</span>}
                                                    </p>
                                                    <p className="text-xs text-gray-500 font-medium">{s.products_summary}</p>
                                                    <p className="text-[10px] text-gray-400 mt-1">{new Date(s.created_at).toLocaleDateString()} • {s.payment_method} {s.notes && `• ${s.notes}`}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="text-right">
                                                    <span className="block font-black text-gray-900">${s.total_amount}</span>
                                                    <span className="text-[10px] font-bold text-green-600 block">Pagado: ${s.paid_amount}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    {!isPaid && (
                                                        <button onClick={() => handleSettleDebt(s)} className="text-[9px] font-bold bg-black text-white px-2 py-1 rounded hover:bg-gray-800 transition-colors uppercase">
                                                            Saldar
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDeleteSale(s.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. BANNERS */}
                {activeTab === 'banners' && (
                    <div className="bg-white p-6 rounded-2xl border shadow-sm">
                        <h2 className="font-bold text-lg mb-4 uppercase">Gestión de Banners</h2>
                        <form onSubmit={handleBannerSubmit} className="flex gap-4 items-end mb-6">
                            <div className="flex-1 border-2 border-dashed border-gray-200 p-3 rounded-xl cursor-pointer relative hover:bg-gray-50">
                                <input type="file" onChange={e => setBannerImageFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                                <p className="text-center text-xs font-bold text-gray-400">{bannerImageFile ? bannerImageFile.name : 'Click para subir imagen'}</p>
                            </div>
                            <Button type="submit" className="bg-black text-white px-6 py-3 rounded-xl font-bold">SUBIR</Button>
                        </form>
                        <div className="grid grid-cols-2 gap-4">
                            {banners.map(b => (
                                <div key={b.id} className="relative group">
                                    <img src={b.image_url} className="w-full rounded-xl border shadow-sm" alt="" />
                                    <button onClick={() => supabase.from('banners').delete().eq('id', b.id).then(fetchBanners)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 5. DISEÑO */}
                {activeTab === 'design' && (
                    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border shadow-md">
                        <h2 className="font-black text-xl mb-6 flex items-center gap-2 uppercase"><Settings /> Configuración Home</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Video Principal (URL)</label>
                                <input value={siteConfig.hero_video_url} onChange={e => setSiteConfig({ ...siteConfig, hero_video_url: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-mono text-sm" placeholder="https://..." />
                            </div>
                            <Button onClick={async () => {
                                const updates = Object.keys(siteConfig).map(k => ({ id: k, value: siteConfig[k] }));
                                await supabase.from('site_config').upsert(updates);
                                alert("Diseño guardado");
                            }} className="w-full bg-black text-white py-4 rounded-xl font-bold shadow-lg">GUARDAR DISEÑO</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}