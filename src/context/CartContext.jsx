import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext({});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setItems(JSON.parse(savedCart));
        }
    }, []);

    // Save cart to localStorage when items change
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addItem = (product, quantity = 1) => {
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
    };

    const removeItem = (productId) => {
        setItems(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeItem(productId);
            return;
        }
        
        setItems(prev =>
            prev.map(item =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const toggleCart = () => {
        setIsOpen(prev => !prev);
    };

    const openCart = () => setIsOpen(true);
    const closeCart = () => setIsOpen(false);

    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
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
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            toggleCart,
            openCart,
            closeCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
