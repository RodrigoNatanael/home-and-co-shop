import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseclient';
import { Trash2, Plus, RefreshCw, ShoppingBag, Video, Image as ImageIcon, Package, CheckSquare, Layers, Palette } from 'lucide-react';
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

    // --- FORMULARIO PRODUCTO ---
    const [productFormData, setProductFormData] = useState({
        name: '', price: '', previous_price: '', cost_price: '', category: '', description: '', stock: '',
        tags: [],
        variants: '' // String temporal para el input de colores
    });

    // ESTADO PARA 3 IMÁGENES
    const [imageFiles, setImageFiles] = useState([null, null, null]);

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

    // --- FUNCIONES FETCH ---
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

    // --- LÓGICA PRODUCTOS ---
    const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    const handleTagChange = (tag) => {
        setProductFormData(prev => {
            const currentTags = prev.tags || [];
            return currentTags.includes(tag) ? { ...prev, tags: currentTags.filter(t => t !== tag) } : { ...prev, tags: [...currentTags, tag] };
        });
    };

    const handleImageChange = (index, file) => {
        const newImages = [...imageFiles];
        newImages[index] = file;
        setImageFiles(newImages);
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            // 1. SUBIR IMÁGENES (Loop)
            const uploadedUrls = [];
            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i];
                if (file) {
                    const fileName = `prod_${Date.now()}_${i}_${file.name.replace(/\s/g, '_')}`;
                    const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
                    if (uploadError) throw uploadError;
                    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
                    uploadedUrls.push(data.publicUrl);
                }
            }

            // Si no hay imágenes, alertar (opcional)
            if (uploadedUrls.length === 0) {
                // Podríamos permitir crear sin foto, pero mejor avisar
            }

            // 2. PROCESAR VARIANTES (String a Array)
            // Ejemplo entrada: "Rojo, Azul, Verde" -> ["Rojo", "Azul", "Verde"]
            const variantsArray = productFormData.variants.split(',').map(v => v.trim()).filter(Boolean);

            // 3. CREAR OBJETO
            const newProduct = {
                id: generateUUID(),
                name: productFormData.name,
                price: parseFloat(productFormData.price),
                previous_price: productFormData.previous_price ? parseFloat(productFormData.previous_price) : null,
                cost_price: productFormData.cost_price ? parseFloat(productFormData.cost_price) : null,
                category: productFormData.category,
                description: productFormData.description,
                stock: parseInt(productFormData.stock),
                tags: productFormData.tags,

                // Nuevos campos
                variants: variantsArray, // Array de colores
                image_url: uploadedUrls[0] || null, // La primera es la principal
                gallery: uploadedUrls // Todas van a la galería
            };

            const { error } = await supabase.from('products').insert([newProduct]);
            if (error) throw error;

            alert("✅ Producto creado con éxito (Imágenes + Variantes)");

            // Reset
            setProductFormData({ name: '', price: '', previous_price: '', cost_price: '', category: '', description: '', stock: '', tags: [], variants: '' });
            setImageFiles([null, null, null]);
            fetchProducts();

        } catch (error) {
            console.error("Error:", error);
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

    // --- LÓGICA OTRAS PESTAÑAS (Resumidas para mantener foco) ---
    const handleManualSaleSubmit = async (e) => { /* ...mismo código anterior... */
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
                    <div className="hidden lg:flex gap-1 bg-gray-100 p-1 rounded-lg">
                        {['products', 'manual_sales', 'all_sales', 'banners', 'combos', 'design'].map(t => (
                            <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 text-xs font-bold uppercase rounded-md transition-all ${activeTab === t ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-900'}`}>
                                {t.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
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

                {activeTab === 'products' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* FORMULARIO IZQUIERDA */}
                        <div className="lg:col-span-5">
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md sticky top-24">
                                <h2 className="font-black text-lg mb-4 flex items-center gap-2 uppercase">
                                    <Plus size={20} /> Nuevo Producto
                                </h2>
                                <form onSubmit={handleProductSubmit} className="space-y-4">

                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Nombre</label>
                                        <input value={productFormData.name} onChange={e => setProductFormData({ ...productFormData, name: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold focus:border-black outline-none" required />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Precio Venta</label>
                                            <input type="number" value={productFormData.price} onChange={e => setProductFormData({ ...productFormData, price: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-green-600 outline-none" required />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Costo</label>
                                            <input type="number" value={productFormData.cost_price} onChange={e => setProductFormData({ ...productFormData, cost_price: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl text-gray-400 outline-none" placeholder="Opcional" />
                                        </div>
                                    </div>

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

                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Categoría</label>
                                        <select value={productFormData.category} onChange={e => setProductFormData({ ...productFormData, category: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold bg-white outline-none">
                                            <option value="">Seleccionar...</option>
                                            <option value="Mates">Mates</option>
                                            <option value="Termos">Termos</option>
                                            <option value="Hidratación">Hidratación</option>
                                            <option value="Combos">Combos</option>
                                            <option value="Accesorios">Accesorios</option>
                                            <option value="Coolers">Coolers</option>
                                        </select>
                                    </div>

                                    {/* SECCIÓN VARIANTES / COLORES (NUEVO) */}
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <label className="text-xs font-bold text-blue-800 uppercase block mb-2 flex items-center gap-2"><Palette size={14} /> Colores / Variantes</label>
                                        <input
                                            placeholder="Ej: Rojo, Azul, Negro Mate (Separar con comas)"
                                            value={productFormData.variants}
                                            onChange={e => setProductFormData({ ...productFormData, variants: e.target.value })}
                                            className="w-full border border-blue-200 p-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                                        />
                                        <p className="text-[10px] text-blue-400 mt-1 font-bold">Se mostrarán como botones en la web.</p>
                                    </div>

                                    {/* ETIQUETAS */}
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Filtros</label>
                                        <div className="space-y-2">
                                            {['NUEVO', 'OFERTA', 'DESTACADO', 'RUGGED', 'ENVIO GRATIS'].map(tag => (
                                                <div key={tag} onClick={() => handleTagChange(tag)} className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-1 rounded">
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${productFormData.tags.includes(tag) ? 'bg-black border-black text-white' : 'border-gray-300 bg-white'}`}>
                                                        {productFormData.tags.includes(tag) && <CheckSquare size={14} />}
                                                    </div>
                                                    <span className="text-xs font-bold uppercase">{tag}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <textarea placeholder="Descripción..." value={productFormData.description} onChange={e => setProductFormData({ ...productFormData, description: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl h-24 text-sm outline-none" />

                                    {/* SUBIDA DE IMÁGENES MÚLTIPLE (NUEVO) */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Galería de Imágenes (Máx 3)</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[0, 1, 2].map((index) => (
                                                <div key={index} className="aspect-square border-2 border-dashed border-gray-200 rounded-xl relative hover:bg-gray-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                                                    <input type="file" onChange={(e) => handleImageChange(index, e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                                    {imageFiles[index] ? (
                                                        <div className="w-full h-full relative">
                                                            <img src={URL.createObjectURL(imageFiles[index])} className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white text-xs font-bold">Cambiar</div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <ImageIcon className="text-gray-300 mb-1" size={20} />
                                                            <span className="text-[9px] font-bold text-gray-400">{index === 0 ? 'PRINCIPAL' : `VISTA ${index + 1}`}</span>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 transition-colors" disabled={uploading}>
                                        {uploading ? 'SUBIENDO GALERÍA...' : 'GUARDAR PRODUCTO'}
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* LISTA INVENTARIO (DERECHA) */}
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
                                                <div className="w-14 h-14 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 relative">
                                                    {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : <Package className="w-full h-full p-3 text-gray-300" />}
                                                    {/* Indicador de Galería */}
                                                    {p.gallery && p.gallery.length > 1 && (
                                                        <div className="absolute bottom-0 right-0 bg-black text-white text-[8px] px-1 rounded-tl font-bold flex items-center gap-0.5">
                                                            <Layers size={8} /> {p.gallery.length}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm text-gray-900 mb-0.5">{p.name}</p>
                                                    <div className="flex gap-2 items-center text-xs text-gray-500">
                                                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">{p.category}</span>
                                                        <span className="font-bold text-green-600">${p.price}</span>
                                                    </div>
                                                    {/* Mostrar Variantes si existen */}
                                                    {p.variants && p.variants.length > 0 && (
                                                        <div className="flex gap-1 mt-1">
                                                            {p.variants.map(v => <span key={v} className="text-[9px] border px-1 rounded bg-gray-50 text-gray-500">{v}</span>)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Stock</p>
                                                    <span className={`text-sm font-bold ${p.stock < 5 ? 'text-red-500' : 'text-gray-900'}`}>{p.stock}</span>
                                                </div>
                                                <button onClick={() => handleProductDelete(p.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* OTRAS PESTAÑAS (Ventas, etc. Se mantienen igual) */}
                {activeTab === 'manual_sales' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
                            <h2 className="font-black text-lg mb-4 uppercase">Registrar Venta</h2>
                            <form onSubmit={handleManualSaleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <select value={manualSaleFormData.seller} onChange={e => setManualSaleFormData({ ...manualSaleFormData, seller: e.target.value })} className="border-2 border-gray-100 p-3 rounded-xl font-bold bg-white">
                                        <option value="Rodrigo">Rodrigo</option>
                                        <option value="Vane">Vane</option>
                                    </select>
                                    <input placeholder="WhatsApp" value={manualSaleFormData.client_phone} onChange={e => setManualSaleFormData({ ...manualSaleFormData, client_phone: e.target.value })} className="border-2 border-gray-100 p-3 rounded-xl" />
                                </div>
                                <input placeholder="Cliente" value={manualSaleFormData.client_name} onChange={e => setManualSaleFormData({ ...manualSaleFormData, client_name: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold" required />
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
                                <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                                    <label className="text-xs font-bold text-yellow-700 uppercase">Seña / Pago</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="font-bold text-yellow-600">$</span>
                                        <input type="number" value={manualSaleFormData.paid_amount} onChange={e => setManualSaleFormData({ ...manualSaleFormData, paid_amount: e.target.value })} className="bg-transparent font-black text-xl w-full outline-none text-yellow-900" placeholder="0" />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold">REGISTRAR</Button>
                            </form>
                        </div>
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-[600px] overflow-y-auto">
                            <h3 className="font-bold text-sm text-gray-400 uppercase mb-4">Agregar Productos</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {products.map(p => (
                                    <button key={p.id} onClick={() => handleAddManualItem(p)} className="text-left p-3 border rounded-xl hover:bg-gray-50 flex justify-between items-center group">
                                        <span className="font-bold text-sm group-hover:text-black">{p.name}</span>
                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">${p.price}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
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