import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext({});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user, isAuthenticated } = useAuth();

    // Fetch cart from backend when user logs in
    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) {
            // Load from localStorage for guests
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                setItems(JSON.parse(savedCart));
            }
            return;
        }

        setLoading(true);
        try {
            const response = await cartService.get();
            if (response.success && response.data) {
                const cartItems = response.data.items?.map(item => ({
                    id: item.id,
                    shopMedicineId: item.shopMedicineId,
                    name: item.medicineName,
                    brand: item.shopName,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.imageUrl || '/medicine-placeholder.png',
                    maxStock: item.availableQuantity
                })) || [];
                setItems(cartItems);
            }
        } catch (error) {
            console.error('Failed to fetch cart:', error);
            // Fall back to localStorage
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                setItems(JSON.parse(savedCart));
            }
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Load cart when auth state changes
    useEffect(() => {
        fetchCart();
    }, [fetchCart, user]);

    // Save guest cart to localStorage
    useEffect(() => {
        if (!isAuthenticated) {
            localStorage.setItem('cart', JSON.stringify(items));
        }
    }, [items, isAuthenticated]);

    const addItem = async (product, quantity = 1) => {
        if (isAuthenticated) {
            try {
                setLoading(true);
                const shopMedicineId = product.shopMedicineId || product.id;
                await cartService.addItem(shopMedicineId, quantity);
                await fetchCart();
            } catch (error) {
                console.error('Failed to add item to cart:', error);
                throw error;
            } finally {
                setLoading(false);
            }
        } else {
            // Guest cart - localStorage only
            setItems(prev => {
                const existingItem = prev.find(item => item.id === product.id);
                
                if (existingItem) {
                    return prev.map(item =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    );
                }
                
                return [...prev, { ...product, quantity }];
            });
        }
    };

    const removeItem = async (itemId) => {
        if (isAuthenticated) {
            try {
                setLoading(true);
                await cartService.removeItem(itemId);
                await fetchCart();
            } catch (error) {
                console.error('Failed to remove item:', error);
            } finally {
                setLoading(false);
            }
        } else {
            setItems(prev => prev.filter(item => item.id !== itemId));
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        if (quantity <= 0) {
            removeItem(itemId);
            return;
        }

        if (isAuthenticated) {
            try {
                setLoading(true);
                await cartService.updateItem(itemId, quantity);
                await fetchCart();
            } catch (error) {
                console.error('Failed to update quantity:', error);
            } finally {
                setLoading(false);
            }
        } else {
            setItems(prev =>
                prev.map(item =>
                    item.id === itemId ? { ...item, quantity } : item
                )
            );
        }
    };

    const clearCart = async () => {
        if (isAuthenticated) {
            try {
                setLoading(true);
                await cartService.clear();
                setItems([]);
            } catch (error) {
                console.error('Failed to clear cart:', error);
            } finally {
                setLoading(false);
            }
        } else {
            setItems([]);
        }
    };

    // Merge guest cart with user cart after login
    const mergeGuestCart = async () => {
        const guestCart = localStorage.getItem('cart');
        if (guestCart && isAuthenticated) {
            try {
                const guestItems = JSON.parse(guestCart);
                for (const item of guestItems) {
                    await cartService.addItem(item.shopMedicineId || item.id, item.quantity);
                }
                localStorage.removeItem('cart');
                await fetchCart();
            } catch (error) {
                console.error('Failed to merge guest cart:', error);
            }
        }
    };

    const toggleCart = () => {
        setIsOpen(prev => !prev);
    };

    const openCart = () => setIsOpen(true);
    const closeCart = () => setIsOpen(false);

    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + (parseFloat(item.price || 0) * item.quantity), 0);
    const shipping = subtotal > 50 ? 0 : 5.99;
    const total = subtotal + shipping;

    return (
        <CartContext.Provider value={{
            items,
            itemCount,
            subtotal,
            shipping,
            total,
            isOpen,
            loading,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            toggleCart,
            openCart,
            closeCart,
            fetchCart,
            mergeGuestCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
