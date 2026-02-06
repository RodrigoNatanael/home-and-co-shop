import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseclient';
import { Trash2, Upload, Plus, Save, Image as ImageIcon, Package, CheckSquare, Square, User, DollarSign, FileText, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('products'); // 'products' | 'banners' | 'combos' | 'manual_sales'

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
        previous_price: '', // Nuevo campo
        tags: [] // Nuevo campo (Array de strings)
    });
    const [productImageFile, setProductImageFile] = useState(null);

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
        stock: '' // Agregado state de stock
    });
    const [selectedProductIds, setSelectedProductIds] = useState([]); // Array of IDs
    const [comboImageFile, setComboImageFile] = useState(null);

    // --- MANUAL SALES STATE ---
    const [manualSales, setManualSales] = useState([]);
    const [loadingManualSales, setLoadingManualSales] = useState(false);
    const [manualSaleFormData, setManualSaleFormData] = useState({
        seller: 'Rodrigo', // 'Rodrigo' | 'Vane'
        client_name: '',
        items: [], // Array of { id, name, price, quantity, type: 'product'|'combo' }
        total_amount: 0,
        paid_amount: ''
    });
    // --- PAYMENT MODAL STATE ---
    const [paymentModal, setPaymentModal] = useState({
        open: false,
        sale: null,
        amount: ''
    });


    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchBanners();
        fetchCombos();
        fetchManualSales();
    }, []);

    // --- FETCH DATA ---
    const fetchProducts = async () => {
        setLoadingProducts(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching products:', error);
        else setProducts(data || []);
        setLoadingProducts(false);
    };

    const fetchBanners = async () => {
        setLoadingBanners(true);
        const { data, error } = await supabase
            .from('banners')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching banners:', error);
        else setBanners(data || []);
        setLoadingBanners(false);
    };

    const fetchCombos = async () => {
        setLoadingCombos(true);
        const { data, error } = await supabase
            .from('combos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching combos:', error);
        else setCombos(data || []);
        setLoadingCombos(false);
    };

    // --- HANDLERS: PRODUCTS ---
    const handleProductInputChange = (e) => {
        const { name, value } = e.target;
        setProductFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProductImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setProductImageFile(e.target.files[0]);
        }
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
                const { error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(fileName, productImageFile);

                if (uploadError) throw uploadError;

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
                tags: productFormData.tags,
                image_url: imageUrl
            };

            if (productFormData.id) newProduct.id = productFormData.id;

            const { error } = await supabase.from('products').insert([newProduct]);
            if (error) throw error;

            alert('Producto creado!');
            setProductFormData({ id: '', name: '', price: '', category: '', description: '' });
            setProductImageFile(null);
            fetchProducts();
        } catch (error) {
            console.error('Error:', error);
            alert('Error creating product');
        } finally {
            setUploading(false);
        }
    };

    const handleProductDelete = async (id) => {
        if (!confirm('¿Borrar producto?')) return;
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) alert('Error deleting');
        else fetchProducts();
    };
    const handleUpdateStock = async (table, id, newStock) => {
        const { error } = await supabase
            .from(table)
            .update({ stock: parseInt(newStock) })
            .eq('id', id);

        if (error) {
            console.error('Error updating stock', error);
            alert('Error al actualizar stock');
        } else {
            console.log(`Stock updated for ${table} ${id}`);
            // Optimistic update or refetch? Refetch is safer for now.
            // But to avoid UI flickering, maybe just let it be. 
            // The user will see the value they typed. 
        }
    };

    // --- HANDLERS: BANNERS ---
    const handleBannerInputChange = (e) => {
        const { name, value } = e.target;
        setBannerFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBannerImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setBannerImageFile(e.target.files[0]);
        }
    };

    const handleBannerSubmit = async (e) => {
        e.preventDefault();
        if (!bannerImageFile) {
            alert('La imagen del banner es obligatoria');
            return;
        }

        try {
            setUploading(true);

            // Upload Banner Image
            const fileExt = bannerImageFile.name.split('.').pop();
            const fileName = `banner_${Math.random().toString(36).substring(2)}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('product-images') // Using same bucket as requested
                .upload(fileName, bannerImageFile);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
            const imageUrl = data.publicUrl;

            // Insert Banner
            const { error } = await supabase.from('banners').insert([{
                title: bannerFormData.title,
                link: bannerFormData.link,
                image_url: imageUrl
            }]);

            if (error) throw error;

            alert('Banner creado!');
            setBannerFormData({ title: '', link: '' });
            setBannerImageFile(null);
            fetchBanners();

        } catch (error) {
            console.error('Error:', error);
            alert('Error creating banner');
        } finally {
            setUploading(false);
        }
    };

    const handleBannerDelete = async (id) => {
        if (!confirm('¿Borrar banner?')) return;
        const { error } = await supabase.from('banners').delete().eq('id', id);
        if (error) alert('Error deleting');
        else fetchBanners();
    };

    // --- HANDLERS: COMBOS ---
    const handleComboInputChange = (e) => {
        const { name, value } = e.target;
        setComboFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleProductSelection = (productId) => {
        setSelectedProductIds(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId);
            } else {
                return [...prev, productId];
            }
        });
    };

    const handleComboImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setComboImageFile(e.target.files[0]);
        }
    };

    const handleComboSubmit = async (e) => {
        e.preventDefault();
        if (!comboFormData.name || !comboFormData.price) {
            alert('Nombre y Precio son obligatorios');
            return;
        }
        if (selectedProductIds.length === 0) {
            alert('Debes seleccionar al menos un producto para el combo');
            return;
        }

        try {
            setUploading(true);
            let imageUrl = null;

            if (comboImageFile) {
                const fileExt = comboImageFile.name.split('.').pop();
                const fileName = `combo_${Math.random().toString(36).substring(2)}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(fileName, comboImageFile);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
                imageUrl = data.publicUrl;
            }

            // Build products_json
            // We want to store { id, name } for easy display
            const productsJson = products
                .filter(p => selectedProductIds.includes(p.id))
                .map(p => ({ id: p.id, name: p.name }));

            const newCombo = {
                name: comboFormData.name,
                price: parseFloat(comboFormData.price),
                image_url: imageUrl,
                products_json: productsJson
            };

            const { error } = await supabase.from('combos').insert([newCombo]);
            if (error) throw error;

            alert('Combo creado!');
            setComboFormData({ name: '', price: '' });
            setSelectedProductIds([]);
            setComboImageFile(null);
            fetchCombos();

        } catch (error) {
            console.error('Error creating combo:', error);
            alert('Error creating combo: ' + (error.message || 'Unknown error'));
        } finally {
            setUploading(false);
        }
    };

    const fetchManualSales = async () => {
        setLoadingManualSales(true);
        const { data, error } = await supabase
            .from('manual_sales')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching manual sales:', error);
        else setManualSales(data || []);
        setLoadingManualSales(false);
    };

    // --- HANDLERS: MANUAL SALES ---
    const handleAddManualItem = (productId, type) => {
        // Find product or combo
        const list = type === 'product' ? products : combos;
        const item = list.find(i => i.id === productId);
        if (!item) return;

        setManualSaleFormData(prev => {
            const existing = prev.items.find(i => i.id === productId && i.type === type);
            let newItems;

            if (existing) {
                newItems = prev.items.map(i =>
                    (i.id === productId && i.type === type)
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            } else {
                newItems = [...prev.items, {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: 1,
                    type: type
                }];
            }

            // Recalculate total
            const newTotal = newItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
            return { ...prev, items: newItems, total_amount: newTotal };
        });
    };

    const handleRemoveManualItem = (index) => {
        setManualSaleFormData(prev => {
            const newItems = prev.items.filter((_, i) => i !== index);
            const newTotal = newItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
            return { ...prev, items: newItems, total_amount: newTotal };
        });
    };

    const handleManualSaleSubmit = async (e) => {
        e.preventDefault();
        const { seller, MQ, client_name, items, total_amount, paid_amount } = manualSaleFormData;

        if (!client_name || items.length === 0) {
            alert('Falta nombre del cliente o productos.');
            return;
        }

        try {
            setUploading(true);

            // 1. Determine Status
            const paid = parseFloat(paid_amount) || 0;
            const status = paid >= total_amount ? 'Pagado' : 'Pendiente';

            // 2. Deduct Stock
            for (const item of items) {
                const table = item.type === 'product' ? 'products' : 'combos';

                // Get current stock
                const { data: currentItem, error: fetchError } = await supabase
                    .from(table)
                    .select('stock')
                    .eq('id', item.id)
                    .single();

                if (fetchError) throw new Error(`Error buscando ${item.name}`);

                // Update stock
                const newStock = Math.max(0, currentItem.stock - item.quantity);
                const { error: updateError } = await supabase
                    .from(table)
                    .update({ stock: newStock })
                    .eq('id', item.id);

                if (updateError) throw new Error(`Error actualizando stock de ${item.name}`);
            }

            // 3. Save Sale
            const { error: insertError } = await supabase
                .from('manual_sales')
                .insert([{
                    seller,
                    client_name,
                    items_json: items,
                    total_amount,
                    paid_amount: paid,
                    status,
                    date: new Date().toISOString()
                }]);

            if (insertError) throw insertError;

            alert('Venta registrada!');
            setManualSaleFormData({
                seller: 'Rodrigo',
                client_name: '',
                items: [],
                total_amount: 0,
                paid_amount: ''
            });
            fetchManualSales();
            fetchProducts(); // Refresh stock in UI
            fetchCombos();   // Refresh stock in UI

        } catch (error) {
            console.error('Error processing sale:', error);
            alert('Error: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleOpenPaymentModal = (sale) => {
        setPaymentModal({
            open: true,
            sale: sale,
            amount: ''
        });
    };

    const handleUpdatePayment = async (e) => {
        e.preventDefault();
        const { sale, amount } = paymentModal;
        if (!sale || !amount) return;

        try {
            const extraPayment = parseFloat(amount);
            const newTotalPaid = (sale.paid_amount || 0) + extraPayment;
            const newStatus = newTotalPaid >= sale.total_amount ? 'Pagado' : 'Pendiente';

            const { error } = await supabase
                .from('manual_sales')
                .update({
                    paid_amount: newTotalPaid,
                    status: newStatus
                })
                .eq('id', sale.id);

            if (error) throw error;

            alert('Pago registrado exitosamente!');
            setPaymentModal({ open: false, sale: null, amount: '' });
            fetchManualSales();

        } catch (error) {
            console.error('Error updating payment:', error);
            alert('Error al registrar pago');
        }
    };

    const handleComboDelete = async (id) => {
        if (!confirm('¿Borrar combo?')) return;
        const { error } = await supabase.from('combos').delete().eq('id', id);
        if (error) alert('Error deleting combo');
        else fetchCombos();
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h1 className="font-display font-bold text-3xl">Panel de Administración</h1>

                    {/* TABS */}
                    <div className="flex bg-gray-200 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'products' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Package size={16} /> Productos
                        </button>
                        <button
                            onClick={() => setActiveTab('banners')}
                            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'banners' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <ImageIcon size={16} /> Banners
                        </button>
                        <button
                            onClick={() => setActiveTab('combos')}
                            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'combos' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <CheckSquare size={16} /> Combos
                        </button>
                        <button
                            onClick={() => setActiveTab('manual_sales')}
                            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'manual_sales' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <FileText size={16} /> Ventas Manuales
                        </button>
                    </div>
                </div>

                {/* --- CONTENT: PRODUCTS --- */}
                {activeTab === 'products' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Product Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-24">
                                <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                                    <Plus size={20} /> Nuevo Producto
                                </h2>
                                <form onSubmit={handleProductSubmit} className="space-y-4">
                                    <input type="text" name="id" value={productFormData.id} onChange={handleProductInputChange} placeholder="ID (Opcional)" className="w-full border p-2 rounded" />
                                    <input type="text" name="name" value={productFormData.name} onChange={handleProductInputChange} required placeholder="Nombre *" className="w-full border p-2 rounded" />
                                    <input type="number" name="price" value={productFormData.price} onChange={handleProductInputChange} required placeholder="Precio *" className="w-full border p-2 rounded" />
                                    <input type="number" name="stock" value={productFormData.stock} onChange={handleProductInputChange} required placeholder="Stock Inicial *" className="w-full border p-2 rounded" />
                                    <select name="category" value={productFormData.category} onChange={handleProductInputChange} required className="w-full border p-2 rounded">
                                        <option value="">Categoría...</option>
                                        <option value="Mates">Mates</option>
                                        <option value="Termos">Termos</option>
                                        <option value="Botellas">Botellas</option>
                                        <option value="Coolers">Coolers</option>
                                        <option value="Accesorios">Accesorios</option>
                                    </select>

                                    {/* Nuevos Campos: Precio Anterior y Etiquetas */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="number"
                                            name="previous_price"
                                            value={productFormData.previous_price}
                                            onChange={handleProductInputChange}
                                            placeholder="Precio Anterior (Opcional)"
                                            className="w-full border p-2 rounded text-sm"
                                        />
                                        <div className="border p-2 rounded bg-gray-50 max-h-32 overflow-y-auto">
                                            <p className="text-xs font-bold text-gray-500 mb-1">Etiquetas:</p>
                                            {['NUEVO', 'MÁS VENDIDO', 'ENVÍO GRATIS', 'PREMIUM'].map(tag => (
                                                <label key={tag} className="flex items-center gap-2 cursor-pointer text-xs mb-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={productFormData.tags.includes(tag)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setProductFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                                                            } else {
                                                                setProductFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
                                                            }
                                                        }}
                                                    />
                                                    {tag}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <textarea name="description" value={productFormData.description} onChange={handleProductInputChange} placeholder="Descripción" rows="3" className="w-full border p-2 rounded" />

                                    <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center">
                                        <input type="file" onChange={handleProductImageChange} className="hidden" id="prod-file" />
                                        <label htmlFor="prod-file" className="cursor-pointer flex flex-col items-center">
                                            <Upload className="mb-2 text-gray-400" />
                                            <span className="text-sm text-gray-500">{productImageFile ? productImageFile.name : 'Imagen del Producto'}</span>
                                        </label>
                                    </div>

                                    <Button type="submit" disabled={uploading} className="w-full mt-4">
                                        {uploading ? 'Guardando...' : 'Guardar Producto'}
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* Product List */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b flex justify-between">
                                    <h2 className="font-bold">Inventario</h2>
                                </div>
                                <div className="p-0">
                                    {products.map(p => (
                                        <div key={p.id} className="p-4 border-b flex items-center gap-4 hover:bg-gray-50">
                                            <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                {p.image_url && <img src={p.image_url} alt="" className="w-full h-full object-cover" />}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-sm">{p.name}</h3>
                                                <p className="text-xs text-gray-500">{p.id}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="font-bold text-sm">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(p.price)}</p>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] uppercase text-gray-400 font-bold">Stock</span>
                                                    <input
                                                        type="number"
                                                        defaultValue={p.stock}
                                                        className="w-16 border rounded p-1 text-sm text-right font-bold"
                                                        onBlur={(e) => handleUpdateStock('products', p.id, e.target.value)}
                                                    />
                                                </div>
                                                <button onClick={() => handleProductDelete(p.id)} className="text-gray-400 hover:text-red-500 p-2">
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

                {/* --- CONTENT: BANNERS --- */}
                {activeTab === 'banners' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Banner Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-24">
                                <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                                    <Plus size={20} /> Nuevo Banner
                                </h2>
                                <form onSubmit={handleBannerSubmit} className="space-y-4">
                                    <input type="text" name="title" value={bannerFormData.title} onChange={handleBannerInputChange} placeholder="Título Principal (Ej: VERANO 2026)" className="w-full border p-2 rounded" />
                                    <input type="text" name="link" value={bannerFormData.link} onChange={handleBannerInputChange} placeholder="Link destino (Ej: /catalog?category=Mates)" className="w-full border p-2 rounded" />

                                    <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center">
                                        <input type="file" onChange={handleBannerImageChange} className="hidden" id="banner-file" />
                                        <label htmlFor="banner-file" className="cursor-pointer flex flex-col items-center">
                                            <Upload className="mb-2 text-gray-400" />
                                            <span className="text-sm text-gray-500">{bannerImageFile ? bannerImageFile.name : 'Imagen (Horizontal)'}</span>
                                        </label>
                                    </div>

                                    <Button type="submit" disabled={uploading} className="w-full mt-4">
                                        {uploading ? 'Subiendo...' : 'Crear Banner'}
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* Banner List */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b flex justify-between">
                                    <h2 className="font-bold">Banners Activos</h2>
                                </div>
                                <div className="p-4 grid grid-cols-1 gap-4">
                                    {banners.map(b => (
                                        <div key={b.id} className="border rounded-lg overflow-hidden relative group">
                                            <div className="h-40 w-full bg-gray-100">
                                                <img src={b.image_url} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <button
                                                    onClick={() => handleBannerDelete(b.id)}
                                                    className="bg-white text-red-500 p-2 rounded-full shadow-lg hover:bg-red-50"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                            <div className="p-3 bg-white">
                                                <h3 className="font-bold text-sm truncate">{b.title || '(Sin título)'}</h3>
                                                <p className="text-xs text-gray-400 truncate">{b.link}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {banners.length === 0 && <p className="text-gray-500 text-center py-8">No hay banners.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- CONTENT: COMBOS --- */}
                {activeTab === 'combos' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Combo Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-24">
                                <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                                    <Plus size={20} /> Nuevo Combo
                                </h2>
                                <form onSubmit={handleComboSubmit} className="space-y-4">
                                    <input type="text" name="name" value={comboFormData.name} onChange={handleComboInputChange} required placeholder="Nombre del Combo *" className="w-full border p-2 rounded" />
                                    <input type="number" name="price" value={comboFormData.price} onChange={handleComboInputChange} required placeholder="Precio Especial *" className="w-full border p-2 rounded" />
                                    <input type="number" name="stock" value={comboFormData.stock} onChange={handleComboInputChange} required placeholder="Stock Combo *" className="w-full border p-2 rounded" />

                                    <div className="border border-gray-200 rounded p-3 max-h-48 overflow-y-auto">
                                        <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Incluir Productos:</p>
                                        <div className="space-y-2">
                                            {products.map(p => (
                                                <label key={p.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                                    <div
                                                        className={`w-4 h-4 border rounded flex items-center justify-center ${selectedProductIds.includes(p.id) ? 'bg-black border-black text-white' : 'border-gray-300'}`}
                                                    >
                                                        {selectedProductIds.includes(p.id) && <CheckSquare size={12} />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedProductIds.includes(p.id)}
                                                        onChange={() => toggleProductSelection(p.id)}
                                                        className="hidden"
                                                    />
                                                    <span className="text-sm truncate">{p.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center">
                                        <input type="file" onChange={handleComboImageChange} className="hidden" id="combo-file" />
                                        <label htmlFor="combo-file" className="cursor-pointer flex flex-col items-center">
                                            <Upload className="mb-2 text-gray-400" />
                                            <span className="text-sm text-gray-500">{comboImageFile ? comboImageFile.name : 'Foto del Combo'}</span>
                                        </label>
                                    </div>

                                    <Button type="submit" disabled={uploading} className="w-full mt-4">
                                        {uploading ? 'Creando Combo...' : 'Crear Combo'}
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* Combo List */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b flex justify-between">
                                    <h2 className="font-bold">Combos Activos</h2>
                                </div>
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {combos.map(c => (
                                        <div key={c.id} className="border rounded-lg overflow-hidden flex flex-col bg-white hover:shadow-md transition-shadow">
                                            <div className="h-48 bg-gray-100 relative">
                                                {c.image_url && <img src={c.image_url} alt="" className="w-full h-full object-cover" />}
                                                <button onClick={() => handleComboDelete(c.id)} className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-full hover:bg-red-50">
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-gray-700 shadow-sm flex items-center gap-1">
                                                    Stock:
                                                    <input
                                                        type="number"
                                                        defaultValue={c.stock}
                                                        className="w-12 border rounded p-0.5 text-center font-bold"
                                                        onBlur={(e) => handleUpdateStock('combos', c.id, e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-lg mb-1">{c.name}</h3>
                                                <p className="text-brand-dark font-bold text-xl mb-3">
                                                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(c.price)}
                                                </p>

                                                {/* Products List Preview */}
                                                {c.products_json && Array.isArray(c.products_json) && (
                                                    <div className="text-xs text-gray-500">
                                                        <span className="font-bold uppercase">Incluye:</span> {c.products_json.map(p => p.name).join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {combos.length === 0 && <p className="col-span-2 text-gray-500 text-center py-8">No hay combos activos.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- CONTENT: MANUAL SALES --- */}
                {activeTab === 'manual_sales' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* New Sale Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-24">
                                <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                                    <Plus size={20} /> Registrar Venta
                                </h2>
                                <form onSubmit={handleManualSaleSubmit} className="space-y-4">
                                    {/* Seller & Client */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 mb-1 block">Vendedor</label>
                                            <select
                                                value={manualSaleFormData.seller}
                                                onChange={(e) => setManualSaleFormData(prev => ({ ...prev, seller: e.target.value }))}
                                                className="w-full border p-2 rounded"
                                            >
                                                <option value="Rodrigo">Rodrigo</option>
                                                <option value="Vane">Vane</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 mb-1 block">Cliente</label>
                                            <input
                                                type="text"
                                                placeholder="Nombre Cliente *"
                                                required
                                                value={manualSaleFormData.client_name}
                                                onChange={(e) => setManualSaleFormData(prev => ({ ...prev, client_name: e.target.value }))}
                                                className="w-full border p-2 rounded"
                                            />
                                        </div>
                                    </div>

                                    {/* Product Selector */}
                                    <div className="border p-3 rounded bg-gray-50 max-h-48 overflow-y-auto">
                                        <p className="text-xs font-bold text-gray-500 mb-2">Agregar Productos:</p>
                                        <div className="space-y-1">
                                            {products.map(p => (
                                                <div key={p.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm border">
                                                    <div className="truncate text-sm flex-1 mr-2">{p.name} (${p.price})</div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddManualItem(p.id, 'product')}
                                                        className="bg-black text-white px-2 py-1 rounded text-xs font-bold hover:bg-gray-800"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            ))}
                                            {combos.map(c => (
                                                <div key={c.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm border border-purple-100">
                                                    <div className="truncate text-sm flex-1 mr-2 font-bold text-purple-700">{c.name} (Combo)</div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddManualItem(c.id, 'combo')}
                                                        className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold hover:bg-purple-700"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Selected Items List */}
                                    {manualSaleFormData.items.length > 0 && (
                                        <div className="border border-gray-200 rounded p-3 bg-gray-50">
                                            <p className="text-xs font-bold text-gray-500 mb-2">Resumen del Pedido:</p>
                                            <div className="space-y-2">
                                                {manualSaleFormData.items.map((item, idx) => (
                                                    <div key={`${item.id}-${idx}`} className="flex justify-between items-center text-sm">
                                                        <span>{item.quantity}x {item.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold">${item.price * item.quantity}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveManualItem(idx)}
                                                                className="text-red-500 hover:bg-red-50 rounded p-1"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                                                    <span>Total:</span>
                                                    <span>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(manualSaleFormData.total_amount)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Payment */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">Monto Pagado (Si es seña, poné menos)</label>
                                        <div className="relative">
                                            <DollarSign size={16} className="absolute left-3 top-3 text-gray-400" />
                                            <input
                                                type="number"
                                                placeholder="Monto Pagado"
                                                value={manualSaleFormData.paid_amount}
                                                onChange={(e) => setManualSaleFormData(prev => ({ ...prev, paid_amount: e.target.value }))}
                                                className="w-full border p-2 pl-9 rounded font-mono font-bold"
                                            />
                                        </div>
                                        {manualSaleFormData.total_amount > 0 && manualSaleFormData.paid_amount < manualSaleFormData.total_amount && (
                                            <p className="text-xs text-red-500 font-bold mt-1 text-right">
                                                Saldo Pendiente: {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(manualSaleFormData.total_amount - (manualSaleFormData.paid_amount || 0))}
                                            </p>
                                        )}
                                    </div>

                                    <Button type="submit" disabled={uploading || manualSaleFormData.items.length === 0} className="w-full mt-4">
                                        {uploading ? 'Registrando...' : 'Confirmar Venta'}
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* History List */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b flex justify-between">
                                    <h2 className="font-bold">Historial de Ventas</h2>
                                </div>
                                <div className="p-0">
                                    {manualSales.map(sale => {
                                        const isDebt = sale.status === 'Pendiente';
                                        return (
                                            <div key={sale.id} className={`p-4 border-b hover:bg-gray-50 ${isDebt ? 'bg-red-50' : ''}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="font-bold text-lg">{sale.client_name}</h3>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                            <User size={12} /> {sale.seller} &bull; {new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${isDebt ? 'bg-red-200 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                            {sale.status}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="text-sm text-gray-600 mb-2">
                                                    {sale.items_json.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                                </div>

                                                <div className="flex justify-between items-end border-t border-gray-200 pt-2 border-dashed">
                                                    <div className="text-xs">
                                                        {isDebt && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-red-600 font-bold">
                                                                    Falta: {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(sale.total_amount - sale.paid_amount)}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleOpenPaymentModal(sale)}
                                                                    className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm hover:bg-green-700 flex items-center gap-1"
                                                                >
                                                                    <DollarSign size={10} /> Cobrar
                                                                </button>
                                                                <a
                                                                    href={`https://wa.me/?text=${encodeURIComponent(`Hola ${sale.client_name}! 👋 Te recordamos que quedó un soldito pendiente de ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(sale.total_amount - sale.paid_amount)} por tu compra en Home & Co. Avisanos cuando puedas transferir! Gracias!`)}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="bg-[#25D366] text-white p-1 rounded hover:scale-110 transition-transform"
                                                                    title="Enviar recordatorio por WhatsApp"
                                                                >
                                                                    <MessageCircle size={14} />
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500">Total</p>
                                                        <p className="font-bold text-lg">
                                                            {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(sale.total_amount)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {manualSales.length === 0 && <p className="text-gray-500 text-center py-8">No hay ventas registradas.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* --- PAYMENT MODAL --- */}
                {paymentModal.open && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl relative animate-in fade-in zoom-in duration-200">
                            <button
                                onClick={() => setPaymentModal({ open: false, sale: null, amount: '' })}
                                className="absolute top-2 right-2 text-gray-400 hover:text-black"
                            >
                                <Plus className="transform rotate-45" size={24} />
                            </button>

                            <h3 className="font-bold text-xl mb-1">Cobrar Saldo</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Cliente: <span className="font-bold">{paymentModal.sale?.client_name}</span>
                            </p>

                            <div className="bg-red-50 p-3 rounded mb-4 text-center">
                                <p className="text-xs text-red-500 font-bold uppercase">Deuda Actual</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(paymentModal.sale?.total_amount - paymentModal.sale?.paid_amount)}
                                </p>
                            </div>

                            <form onSubmit={handleUpdatePayment}>
                                <label className="block text-sm font-bold mb-2">Monto a cobrar ahora:</label>
                                <div className="relative mb-4">
                                    <DollarSign size={18} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="number"
                                        autoFocus
                                        required
                                        min="1"
                                        placeholder="Ingrese monto..."
                                        value={paymentModal.amount}
                                        onChange={(e) => setPaymentModal(prev => ({ ...prev, amount: e.target.value }))}
                                        className="w-full border p-2 pl-10 rounded text-lg font-bold"
                                    />
                                </div>

                                <Button type="submit" className="w-full">
                                    Registrar Pago
                                </Button>
                            </form>
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
}
