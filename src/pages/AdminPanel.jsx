import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseclient';
import { Trash2, Upload, Plus, Save, Image as ImageIcon, Package, CheckSquare, Square, User, DollarSign, FileText, MessageCircle, Globe, ShoppingBag, TrendingUp, Search, Calendar, Dices, Gift, Palette } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { generateProductDescription } from '../services/ai';

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('products'); // 'products' | 'banners' | 'combos' | 'manual_sales'
    const [newSalesCount, setNewSalesCount] = useState(0);

    // --- PRODUCTS STATE ---
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [productFormData, setProductFormData] = useState({
        id: '',
        name: '',
        price: '',
        category: '',
        description: '',
        stock: '',
        previous_price: '',
        cost_price: '',
        tags: []
    });
    const [productImageFile, setProductImageFile] = useState(null);

    const [generatingAI, setGeneratingAI] = useState(false);
    const handleGenerateDescription = async () => {
        if (!productFormData.name || !productFormData.category) {
            alert('⚠️ Primero escribí el Nombre y elegí la Categoría para que la IA sepa qué vender.');
            return;
        }
        try {
            setGeneratingAI(true);
            const desc = await generateProductDescription(productFormData.name, productFormData.category);
            setProductFormData(prev => ({ ...prev, description: desc }));
        } catch (error) {
            alert('No pudimos generar la descripción en este momento. ¡Probá de nuevo!');
        } finally {
            setGeneratingAI(false);
        }
    };

    // --- BANNERS STATE ---
    const [banners, setBanners] = useState([]);
    const [loadingBanners, setLoadingBanners] = useState(false);
    const [bannerFormData, setBannerFormData] = useState({
        title: '',
        link: ''
    });
    const [bannerImageFile, setBannerImageFile] = useState(null);

    // --- COMBOS STATE ---
    const [combos, setCombos] = useState([]);
    const [loadingCombos, setLoadingCombos] = useState(false);
    const [comboFormData, setComboFormData] = useState({
        name: '',
        price: '',
        stock: ''
    });
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [comboImageFile, setComboImageFile] = useState(null);

    // --- MANUAL SALES STATE ---
    const [manualSales, setManualSales] = useState([]);
    const [loadingManualSales, setLoadingManualSales] = useState(false);
    const [manualSaleFormData, setManualSaleFormData] = useState({
        seller: 'Rodrigo',
        client_name: '',
        client_phone: '',
        items: [],
        total_amount: 0,
        paid_amount: ''
    });

    const [paymentModal, setPaymentModal] = useState({
        open: false,
        sale: null,
        amount: ''
    });

    const [deleteModal, setDeleteModal] = useState({
        open: false,
        sale: null,
        reason: ''
    });

    const [allSales, setAllSales] = useState([]);
    const [loadingAllSales, setLoadingAllSales] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // --- RULETA STATE ---
    const [wheelConfig, setWheelConfig] = useState([]);
    const [wheelLeads, setWheelLeads] = useState([]);
    const [loadingWheel, setLoadingWheel] = useState(false);

    // --- SITE CONFIG STATE ---
    const [siteConfig, setSiteConfig] = useState({
        hero_video_url: '',
        cat1_img: '',
        cat1_link: '',
        cat1_title: '',
        cat2_img: '',
        cat2_link: '',
        cat2_title: '',
        cat3_img: '',
        cat3_link: '',
        cat3_title: ''
    });

    const [availableCategories, setAvailableCategories] = useState([]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    useEffect(() => {
        if (activeTab === 'wheel') fetchWheelData();
        if (activeTab === 'design') fetchSiteConfig();
    }, [activeTab]);

    const fetchSiteConfig = async () => {
        const { data } = await supabase.from('site_config').select('*');
        if (data) {
            const newConfig = { ...siteConfig };
            data.forEach(item => {
                const configKey = item.key || item.id;
                newConfig[configKey] = item.value;
            });
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

    const handleCategorySelect = (e, catPrefix) => {
        const selectedCategory = e.target.value;
        setSiteConfig(prev => ({
            ...prev,
            [`${catPrefix}_title`]: selectedCategory,
            [`${catPrefix}_link`]: `/catalog?category=${selectedCategory}`
        }));
    };

    const handleConfigChange = (e) => {
        const { name, value } = e.target;
        setSiteConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveConfig = async () => {
        try {
            setUploading(true);
            const updates = Object.keys(siteConfig).map(k => ({
                id: k,
                value: siteConfig[k]
            }));
            const { error } = await supabase.from('site_config').upsert(updates, { onConflict: 'id' });
            if (error) throw error;
            alert('Configuración guardada exitosamente!');
        } catch (error) {
            alert('Error al guardar: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const fetchWheelData = async () => {
        setLoadingWheel(true);
        const { data: config } = await supabase.from('wheel_config').select('*').order('id');
        const { data: leads } = await supabase.from('wheel_leads').select('*').order('created_at', { ascending: false });
        if (config) setWheelConfig(config);
        if (leads) setWheelLeads(leads);
        setLoadingWheel(false);
    };

    const handleUpdateWheelConfig = async (id, field, value) => {
        setWheelConfig(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
        const { error } = await supabase.from('wheel_config').update({ [field]: value }).eq('id', id);
        if (error) {
            alert('Error al actualizar configuración');
            fetchWheelData();
        }
    };

    const fetchProducts = async () => {
        setLoadingProducts(true);
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        setProducts(data || []);
        setLoadingProducts(false);
    };

    const fetchBanners = async () => {
        setLoadingBanners(true);
        const { data } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
        setBanners(data || []);
        setLoadingBanners(false);
    };

    const fetchCombos = async () => {
        setLoadingCombos(true);
        const { data } = await supabase.from('combos').select('*').order('created_at', { ascending: false });
        setCombos(data || []);
        setLoadingCombos(false);
    };

    const handleProductInputChange = (e) => {
        const { name, value } = e.target;
        setProductFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProductImageChange = (e) => {
        if (e.target.files && e.target.files[0]) setProductImageFile(e.target.files[0]);
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        if (!productFormData.name || !productFormData.price || !productFormData.category) {
            alert('Por favor completá los campos obligatorios');
            return;
        }
        try {
            setUploading(true);
            let imageUrl = null;
            if (productImageFile) {
                const fileExt = productImageFile.name.split('.').pop();
                const fileName = `prod_${Math.random().toString(36).substring(2)}.${fileExt}`;
                await supabase.storage.from('product-images').upload(fileName, productImageFile);
                const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
                imageUrl = data.publicUrl;
            }
            const newProduct = {
                name: productFormData.name,
                price: parseFloat(productFormData.price),
                category: productFormData.category,
                description: productFormData.description,
                stock: parseInt(productFormData.stock) || 0,
                previous_price: productFormData.previous_price ? parseFloat(productFormData.previous_price) : null,
                cost_price: productFormData.cost_price ? parseFloat(productFormData.cost_price) : null,
                tags: productFormData.tags,
                image_url: imageUrl
            };
            const { error } = await supabase.from('products').insert([newProduct]);
            if (error) throw error;
            alert('Producto creado!');
            setProductFormData({ id: '', name: '', price: '', category: '', description: '', cost_price: '', previous_price: '', tags: [] });
            setProductImageFile(null);
            fetchProducts();
        } catch (error) {
            alert('Error creating product');
        } finally {
            setUploading(false);
        }
    };

    const handleProductDelete = async (id) => {
        if (!confirm('¿Borrar producto?')) return;
        await supabase.from('products').delete().eq('id', id);
        fetchProducts();
    };

    const handleUpdateStock = async (table, id, newStock) => {
        await supabase.from(table).update({ stock: parseInt(newStock) }).eq('id', id);
    };

    const handleBannerInputChange = (e) => {
        const { name, value } = e.target;
        setBannerFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBannerImageChange = (e) => {
        if (e.target.files && e.target.files[0]) setBannerImageFile(e.target.files[0]);
    };

    const handleBannerSubmit = async (e) => {
        e.preventDefault();
        if (!bannerImageFile) return alert('La imagen del banner es obligatoria');
        try {
            setUploading(true);
            const fileExt = bannerImageFile.name.split('.').pop();
            const fileName = `banner_${Math.random().toString(36).substring(2)}.${fileExt}`;
            await supabase.storage.from('product-images').upload(fileName, bannerImageFile);
            const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
            await supabase.from('banners').insert([{ title: bannerFormData.title, link: bannerFormData.link, image_url: data.publicUrl }]);
            alert('Banner creado!');
            setBannerFormData({ title: '', link: '' });
            setBannerImageFile(null);
            fetchBanners();
        } catch (error) {
            alert('Error creating banner');
        } finally {
            setUploading(false);
        }
    };

    const handleBannerDelete = async (id) => {
        if (!confirm('¿Borrar banner?')) return;
        await supabase.from('banners').delete().eq('id', id);
        fetchBanners();
    };

    const handleComboInputChange = (e) => {
        const { name, value } = e.target;
        setComboFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleProductSelection = (productId) => {
        setSelectedProductIds(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
    };

    const handleComboImageChange = (e) => {
        if (e.target.files && e.target.files[0]) setComboImageFile(e.target.files[0]);
    };

    const handleComboSubmit = async (e) => {
        e.preventDefault();
        if (!comboFormData.name || !comboFormData.price || selectedProductIds.length === 0) return alert('Datos incompletos');
        try {
            setUploading(true);
            let imageUrl = null;
            if (comboImageFile) {
                const fileExt = comboImageFile.name.split('.').pop();
                const fileName = `combo_${Math.random().toString(36).substring(2)}.${fileExt}`;
                await supabase.storage.from('product-images').upload(fileName, comboImageFile);
                const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
                imageUrl = data.publicUrl;
            }
            const productsJson = products.filter(p => selectedProductIds.includes(p.id)).map(p => ({ id: p.id, name: p.name }));
            await supabase.from('combos').insert([{ name: comboFormData.name, price: parseFloat(comboFormData.price), image_url: imageUrl, products_json: productsJson }]);
            alert('Combo creado!');
            setComboFormData({ name: '', price: '' });
            setSelectedProductIds([]);
            setComboImageFile(null);
            fetchCombos();
        } finally {
            setUploading(false);
        }
    };

    const fetchManualSales = async () => {
        setLoadingManualSales(true);
        const { data } = await supabase.from('manual_sales').select('*').order('created_at', { ascending: false });
        setManualSales(data || []);
        setLoadingManualSales(false);
    };

    const fetchAllSales = async () => {
        setLoadingAllSales(true);
        try {
            const { data: manualData } = await supabase.from('manual_sales').select('*').order('created_at', { ascending: false });
            const { data: leadsData } = await supabase.from('leads').select('*').order('created_at', { ascending: false });

            const manualNormalized = (manualData || []).map(s => ({
                id: s.id, date: s.created_at, client: s.client_name, phone: s.client_phone,
                total: parseFloat(s.total_amount) || 0, paid: parseFloat(s.paid_amount) || 0,
                status: s.status, items: Array.isArray(s.items_json) ? s.items_json : [], origin: 'MANUAL'
            }));

            const leadsNormalized = (leadsData || []).map(l => {
                const metadata = typeof l.metadata === 'string' ? JSON.parse(l.metadata) : l.metadata;
                return {
                    id: l.id, date: l.created_at, client: l.name, phone: metadata?.shipping?.phone || '',
                    total: parseFloat(metadata?.total) || 0, paid: parseFloat(metadata?.total) || 0,
                    status: 'Pagado', items: metadata?.items || [], origin: 'WEB'
                };
            });

            setAllSales([...manualNormalized, ...leadsNormalized].sort((a, b) => new Date(b.date) - new Date(a.date)));
        } finally {
            setLoadingAllSales(false);
        }
    };

    const handleAddManualItem = (productId, type) => {
        const item = (type === 'product' ? products : combos).find(i => i.id === productId);
        if (!item) return;
        setManualSaleFormData(prev => {
            const existing = prev.items.find(i => i.id === productId && i.type === type);
            const newItems = existing
                ? prev.items.map(i => (i.id === productId && i.type === type) ? { ...i, quantity: i.quantity + 1 } : i)
                : [...prev.items, { id: item.id, name: item.name, price: item.price, quantity: 1, type }];
            return { ...prev, items: newItems, total_amount: newItems.reduce((sum, i) => sum + (i.price * i.quantity), 0) };
        });
    };

    const handleRemoveManualItem = (index) => {
        setManualSaleFormData(prev => {
            const newItems = prev.items.filter((_, i) => i !== index);
            return { ...prev, items: newItems, total_amount: newItems.reduce((sum, i) => sum + (i.price * i.quantity), 0) };
        });
    };

    const handleManualSaleSubmit = async (e) => {
        e.preventDefault();
        const { seller, client_name, client_phone, items, total_amount, paid_amount } = manualSaleFormData;
        if (!client_name || items.length === 0) return alert('Faltan datos');
        try {
            setUploading(true);
            const paid = parseFloat(paid_amount) || 0;
            const status = paid >= total_amount ? 'Pagado' : 'Pendiente';
            for (const item of items) {
                const table = item.type === 'product' ? 'products' : 'combos';
                const { data: curr } = await supabase.from(table).select('stock').eq('id', item.id).single();
                await supabase.from(table).update({ stock: Math.max(0, curr.stock - item.quantity) }).eq('id', item.id);
            }
            await supabase.from('manual_sales').insert([{ seller, client_name, client_phone, items_json: items, total_amount, paid_amount: paid, status, date: new Date().toISOString() }]);
            alert('Venta registrada!');
            setManualSaleFormData({ seller: 'Rodrigo', client_name: '', items: [], total_amount: 0, paid_amount: '' });
            fetchManualSales(); fetchProducts(); fetchCombos();
        } finally {
            setUploading(false);
        }
    };

    const handleOpenPaymentModal = (sale) => setPaymentModal({ open: true, sale, amount: '' });

    const handleUpdatePayment = async (e) => {
        e.preventDefault();
        const { sale, amount } = paymentModal;
        const newPaid = (sale.paid || 0) + parseFloat(amount);
        await supabase.from('manual_sales').update({ paid_amount: newPaid, status: newPaid >= sale.total ? 'Pagado' : 'Pendiente' }).eq('id', sale.id);
        setPaymentModal({ open: false, sale: null, amount: '' });
        fetchManualSales();
    };

    const handleDeleteSale = (sale) => setDeleteModal({ open: true, sale, reason: '' });

    const handleConfirmDelete = async () => {
        const { sale } = deleteModal;
        if (sale.origin === 'MANUAL') {
            for (const item of sale.items) {
                const table = item.type === 'product' ? 'products' : 'combos';
                const { data: curr } = await supabase.from(table).select('stock').eq('id', item.id).single();
                await supabase.from(table).update({ stock: curr.stock + item.quantity }).eq('id', item.id);
            }
            await supabase.from('manual_sales').delete().eq('id', sale.id);
        } else {
            await supabase.from('leads').delete().eq('id', sale.id);
        }
        setDeleteModal({ open: false, sale: null, reason: '' });
        fetchAllSales(); fetchManualSales(); fetchProducts();
    };

    const handleCloseDay = () => {
        const total = allSales.reduce((acc, s) => acc + (s.origin === 'MANUAL' ? s.paid : s.total), 0);
        const message = `📊 *CIERRE HOME & CO*\nTotal Recaudado: $${total}`;
        window.open(`https://wa.me/5492617523156?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleComboDelete = async (id) => {
        if (!confirm('¿Borrar combo?')) return;
        await supabase.from('combos').delete().eq('id', id);
        fetchCombos();
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'all_sales') {
            localStorage.setItem('admin_seen_count', allSales.length.toString());
            setNewSalesCount(0);
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12 transition-colors">
            <div className="lg:hidden sticky top-0 z-50 bg-white border-b shadow-sm p-4 flex justify-between items-center">
                <h1 className="font-display font-bold text-xl">Admin</h1>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
                    <div className="space-y-1.5">
                        <span className="block w-6 h-0.5 bg-gray-800"></span>
                        <span className="block w-6 h-0.5 bg-gray-800"></span>
                        <span className="block w-6 h-0.5 bg-gray-800"></span>
                    </div>
                </button>
            </div>

            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="absolute top-[60px] left-0 right-0 bg-white p-4 space-y-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleTabChange('products')} className="w-full text-left p-3 bg-gray-50 rounded">Productos</button>
                        <button onClick={() => handleTabChange('manual_sales')} className="w-full text-left p-3 bg-gray-50 rounded">Ventas Manuales</button>
                        <button onClick={() => handleTabChange('all_sales')} className="w-full text-left p-3 bg-gray-50 rounded">Todas las Ventas</button>
                        <button onClick={() => handleTabChange('banners')} className="w-full text-left p-3 bg-gray-50 rounded">Banners</button>
                        <button onClick={() => handleTabChange('combos')} className="w-full text-left p-3 bg-gray-50 rounded">Combos</button>
                        <button onClick={() => handleTabChange('wheel')} className="w-full text-left p-3 bg-gray-50 rounded">Ruleta</button>
                        <button onClick={() => handleTabChange('design')} className="w-full text-left p-3 bg-gray-50 rounded">Diseño</button>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 md:pt-24">
                <div className="hidden lg:flex justify-between mb-8 border-b pb-4">
                    <h1 className="font-display font-bold text-3xl">Administración</h1>
                    <div className="flex bg-gray-200 p-1 rounded-lg gap-1">
                        {['products', 'banners', 'combos', 'manual_sales', 'all_sales', 'wheel', 'design'].map(t => (
                            <button key={t} onClick={() => handleTabChange(t)} className={`px-4 py-2 rounded-md text-sm font-bold ${activeTab === t ? 'bg-white shadow-sm' : 'text-gray-500'}`}>
                                {t.replace('_', ' ').toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'design' && (
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="bg-white p-6 rounded-lg border shadow-sm">
                            <h2 className="font-bold text-xl mb-4">Diseño del Sitio</h2>
                            <input name="hero_video_url" value={siteConfig.hero_video_url} onChange={handleConfigChange} placeholder="URL Video Banner Principal" className="w-full border p-2 rounded mb-4" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[1, 2, 3].map(n => (
                                    <div key={n} className="p-4 bg-gray-50 rounded border">
                                        <p className="font-bold mb-2">Categoría {n}</p>
                                        <select onChange={(e) => handleCategorySelect(e, `cat${n}`)} className="w-full border p-2 rounded mb-2">
                                            <option value="">Seleccionar...</option>
                                            {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <input name={`cat${n}_img`} value={siteConfig[`cat${n}_img`]} onChange={handleConfigChange} placeholder="URL Video Fondo" className="w-full border p-1 rounded text-xs" />
                                    </div>
                                ))}
                            </div>
                            <Button onClick={handleSaveConfig} className="w-full mt-6 bg-purple-600">Guardar Cambios</Button>
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-lg border shadow-sm h-fit">
                            <h2 className="font-bold text-xl mb-4">Nuevo Producto</h2>
                            <form onSubmit={handleProductSubmit} className="space-y-3">
                                <input name="name" value={productFormData.name} onChange={handleProductInputChange} placeholder="Nombre" className="w-full border p-2 rounded" />
                                <input name="price" type="number" value={productFormData.price} onChange={handleProductInputChange} placeholder="Precio" className="w-full border p-2 rounded" />
                                <input name="stock" type="number" value={productFormData.stock} onChange={handleProductInputChange} placeholder="Stock" className="w-full border p-2 rounded" />
                                <select name="category" value={productFormData.category} onChange={handleProductInputChange} className="w-full border p-2 rounded">
                                    <option value="">Categoría...</option>
                                    <option value="Mates">Mates</option><option value="Termos">Termos</option><option value="Botellas">Botellas</option>
                                </select>
                                <textarea name="description" value={productFormData.description} onChange={handleProductInputChange} placeholder="Descripción" className="w-full border p-2 rounded" />
                                <input type="file" onChange={handleProductImageChange} className="text-xs" />
                                <Button type="submit" className="w-full" disabled={uploading}>Crear</Button>
                            </form>
                        </div>
                        <div className="lg:col-span-2 bg-white rounded-lg border shadow-sm overflow-hidden">
                            {products.map(p => (
                                <div key={p.id} className="p-4 border-b flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <img src={p.image_url} className="w-10 h-10 object-cover rounded" />
                                        <div><p className="font-bold text-sm">{p.name}</p><p className="text-xs text-gray-500">{p.category}</p></div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="font-bold text-sm">${p.price}</p>
                                        <input type="number" defaultValue={p.stock} onBlur={(e) => handleUpdateStock('products', p.id, e.target.value)} className="w-12 border p-1 text-xs rounded" />
                                        <button onClick={() => handleProductDelete(p.id)} className="text-red-400"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'manual_sales' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-lg border shadow-sm">
                            <h2 className="font-bold text-xl mb-4">Nueva Venta</h2>
                            <form onSubmit={handleManualSaleSubmit} className="space-y-4">
                                <input placeholder="Nombre Cliente" value={manualSaleFormData.client_name} onChange={e => setManualSaleFormData(prev => ({ ...prev, client_name: e.target.value }))} className="w-full border p-2 rounded" />
                                <div className="border p-2 rounded max-h-40 overflow-y-auto space-y-1">
                                    {products.map(p => (
                                        <button key={p.id} type="button" onClick={() => handleAddManualItem(p.id, 'product')} className="w-full text-left text-xs p-1 hover:bg-gray-100 flex justify-between">
                                            {p.name} <span>+</span>
                                        </button>
                                    ))}
                                </div>
                                {manualSaleFormData.items.length > 0 && (
                                    <div className="p-2 bg-gray-50 rounded text-sm">
                                        {manualSaleFormData.items.map((it, i) => <div key={i}>{it.quantity}x {it.name}</div>)}
                                        <p className="font-bold mt-2">Total: ${manualSaleFormData.total_amount}</p>
                                    </div>
                                )}
                                <input type="number" placeholder="Monto Pagado" value={manualSaleFormData.paid_amount} onChange={e => setManualSaleFormData(prev => ({ ...prev, paid_amount: e.target.value }))} className="w-full border p-2 rounded" />
                                <Button type="submit" className="w-full">Confirmar Venta</Button>
                            </form>
                        </div>
                        <div className="lg:col-span-2 bg-white rounded-lg border shadow-sm">
                            {manualSales.map(s => (
                                <div key={s.id} className="p-4 border-b flex justify-between items-center">
                                    <div>
                                        <p className="font-bold">{s.client_name}</p>
                                        <p className="text-xs text-gray-500">{s.status} - ${s.total_amount}</p>
                                    </div>
                                    {s.status === 'Pendiente' && <Button onClick={() => handleOpenPaymentModal(s)} className="text-xs py-1 h-fit">Cobrar</Button>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'all_sales' && (
                    <div className="space-y-4">
                        <div className="bg-white p-6 rounded-lg border flex justify-between items-center">
                            <h2 className="font-bold text-xl">Ventas del Día</h2>
                            <Button onClick={handleCloseDay} className="bg-green-600">Cerrar Jornada</Button>
                        </div>
                        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                            {allSales.map(s => (
                                <div key={s.id} className="p-4 border-b flex justify-between">
                                    <div>
                                        <span className={`text-[10px] p-1 rounded text-white ${s.origin === 'WEB' ? 'bg-blue-500' : 'bg-purple-500'}`}>{s.origin}</span>
                                        <p className="font-bold mt-1">{s.client}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">${s.total}</p>
                                        <button onClick={() => handleDeleteSale(s)} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'wheel' && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg border shadow-sm overflow-x-auto">
                            <h2 className="font-bold text-xl mb-4">Configuración Ruleta</h2>
                            <table className="w-full text-sm">
                                <thead><tr className="text-left border-b"><th>Premio</th><th>Valor</th><th>%</th><th>Stock</th></tr></thead>
                                <tbody>
                                    {wheelConfig.map(p => (
                                        <tr key={p.id} className="border-b">
                                            <td><input value={p.label} onChange={e => handleUpdateWheelConfig(p.id, 'label', e.target.value)} className="border p-1 w-full" /></td>
                                            <td><input value={p.value} onChange={e => handleUpdateWheelConfig(p.id, 'value', e.target.value)} className="border p-1 w-full" /></td>
                                            <td><input type="number" value={p.probability} onChange={e => handleUpdateWheelConfig(p.id, 'probability', e.target.value)} className="border p-1 w-16" /></td>
                                            <td><input type="number" value={p.stock} onChange={e => handleUpdateWheelConfig(p.id, 'stock', e.target.value)} className="border p-1 w-16" /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-white p-6 rounded-lg border shadow-sm">
                            <h2 className="font-bold text-xl mb-4">Participantes</h2>
                            {wheelLeads.map(l => (
                                <div key={l.id} className="p-2 border-b flex justify-between text-sm">
                                    <span>{l.name} ({l.whatsapp})</span>
                                    <span className="font-bold text-green-600">{l.prize_won}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {paymentModal.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-80">
                        <h3 className="font-bold mb-4">Cobrar Saldo</h3>
                        <input type="number" value={paymentModal.amount} onChange={e => setPaymentModal(prev => ({ ...prev, amount: e.target.value }))} className="w-full border p-2 rounded mb-4" placeholder="Monto" />
                        <div className="flex gap-2">
                            <Button onClick={() => setPaymentModal({ open: false, sale: null, amount: '' })} className="flex-1 bg-gray-400">Cancelar</Button>
                            <Button onClick={handleUpdatePayment} className="flex-1">Cobrar</Button>
                        </div>
                    </div>
                </div>
            )}

            {deleteModal.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-80">
                        <h3 className="font-bold mb-4 text-red-600">Eliminar Venta</h3>
                        <p className="text-sm mb-4">¿Confirmás eliminar la venta de {deleteModal.sale?.client}?</p>
                        <div className="flex gap-2">
                            <Button onClick={() => setDeleteModal({ open: false, sale: null, reason: '' })} className="flex-1 bg-gray-400">No</Button>
                            <Button onClick={handleConfirmDelete} className="flex-1 bg-red-600">Sí, eliminar</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}