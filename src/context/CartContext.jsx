import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    // Load initial cart from localStorage
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            return [];
        }
    });

    const [isCartOpen, setIsCartOpen] = useState(false);

    // Persist cart to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(cart));
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    }, [cart]);

    const addToCart = (product, quantity = 1, color = null) => {
        setCart(prevCart => {
            // Check if item exists with same ID and Color
            const existingItemIndex = prevCart.findIndex(
                item => item.id === product.id && item.selectedColor === color
            );

            if (existingItemIndex >= 0) {
                // Update quantity
                const newCart = [...prevCart];
                newCart[existingItemIndex].quantity += quantity;
                return newCart;
            } else {
                // Add new item
                return [...prevCart, { ...product, quantity, selectedColor: color }];
            }
        });
        setIsCartOpen(true); // Open drawer on add
    };

    const removeFromCart = (itemId, color) => {
        setCart(prevCart => prevCart.filter(item => !(item.id === itemId && item.selectedColor === color)));
    };

    const updateQuantity = (itemId, color, amount) => {
        setCart(prevCart => prevCart.map(item => {
            if (item.id === itemId && item.selectedColor === color) {
                const newQuantity = Math.max(1, item.quantity + amount);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const clearCart = () => {
        setCart([]);
    };

    const toggleCart = () => setIsCartOpen(prev => !prev);
    const closeCart = () => setIsCartOpen(false);
    const openCart = () => setIsCartOpen(true);

    // --- DISCOUNT / RULETA LOGIC ---
    const [discountInfo, setDiscountInfo] = useState({ amount: 0, label: '', code: '' });

    // Check urgency/expiry periodically
    useEffect(() => {
        const checkDiscount = () => {
            const expiry = localStorage.getItem('wheel_won_expiry');
            const code = localStorage.getItem('wheel_prize_code');
            const label = localStorage.getItem('wheel_prize_label');

            if (!expiry || !code || !label) {
                setDiscountInfo({ amount: 0, label: '', code: '' });
                return;
            }

            if (Date.now() > parseInt(expiry)) {
                // Expired
                setDiscountInfo({ amount: 0, label: '', code: '' });
                return;
            }

            // Calculate Discount Amount
            let discountAmount = 0;
            const currentTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

            if (code === 'HOME10') {
                discountAmount = currentTotal * 0.10;
            } else if (code === 'HOME5') {
                discountAmount = currentTotal * 0.05;
            } else if (code === 'DESC1000') {
                discountAmount = 1000;
            } else if (code === 'MATERO10') {
                discountAmount = currentTotal * 0.10;
            } else if (code === 'FREESHIP') {
                // Handle freeship logic if needed, for now 0 monetary discount
                discountAmount = 0;
            }

            // DEBUG LOG (Throttled?) - Actually running every second might spam.
            // But we need to see it.
            if (discountAmount > 0) {
                // console.log("Calc Discount:", { code, amount: discountAmount, currentTotal });
            }

            setDiscountInfo({
                amount: discountAmount,
                label,
                code
            });

            // --- GIFT LOGIC ---
            if (code.startsWith('GIFT_') || code === 'REGALO') {
                const giftId = `gift-${code}`;
                const hasGift = cart.some(item => item.id === giftId);

                if (!hasGift) {
                    // Prevent infinite loop: We only add if not present
                    // We need to use setCart directly or addToCart but be careful of dependencies
                    // Since this effect depends on [cart], calling setCart will re-trigger it
                    // But hasGift check prevents infinite loop.

                    const giftItem = {
                        id: giftId,
                        name: `PREMIO RULETA: ${label}`,
                        price: 0,
                        quantity: 1,
                        image_url: 'https://cdn-icons-png.flaticon.com/512/3209/3209955.png', // Generic Gift Icon
                        selectedColor: 'Único'
                    };

                    // We can't use addToCart easily because it opens the drawer. We just want to add it silently?
                    // Or maybe silently.
                    setCart(prev => [...prev, giftItem]);
                }
            }
        };

        // Check immediately and then every second
        checkDiscount();
        const interval = setInterval(checkDiscount, 1000); // 1s sync with UrgencyBanner

        // Listen for storage events (win happening in another tab or component)
        window.addEventListener('storage', checkDiscount);
        window.addEventListener('wheel_win', checkDiscount); // Custom event if needed

        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', checkDiscount);
            window.removeEventListener('wheel_win', checkDiscount);
        };
    }, [cart]);

    // Derived state
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const cartTotal = Math.max(0, cartSubtotal - discountInfo.amount); // FINAL TOTAL
    // console.log("Cart Context Total:", cartTotal);

    return (
        <CartContext.Provider value={{
            cart,
            isCartOpen,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            toggleCart,
            closeCart,
            openCart,
            cartCount,
            cartSubtotal, // Original Price
            cartTotal,    // Final Price (with discount)
            discountInfo  // { amount, label, code }
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
