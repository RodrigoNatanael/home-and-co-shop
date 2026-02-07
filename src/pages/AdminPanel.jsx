import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseclient';
import { Trash2, Upload, Plus, Save, Image as ImageIcon, Package, CheckSquare, Square, User, DollarSign, FileText, MessageCircle, Globe, ShoppingBag, TrendingUp, Search, Calendar, Dices, Gift } from 'lucide-react';
import { Button } from '../components/ui/Button';

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
        previous_price: '', // Nuevo campo
        cost_price: '', // Nuevo campo costo
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
        client_phone: '', // Nuevo campo
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

    // --- DELETE MODAL STATE ---
    const [deleteModal, setDeleteModal] = useState({
        open: false,
        sale: null,
        reason: '' // 'error', 'return', 'test'
    });


    const [allSales, setAllSales] = useState([]); // Array of merged sales: { ...data, origin: 'WEB' | 'MANUAL' }
    const [loadingAllSales, setLoadingAllSales] = useState(false);

    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // --- RULETA STATE ---
    const [wheelConfig, setWheelConfig] = useState([]);
    const [wheelLeads, setWheelLeads] = useState([]);
    const [loadingWheel, setLoadingWheel] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchBanners();
        fetchCombos();
        fetchManualSales();
        fetchAllSales(); // Unified Fetch
        fetchManualSales();
        fetchAllSales(); // Unified Fetch
        fetchWheelData();
    }, []);

    // Refresh Wheel Data when tab becomes active
    useEffect(() => {
        if (activeTab === 'wheel') {
            fetchWheelData();
        }
    }, [activeTab]);

    // --- FETCH RULETA ---
    const fetchWheelData = async () => {
        setLoadingWheel(true);
        const { data: config } = await supabase.from('wheel_config').select('*').order('id');
        const { data: leads } = await supabase.from('wheel_leads').select('*').order('created_at', { ascending: false });

        if (config) setWheelConfig(config);
        if (leads) setWheelLeads(leads);
        setLoadingWheel(false);
    };

    const handleUpdateWheelConfig = async (id, field, value) => {
        // Optimistic Update
        setWheelConfig(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));

        const { error } = await supabase
            .from('wheel_config')
            .update({ [field]: value })
            .eq('id', id);

        if (error) {
            console.error('Error updating wheel config:', error);
            alert('Error al actualizar configuración');
            fetchWheelData(); // Revert
        }
    };

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
                cost_price: productFormData.cost_price ? parseFloat(productFormData.cost_price) : null,
                tags: productFormData.tags,
                image_url: imageUrl
            };

            if (productFormData.id) newProduct.id = productFormData.id;

            const { error } = await supabase.from('products').insert([newProduct]);
            if (error) throw error;

            alert('Producto creado!');
            setProductFormData({ id: '', name: '', price: '', category: '', description: '', cost_price: '', previous_price: '', tags: [] });
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

    const fetchAllSales = async () => {
        setLoadingAllSales(true);
        try {
            // 1. Fetch Manual Sales
            const { data: manualData, error: manualError } = await supabase
                .from('manual_sales')
                .select('*')
                .order('created_at', { ascending: false });

            // 2. Fetch Leads (Web Sales)
            const { data: leadsData, error: leadsError } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (manualError) throw manualError;
            if (leadsError) throw leadsError;

            // 3. Normalize Data
            const manualNormalized = (manualData || []).map(s => {
                let safeItems = [];
                if (Array.isArray(s.items_json)) {
                    safeItems = s.items_json;
                } else if (typeof s.items_json === 'string') {
                    try { safeItems = JSON.parse(s.items_json); } catch (e) { }
                }

                return {
                    id: s.id,
                    date: s.created_at,
                    client: s.client_name,
                    phone: s.client_phone,
                    total: parseFloat(s.total_amount) || 0,
                    paid: parseFloat(s.paid_amount) || 0,
                    status: s.status,
                    items: safeItems,
                    origin: 'MANUAL',
                    originalData: s
                };
            });

            const leadsNormalized = (leadsData || []).map(l => {
                let metadata = l.metadata;
                // Parse metadata if it's a string (defensive)
                if (typeof metadata === 'string') {
                    try { metadata = JSON.parse(metadata); } catch (e) { metadata = {}; }
                }

                const safeItems = Array.isArray(metadata?.items) ? metadata.items : [];

                return {
                    id: l.id,
                    date: l.created_at,
                    client: l.name,
                    phone: metadata?.shipping?.phone || '',
                    total: parseFloat(metadata?.total) || 0,
                    paid: parseFloat(metadata?.total) || 0, // Assume web sales are fully paid
                    status: 'Pagado',
                    items: safeItems,
                    origin: 'WEB',
                    originalData: l
                };
            });

            // 4. Merge and Sort
            const merged = [...manualNormalized, ...leadsNormalized].sort((a, b) =>
                new Date(b.date) - new Date(a.date)
            );

            setAllSales(merged);

            // --- CHECK FOR NEW SALES ---
            const lastSeenCount = parseInt(localStorage.getItem('admin_seen_count') || '0');
            const currentCount = merged.length;
            if (currentCount > lastSeenCount) {
                setNewSalesCount(currentCount - lastSeenCount);
            }

        } catch (error) {
            console.error('Error fetching all sales:', error);
        } finally {
            setLoadingAllSales(false);
        }
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
        const { seller, MQ, client_name, client_phone, items, total_amount, paid_amount } = manualSaleFormData;

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
                    client_phone, // Save phone
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

    const handleDeleteSale = (sale) => {
        setDeleteModal({ open: true, sale, reason: '' });
    };

    const handleConfirmDelete = async () => {
        const { sale, reason } = deleteModal;
        if (!sale || !reason) {
            alert('Por favor selecciona un motivo.');
            return;
        }

        try {
            // Restore logic: Only for MANUAL sales and specific reasons
            const shouldRestoreStock = sale.origin === 'MANUAL';

            if (shouldRestoreStock) {
                const items = sale.items;
                for (const item of items) {
                    const table = item.type === 'product' ? 'products' : 'combos';

                    const { data: currentItem, error: fetchError } = await supabase
                        .from(table)
                        .select('stock')
                        .eq('id', item.id)
                        .single();

                    if (!fetchError && currentItem) {
                        const newStock = currentItem.stock + item.quantity;
                        await supabase.from(table).update({ stock: newStock }).eq('id', item.id);
                    }
                }
                await supabase.from('manual_sales').delete().eq('id', sale.id);
            } else {
                // Delete Web Lead
                await supabase.from('leads').delete().eq('id', sale.id);
            }

            alert('Venta eliminada correctamente.');
            setDeleteModal({ open: false, sale: null, reason: '' });
            fetchAllSales();
            fetchManualSales();
            fetchProducts();
            fetchCombos();

        } catch (error) {
            console.error('Error deleting sale:', error);
            alert('Error al borrar venta');
        }
    };

    const handleCloseDay = () => {
        if (!confirm('¿Confirmás el cierre de hoy?')) return;

        const totalWeb = allSales.filter(s => s.origin === 'WEB').reduce((acc, s) => acc + s.total, 0);
        const totalManual = allSales.filter(s => s.origin === 'MANUAL').reduce((acc, s) => acc + (s.paid || 0), 0);
        const totalRevenue = totalWeb + totalManual;

        // Calculate Profit
        let totalCost = 0;
        allSales.forEach(sale => {
            sale.items.forEach(item => {
                const product = products.find(p => p.id === item.id);
                if (product && product.cost_price) {
                    totalCost += ((parseFloat(product.cost_price) || 0) * item.quantity);
                }
            });
        });

        const netProfit = totalRevenue - totalCost;

        const message = `📊 *RESUMEN HOME & CO - ${new Date().toLocaleDateString('es-AR')}* 📊%0A` +
            `🌐 Ventas Web: $${new Intl.NumberFormat('es-AR').format(totalWeb)}%0A` +
            `🛍️ Ventas Manuales: $${new Intl.NumberFormat('es-AR').format(totalManual)}%0A` +
            `💰 *TOTAL RECAUDADO: $${new Intl.NumberFormat('es-AR').format(totalRevenue)}*%0A` +
            `📈 *GANANCIA NETA: $${new Intl.NumberFormat('es-AR').format(netProfit)}*`;

        const targetPhone = '5492617523156';
        window.open(`https://wa.me/${targetPhone}?text=${message}`, '_blank');
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
                        <button
                            onClick={() => {
                                setActiveTab('all_sales');
                                // Reset Notification
                                const count = allSales.length;
                                localStorage.setItem('admin_seen_count', count.toString());
                                setNewSalesCount(0);
                            }}
                            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all relative ${activeTab === 'all_sales' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <DollarSign size={16} /> Todas las Ventas
                            {newSalesCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] text-white justify-center items-center">
                                        {newSalesCount}
                                    </span>
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('wheel')}
                            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'wheel' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Dices size={16} /> Ruleta
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
                                    <input type="number" name="cost_price" value={productFormData.cost_price} onChange={handleProductInputChange} placeholder="Precio de Costo (Admin)" className="w-full border p-2 rounded bg-yellow-50" />
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
                                                    {p.cost_price && <span className="text-[10px] text-yellow-600 font-bold mt-1">Costo: ${p.cost_price}</span>}
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
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Nombre *"
                                                    required
                                                    value={manualSaleFormData.client_name}
                                                    onChange={(e) => setManualSaleFormData(prev => ({ ...prev, client_name: e.target.value }))}
                                                    className="w-1/2 border p-2 rounded"
                                                />
                                                <input
                                                    type="tel"
                                                    placeholder="Teléfono (Ej: 261...)"
                                                    value={manualSaleFormData.client_phone}
                                                    onChange={(e) => setManualSaleFormData(prev => ({ ...prev, client_phone: e.target.value }))}
                                                    className="w-1/2 border p-2 rounded"
                                                />
                                            </div>
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
                                                                {(() => {
                                                                    // Helper to format phone for WhatsApp
                                                                    const formatPhone = (phone) => {
                                                                        if (!phone) return null;
                                                                        let clean = phone.replace(/\D/g, ''); // Remove non-digits
                                                                        if (clean.startsWith('549')) return clean;
                                                                        if (clean.startsWith('54')) return '9' + clean; // Edge case
                                                                        if (clean.length === 10) return '549' + clean; // Add AR prefix
                                                                        return clean; // Retun as is if unsure, or maybe prepend 549 anyway
                                                                    };
                                                                    const phone = formatPhone(sale.client_phone);
                                                                    const amount = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(sale.total_amount - sale.paid_amount);
                                                                    const text = `Hola ${sale.client_name}! 👋 Te recordamos que quedó un saldo pendiente de ${amount} por tu compra en Home & Co. Avisanos cuando puedas transferir! Gracias!`;
                                                                    const link = phone
                                                                        ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
                                                                        : `https://wa.me/?text=${encodeURIComponent(text)}`;

                                                                    return (
                                                                        <a
                                                                            href={link}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="bg-[#25D366] text-white p-1 rounded hover:scale-110 transition-transform"
                                                                            title={phone ? `Enviar a ${phone}` : "Abrir WhatsApp (Sin número)"}
                                                                        >
                                                                            <MessageCircle size={14} />
                                                                        </a>
                                                                    );
                                                                })()}
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


                {/* --- CONTENT: ALL SALES (Unified) --- */}
                {activeTab === 'all_sales' && (
                    <div className="space-y-8">
                        {/* CIERRE DE CAJA */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-bold text-xl flex items-center gap-2">
                                    <DollarSign size={24} className="text-green-600" /> Cierre de Caja (Total Recaudado)
                                </h2>
                                <button
                                    onClick={handleCloseDay}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
                                >
                                    <MessageCircle size={18} /> CERRAR JORNADA
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <TrendingUp size={48} className="text-green-600" />
                                    </div>
                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1 flex items-center gap-1"><Globe size={12} /> Ventas Totales</p>
                                    <p className="text-3xl font-bold text-green-700">
                                        {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(
                                            allSales.reduce((acc, sale) => acc + (sale.origin === 'MANUAL' ? (sale.paid || 0) : (sale.total || 0)), 0)
                                        )}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-2">Recaudación Real</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Globe size={48} className="text-blue-600" />
                                    </div>
                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1 flex items-center gap-1"><Globe size={12} /> Web</p>
                                    <p className="text-2xl font-bold text-blue-700">
                                        {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(
                                            allSales.filter(s => s.origin === 'WEB').reduce((acc, s) => acc + s.total, 0)
                                        )}
                                    </p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <ShoppingBag size={48} className="text-purple-600" />
                                    </div>
                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1 flex items-center gap-1"><ShoppingBag size={12} /> Manual</p>
                                    <p className="text-2xl font-bold text-purple-700">
                                        {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(
                                            allSales.filter(s => s.origin === 'MANUAL').reduce((acc, s) => acc + (s.paid || 0), 0)
                                        )}
                                    </p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <DollarSign size={48} className="text-yellow-600" />
                                    </div>
                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1 flex items-center gap-1"><TrendingUp size={12} /> Ganancia</p>
                                    <p className="text-2xl font-bold text-yellow-700">
                                        {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(
                                            (() => {
                                                const totalRevenue = allSales.reduce((acc, sale) => acc + (sale.origin === 'MANUAL' ? (sale.paid || 0) : (sale.total || 0)), 0);
                                                let totalCost = 0;
                                                allSales.forEach(sale => {
                                                    sale.items.forEach(item => {
                                                        const product = products.find(p => p.id === item.id);
                                                        if (product && product.cost_price) {
                                                            totalCost += (product.cost_price * item.quantity);
                                                        }
                                                    });
                                                });
                                                return totalRevenue - totalCost;
                                            })()
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>


                        {/* LISTA UNIFICADA */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 bg-gray-50 border-b flex flex-col md:flex-row justify-between items-center gap-4">
                                <h2 className="font-bold">Historial Unificado de Ventas</h2>
                                {console.log("Cargando ventas (Render):", allSales)}

                                {/* SEARCH BAR */}
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Buscar cliente po nombre o teléfono..."
                                        className="w-full pl-9 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <button onClick={fetchAllSales} className="text-sm text-blue-600 hover:underline">Refrescar</button>
                            </div>

                            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                                {(() => {
                                    console.log("Datos de ventas recibidos:", allSales);

                                    // 1. Filter with Protection
                                    const filteredSales = allSales.filter(s =>
                                        (s.client?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                        (s.phone?.includes(searchTerm))
                                    );

                                    // 2. Group by Date
                                    const groups = {};
                                    filteredSales.forEach(sale => {
                                        try {
                                            const date = sale.date ? new Date(sale.date) : new Date();
                                            const dateKey = date.toDateString();
                                            if (!groups[dateKey]) groups[dateKey] = [];
                                            groups[dateKey].push(sale);
                                        } catch (e) {
                                            console.warn("Error grouping sale:", sale);
                                        }
                                    });

                                    // 3. Render
                                    if (filteredSales.length === 0) {
                                        return (
                                            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                                <div className="bg-gray-100 p-4 rounded-full mb-3">
                                                    <Search size={32} />
                                                </div>
                                                <p>No se encontraron ventas.</p>
                                            </div>
                                        );
                                    }

                                    return Object.keys(groups).map(dateKey => {
                                        const dateObj = new Date(dateKey);
                                        const isToday = dateKey === new Date().toDateString();
                                        const isYesterday = dateKey === new Date(new Date().setDate(new Date().getDate() - 1)).toDateString();

                                        const label = isToday
                                            ? 'Hoy'
                                            : isYesterday
                                                ? 'Ayer'
                                                : dateObj.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });

                                        return (
                                            <div key={dateKey}>
                                                {/* Sticky Header */}
                                                <div className="bg-gray-100 px-4 py-2 text-xs font-bold text-gray-500 uppercase sticky top-0 z-10 flex items-center gap-2">
                                                    <Calendar size={12} /> {label}
                                                </div>

                                                {/* Sales for this date */}
                                                {groups[dateKey].map(sale => {
                                                    // Try/Catch en el Render (Protección contra fallos en fila individual)
                                                    try {
                                                        const safeTotal = (isNaN(sale.total) || sale.total === null) ? 0 : sale.total;
                                                        const safePaid = (isNaN(sale.paid) || sale.paid === null) ? 0 : sale.paid;
                                                        const safeItems = Array.isArray(sale.items) ? sale.items : [];

                                                        return (
                                                            <div key={`${sale.origin}-${sale.id}`} className="p-4 hover:bg-gray-50 transition-colors flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b last:border-0 relative">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${sale.origin === 'WEB' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                                                                            {sale.origin || 'N/A'}
                                                                        </span>
                                                                        <span className="text-xs text-gray-400">
                                                                            {sale.date ? new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                                        </span>
                                                                    </div>
                                                                    {/* Protección de Mapeo: Optional Chaining */}
                                                                    <p className="font-bold text-lg">{sale.client || 'Cliente Desconocido'}</p>
                                                                    <p className="text-sm text-gray-500">
                                                                        {safeItems.map(i => `${i?.quantity || 0}x ${i?.name || 'Item'}`).join(', ')}
                                                                    </p>
                                                                </div>

                                                                <div className="flex items-center gap-6">
                                                                    <div className="text-right">
                                                                        <p className="font-bold text-xl">
                                                                            {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(safeTotal)}
                                                                        </p>
                                                                        {sale.origin === 'MANUAL' && sale.status === 'Pendiente' && (
                                                                            <p className="text-xs text-red-500 font-bold">
                                                                                Debe: {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(safeTotal - safePaid)}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleDeleteSale(sale)}
                                                                        className="text-gray-300 hover:text-red-500 p-2 transition-colors"
                                                                        title={sale.origin === 'MANUAL' ? "Borrar y Restaurar Stock" : "Borrar registro"}
                                                                    >
                                                                        <Trash2 size={18} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    } catch (err) {
                                                        console.error("Error rendering sale row:", sale, err);
                                                        return null; // Si falla, no muestra la fila
                                                    }
                                                })}
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- CONTENT: RULETA --- */}
                {activeTab === 'wheel' && (
                    <div className="space-y-8">
                        {/* CONFIGURATION */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                                <Dices size={24} className="text-[#d4af37]" /> Configuración de Premios
                            </h2>
                            <p className="text-sm text-gray-500 mb-4">
                                Editá los premios, probabilidades y stock. La suma de probabilidades NO necesita ser 100 (se calcula proporcionalmente), pero es recomendado.
                            </p>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500">
                                        <tr>
                                            <th className="p-3">Etiqueta (Visible)</th>
                                            <th className="p-3">Valor / Código</th>
                                            <th className="p-3">Probabilidad (0-100)</th>
                                            <th className="p-3">Stock Real</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {wheelConfig.map(prize => (
                                            <tr key={prize.id} className="hover:bg-gray-50">
                                                <td className="p-3">
                                                    <input
                                                        type="text"
                                                        value={prize.label}
                                                        onChange={(e) => handleUpdateWheelConfig(prize.id, 'label', e.target.value)}
                                                        className="border rounded p-1 w-full"
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <input
                                                        type="text"
                                                        value={prize.value}
                                                        onChange={(e) => handleUpdateWheelConfig(prize.id, 'value', e.target.value)}
                                                        className="border rounded p-1 w-full font-mono font-bold text-blue-600"
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <input
                                                        type="number"
                                                        value={prize.probability}
                                                        onChange={(e) => handleUpdateWheelConfig(prize.id, 'probability', parseInt(e.target.value) || 0)}
                                                        className="border rounded p-1 w-20 text-center"
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <input
                                                        type="number"
                                                        value={prize.stock}
                                                        onChange={(e) => handleUpdateWheelConfig(prize.id, 'stock', parseInt(e.target.value) || 0)}
                                                        className={`border rounded p-1 w-20 text-center font-bold ${prize.stock === 0 ? 'text-red-500 bg-red-50' : 'text-green-600'}`}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* LEADS */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                                <h2 className="font-bold flex items-center gap-2">
                                    <User size={20} /> Participantes (Leads)
                                </h2>
                                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                                    Total: {wheelLeads.length}
                                </span>
                            </div>
                            <div className="max-h-[500px] overflow-y-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-white text-xs uppercase font-bold text-gray-500 sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="p-3">Fecha</th>
                                            <th className="p-3">Nombre</th>
                                            <th className="p-3">WhatsApp</th>
                                            <th className="p-3">Premio Ganado</th>
                                            <th className="p-3">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {wheelLeads.map(lead => (
                                            <tr key={lead.id} className="hover:bg-gray-50">
                                                <td className="p-3 text-gray-500 text-xs">
                                                    {new Date(lead.created_at).toLocaleDateString()} {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="p-3 font-bold">{lead.full_name || lead.name}</td>
                                                <td className="p-3 font-mono">{lead.whatsapp}</td>
                                                <td className="p-3">
                                                    <span className={`text-xs font-bold px-2 py-1 rounded ${lead.prize_won === 'Sigue Participando' || lead.prize_won === 'NO_PRIZE' ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                                                        {lead.prize_won}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <a
                                                        href={`https://wa.me/${lead.whatsapp}?text=Hola ${lead.name}, gracias por participar en la Ruleta de Home & Co! 🎁`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-green-600 hover:text-green-800"
                                                        title="Enviar WhatsApp"
                                                    >
                                                        <MessageCircle size={18} />
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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

                {/* --- DELETE CONFIRMATION MODAL --- */}
                {deleteModal.open && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl relative animate-in fade-in zoom-in duration-200">
                            <h3 className="font-bold text-xl mb-4 text-red-600 flex items-center gap-2">
                                <Trash2 /> Eliminar Venta
                            </h3>
                            <p className="text-gray-600 mb-6">
                                ¿Por qué deseas eliminar la venta de <b>{deleteModal.sale?.client}</b>?
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={() => setDeleteModal(prev => ({ ...prev, reason: 'error' }))}
                                    className={`w-full p-3 rounded border text-left flex justify-between items-center hover:bg-red-50 transition-colors ${deleteModal.reason === 'error' ? 'border-red-500 bg-red-50 font-bold text-red-700' : 'border-gray-200'}`}
                                >
                                    Error de Carga
                                    {deleteModal.reason === 'error' && <CheckSquare size={16} />}
                                </button>
                                <button
                                    onClick={() => setDeleteModal(prev => ({ ...prev, reason: 'return' }))}
                                    className={`w-full p-3 rounded border text-left flex justify-between items-center hover:bg-red-50 transition-colors ${deleteModal.reason === 'return' ? 'border-red-500 bg-red-50 font-bold text-red-700' : 'border-gray-200'}`}
                                >
                                    Devolución / Cancelación
                                    {deleteModal.reason === 'return' && <CheckSquare size={16} />}
                                </button>
                                <button
                                    onClick={() => setDeleteModal(prev => ({ ...prev, reason: 'test' }))}
                                    className={`w-full p-3 rounded border text-left flex justify-between items-center hover:bg-red-50 transition-colors ${deleteModal.reason === 'test' ? 'border-red-500 bg-red-50 font-bold text-red-700' : 'border-gray-200'}`}
                                >
                                    Prueba de Sistema
                                    {deleteModal.reason === 'test' && <CheckSquare size={16} />}
                                </button>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setDeleteModal({ open: false, sale: null, reason: '' })}
                                    className="flex-1 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={!deleteModal.reason}
                                    className={`flex-1 py-2 font-bold rounded text-white ${deleteModal.reason ? 'bg-red-600 hover:bg-red-700 shadow-lg' : 'bg-gray-300 cursor-not-allowed'}`}
                                >
                                    Confirmar
                                </button>
                            </div>

                            {deleteModal.sale?.origin === 'MANUAL' && (
                                <p className="text-xs text-center text-gray-400 mt-4">
                                    * Se repondrá el stock automáticamente.
                                </p>
                            )}
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
}
