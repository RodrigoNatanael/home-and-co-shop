import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseclient';
import {
    Trash2, Plus, RefreshCw, ShoppingBag, Video, Image as ImageIcon,
    Package, CheckSquare, FolderPlus, Tag, Settings, Layout, Ticket, Layers, Palette,
    DollarSign, CheckCircle, AlertCircle, User, UserPlus, ShoppingCart, Minus, Menu
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function AdminPanel() {
    // --- ESTADOS NAVEGACIÓN ---
    const [activeTab, setActiveTab] = useState('manual_sales');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // --- ESTADOS DATOS ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [banners, setBanners] = useState([]);
    const [allSales, setAllSales] = useState([]);
    const [siteConfig, setSiteConfig] = useState({ hero_video_url: '', cat1_title: '', cat2_title: '', cat3_title: '' });

    const [stats, setStats] = useState({ totalIncome: 0, pendingIncome: 0 });

    // --- ESTADOS FORMULARIOS ---
    const [uploading, setUploading] = useState(false);
    const [imageFiles, setImageFiles] = useState([null, null, null]);
    const [newCategory, setNewCategory] = useState({ name: '', video_url: '' });

    // FORM: PRODUCTO
    const [productFormData, setProductFormData] = useState({
        name: '', price: '', previous_price: '', cost_price: '',
        category: '', description: '', stock: '',
        tags: [], variants: ''
    });

    // --- ESTADO PARA POS (PUNTO DE VENTA) ---
    const [posSeller, setPosSeller] = useState('');
    const [posClient, setPosClient] = useState({ name: '', email: '', phone: '', instagram: '' });
    const [posCart, setPosCart] = useState([]);
    const [posItemToAdd, setPosItemToAdd] = useState({ productId: '', quantity: 1 });
    const [posPayment, setPosPayment] = useState({ amountPaid: '', method: 'Efectivo', notes: '' });

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

    // --- LÓGICA POS ---
    const addToCart = () => {
        const product = products.find(p => p.id === posItemToAdd.productId);
        if (!product) return;
        const existingItem = posCart.find(item => item.id === product.id);
        if (existingItem) { alert("Ya está en el carrito."); return; }
        const newItem = { id: product.id, name: product.name, price: product.price, quantity: parseInt(posItemToAdd.quantity), subtotal: product.price * parseInt(posItemToAdd.quantity) };
        setPosCart([...posCart, newItem]);
        setPosItemToAdd({ productId: '', quantity: 1 });
    };

    const removeFromCart = (index) => {
        const newCart = [...posCart];
        newCart.splice(index, 1);
        setPosCart(newCart);
    };

    const calculateTotal = () => {
        return posCart.reduce((acc, item) => acc + item.subtotal, 0);
    };

    const handlePOSSubmit = async (e) => {
        e.preventDefault();
        if (!posSeller) return alert("⚠️ Selecciona el vendedor");
        if (!posClient.name || !posClient.email) return alert("⚠️ Nombre y Email obligatorios");
        if (posCart.length === 0) return alert("⚠️ Carrito vacío");

        const totalAmount = calculateTotal();
        const paidAmount = parseFloat(posPayment.amountPaid) || 0;
        let status = 'Pagado';
        if (paidAmount < totalAmount) status = 'Señado / Pendiente';
        if (paidAmount === 0) status = 'Fiado Total';

        const summaryText = posCart.map(i => `${i.quantity}x ${i.name}`).join(', ');

        try {
            // Guardamos datos completos en LEADS (incluyendo Phone e Instagram)
            await supabase.from('leads').upsert({
                name: posClient.name,
                email: posClient.email,
                metadata: {
                    phone: posClient.phone,
                    instagram: posClient.instagram,
                    first_seller: posSeller
                },
                status: 'customer'
            }, { onConflict: 'email' });

            const { error: saleError } = await supabase.from('manual_sales').insert([{
                client_name: posClient.name,
                seller: posSeller,
                products_summary: summaryText,
                items_json: posCart,
                total_amount: totalAmount,
                paid_amount: paidAmount,
                payment_method: posPayment.method,
                notes: posPayment.notes,
                status: status,
                created_at: new Date()
            }]);

            if (saleError) throw saleError;

            for (const item of posCart) {
                const { data: currentProd } = await supabase.from('products').select('stock').eq('id', item.id).single();
                if (currentProd) { await supabase.from('products').update({ stock: currentProd.stock - item.quantity }).eq('id', item.id); }
            }

            setPosClient({ name: '', email: '', phone: '', instagram: '' });
            setPosCart([]);
            setPosPayment({ amountPaid: '', method: 'Efectivo', notes: '' });
            fetchSales();
            fetchProducts();
            alert("🎉 Venta Registrada!");
        } catch (error) { console.error(error); alert("Error: " + error.message); }
    };

    const handleSettleDebt = async (sale) => {
        if (!confirm(`¿Saldar deuda de $${sale.total_amount - sale.paid_amount}?`)) return;
        await supabase.from('manual_sales').update({ paid_amount: sale.total_amount, status: 'Pagado' }).eq('id', sale.id);
        fetchSales();
    };
    const handleDeleteSale = async (id) => {
        if (!confirm("¿Borrar venta?")) return;
        await supabase.from('manual_sales').delete().eq('id', id);
        fetchSales();
    };

    const handleBannerSubmit = async (e) => {
        e.preventDefault();
        let url = ''; if (bannerImageFile) { const fileName = `ban_${Date.now()}`; await supabase.storage.from('product-images').upload(fileName, bannerImageFile); url = supabase.storage.from('product-images').getPublicUrl(fileName).data.publicUrl; }
        await supabase.from('banners').insert([{ ...bannerFormData, image_url: url }]); setBannerFormData({ title: '', link: '' }); setBannerImageFile(null); fetchBanners();
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
            {/* HEADER RESPONSIVE */}
            <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
                    <h1 className="text-xl font-black italic shrink-0">ADMIN H&C</h1>
                    <button className="lg:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu size={24} /></button>
                    <div className="hidden lg:flex gap-1 bg-gray-100 p-1 rounded-xl">
                        {[
                            { id: 'products', label: 'Productos', icon: <Package size={14} /> },
                            { id: 'categories_mgr', label: 'Categorías', icon: <FolderPlus size={14} /> },
                            { id: 'manual_sales', label: 'Punto de Venta', icon: <DollarSign size={14} /> },
                            { id: 'banners', label: 'Banners', icon: <ImageIcon size={14} /> },
                            { id: 'design', label: 'Diseño', icon: <Layout size={14} /> }
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'}`}>
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                {isMobileMenuOpen && (
                    <div className="lg:hidden bg-white border-t p-2 grid grid-cols-2 gap-2">
                        {[
                            { id: 'products', label: 'Productos', icon: <Package size={14} /> },
                            { id: 'categories_mgr', label: 'Categorías', icon: <FolderPlus size={14} /> },
                            { id: 'manual_sales', label: 'Caja / POS', icon: <DollarSign size={14} /> },
                            { id: 'banners', label: 'Banners', icon: <ImageIcon size={14} /> },
                            { id: 'design', label: 'Diseño', icon: <Layout size={14} /> }
                        ].map(tab => (
                            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }} className={`p-3 rounded-lg text-xs font-bold uppercase flex flex-col items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-black text-white' : 'bg-gray-50 text-gray-500'}`}>
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">

                {/* 1. PRODUCTOS */}
                {activeTab === 'products' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-5">
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
                                <h2 className="font-black text-lg mb-4 flex items-center gap-2 uppercase"><Plus size={20} /> Nuevo Producto</h2>
                                <form onSubmit={handleProductSubmit} className="space-y-4">
                                    <input placeholder="Nombre" value={productFormData.name} onChange={e => setProductFormData({ ...productFormData, name: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold" required />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="number" placeholder="Precio" value={productFormData.price} onChange={e => setProductFormData({ ...productFormData, price: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-green-600" required />
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
                                            <div key={i} className="aspect-square border-2 border-dashed border-gray-200 rounded-xl relative flex items-center justify-center overflow-hidden">
                                                <input type="file" onChange={e => handleImageChange(i, e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                                {imageFiles[i] ? <img src={URL.createObjectURL(imageFiles[i])} className="w-full h-full object-cover" alt="" /> : <ImageIcon className="text-gray-300" />}
                                            </div>
                                        ))}
                                    </div>
                                    <Button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold" disabled={uploading}>{uploading ? '...' : 'GUARDAR'}</Button>
                                </form>
                            </div>
                        </div>
                        <div className="lg:col-span-7">
                            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden h-[500px] lg:h-[800px] flex flex-col">
                                <div className="p-4 border-b bg-gray-50 flex justify-between items-center font-bold text-xs text-gray-400 uppercase">Inventario ({products.length}) <RefreshCw size={14} onClick={fetchProducts} /></div>
                                <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
                                    {products.map(p => (
                                        <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">{p.image_url && <img src={p.image_url} className="w-full h-full object-cover" alt="" />}</div>
                                                <div><p className="font-black text-xs">{p.name}</p><p className="text-[10px] text-gray-500">Stock: {p.stock}</p></div>
                                            </div>
                                            <button onClick={() => { if (confirm('¿Borrar?')) supabase.from('products').delete().eq('id', p.id).then(fetchProducts) }}><Trash2 size={16} className="text-gray-300" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. CATEGORÍAS */}
                {activeTab === 'categories_mgr' && (
                    <div className="grid grid-cols-1 gap-6">
                        <div className="bg-white p-6 rounded-2xl border shadow-md">
                            <h2 className="font-black text-lg mb-4 uppercase">Nueva Categoría</h2>
                            <form onSubmit={async (e) => { e.preventDefault(); await supabase.from('categories').insert([newCategory]); setNewCategory({ name: '', video_url: '' }); fetchCategories(); }} className="space-y-4">
                                <input placeholder="Nombre" value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold" required />
                                <input placeholder="URL Video" value={newCategory.video_url} onChange={e => setNewCategory({ ...newCategory, video_url: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-mono text-xs" />
                                <Button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold">GUARDAR</Button>
                            </form>
                        </div>
                        <div className="bg-white rounded-2xl border shadow-sm divide-y">
                            {categories.map(c => (
                                <div key={c.id} className="p-4 flex justify-between items-center"><span className="font-bold text-sm uppercase">{c.name}</span><button onClick={() => supabase.from('categories').delete().eq('id', c.id).then(fetchCategories)}><Trash2 size={16} className="text-gray-300" /></button></div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. POS (PUNTO DE VENTA) - MÓVIL + DATOS COMPLETOS */}
                {activeTab === 'manual_sales' && (
                    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8">

                        <div className="lg:col-span-12 grid grid-cols-2 gap-2 lg:gap-4">
                            <div className="bg-black text-white p-4 lg:p-6 rounded-2xl shadow-lg">
                                <p className="text-[10px] font-bold uppercase opacity-60">Caja Real</p>
                                <p className="text-2xl lg:text-3xl font-black">${stats.totalIncome.toLocaleString()}</p>
                            </div>
                            <div className="bg-orange-50 border border-orange-100 p-4 lg:p-6 rounded-2xl shadow-sm">
                                <p className="text-[10px] font-bold uppercase text-orange-600">Por Cobrar</p>
                                <p className="text-2xl lg:text-3xl font-black text-orange-600">${stats.pendingIncome.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="lg:col-span-5 space-y-4 lg:space-y-6 order-2 lg:order-1">

                            <div className="bg-white p-4 lg:p-6 rounded-2xl border shadow-sm">
                                <h3 className="font-bold uppercase text-xs text-gray-400 mb-3 flex items-center gap-2"><User size={14} /> Vendedor</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {['Rodrigo', 'Vanesa'].map(seller => (
                                        <button key={seller} onClick={() => setPosSeller(seller)} className={`py-4 rounded-xl font-bold text-sm border-2 transition-all ${posSeller === seller ? 'border-black bg-black text-white' : 'border-gray-100 hover:border-gray-300'}`}>
                                            {seller.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-4 lg:p-6 rounded-2xl border shadow-sm">
                                <h3 className="font-bold uppercase text-xs text-gray-400 mb-3 flex items-center gap-2"><ShoppingBag size={14} /> Agregar</h3>
                                <div className="flex flex-col lg:flex-row gap-2 mb-3">
                                    <select value={posItemToAdd.productId} onChange={e => setPosItemToAdd({ ...posItemToAdd, productId: e.target.value })} className="flex-1 border-2 border-gray-100 p-3 rounded-xl font-bold bg-white text-sm h-12">
                                        <option value="">Seleccionar producto...</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price})</option>)}
                                    </select>
                                    <div className="flex gap-2">
                                        <input type="number" value={posItemToAdd.quantity} onChange={e => setPosItemToAdd({ ...posItemToAdd, quantity: e.target.value })} className="w-20 border-2 border-gray-100 p-3 rounded-xl font-bold text-center h-12" min="1" />
                                        <Button onClick={addToCart} className="bg-black text-white px-4 rounded-xl h-12 flex items-center justify-center flex-1 lg:flex-none"><Plus size={20} /></Button>
                                    </div>
                                </div>
                            </div>

                            {/* CLIENTE COMPLETO (RECUPERADO) */}
                            <div className="bg-white p-4 lg:p-6 rounded-2xl border shadow-sm">
                                <h3 className="font-bold uppercase text-xs text-gray-400 mb-3 flex items-center gap-2"><UserPlus size={14} /> Cliente (CRM)</h3>
                                <div className="space-y-3">
                                    <input placeholder="Nombre Completo" value={posClient.name} onChange={e => setPosClient({ ...posClient, name: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold" />
                                    <input placeholder="Email (Obligatorio)" value={posClient.email} onChange={e => setPosClient({ ...posClient, email: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-sm" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input placeholder="Teléfono" value={posClient.phone} onChange={e => setPosClient({ ...posClient, phone: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl text-sm" />
                                        <input placeholder="Instagram" value={posClient.instagram} onChange={e => setPosClient({ ...posClient, instagram: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl text-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-7 space-y-4 lg:space-y-6 order-1 lg:order-2">
                            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col">
                                <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
                                    <span className="font-bold text-sm uppercase">Total a Pagar</span>
                                    <span className="font-black text-2xl">${calculateTotal().toLocaleString()}</span>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto p-2 space-y-2">
                                    {posCart.length === 0 ? (
                                        <div className="p-8 text-center text-gray-300 text-xs font-bold uppercase">Carrito Vacío</div>
                                    ) : (
                                        posCart.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl bg-gray-50">
                                                <div><p className="font-bold text-sm">{item.name}</p><p className="text-xs text-gray-500">{item.quantity} x ${item.price}</p></div>
                                                <div className="flex items-center gap-4"><span className="font-black text-sm">${item.subtotal}</span><button onClick={() => removeFromCart(idx)} className="text-red-400"><Minus size={16} /></button></div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-4 lg:p-6 rounded-2xl border shadow-md">
                                <h3 className="font-bold uppercase text-xs text-gray-400 mb-3">Confirmar Pago</h3>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <input type="number" placeholder="$ Abona" value={posPayment.amountPaid} onChange={e => setPosPayment({ ...posPayment, amountPaid: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-green-600 text-lg h-14" />
                                    <select value={posPayment.method} onChange={e => setPosPayment({ ...posPayment, method: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold bg-white h-14">
                                        <option>Efectivo</option><option>Transferencia</option><option>Tarjeta</option>
                                    </select>
                                </div>
                                <input placeholder="Notas (Opcional)" value={posPayment.notes} onChange={e => setPosPayment({ ...posPayment, notes: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl text-sm mb-4" />
                                <Button onClick={handlePOSSubmit} className="w-full bg-black text-white py-4 rounded-xl font-black text-lg shadow-xl">REGISTRAR VENTA</Button>
                            </div>
                        </div>

                        <div className="lg:col-span-12 order-3 bg-white rounded-2xl border shadow-sm overflow-hidden h-[400px] flex flex-col">
                            <div className="p-4 border-b bg-gray-50 font-bold text-xs text-gray-400 uppercase">Últimos Movimientos</div>
                            <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
                                {allSales.map(s => {
                                    const debt = s.total_amount - s.paid_amount;
                                    const isPaid = debt <= 0;
                                    return (
                                        <div key={s.id} className="p-4 flex items-center justify-between">
                                            <div>
                                                <p className="font-black text-sm uppercase flex items-center gap-2">{s.client_name} {!isPaid && <span className="text-[9px] bg-orange-500 text-white px-1.5 rounded">DEBE ${debt}</span>}</p>
                                                <p className="text-[10px] text-gray-400 mt-1">{new Date(s.created_at).toLocaleDateString()} • {s.products_summary}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="font-black text-sm">${s.total_amount}</span>
                                                {!isPaid && <button onClick={() => handleSettleDebt(s)} className="text-[9px] font-bold bg-black text-white px-2 py-1 rounded">SALDAR</button>}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                    </div>
                )}

                {/* 4. BANNERS Y 5. DISEÑO (Simplificados) */}
                {(activeTab === 'banners' || activeTab === 'design') && (
                    <div className="p-8 text-center text-gray-500 bg-white rounded-xl border">
                        <p>Funcionalidad de escritorio. Usá la PC para editar Banners o Diseño.</p>
                    </div>
                )}

            </div>
        </div>
    );
}