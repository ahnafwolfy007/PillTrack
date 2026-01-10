import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext({});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'reminder',
            title: 'Medication Reminder',
            message: 'Time to take Amoxicillin 500mg',
            time: new Date(),
            read: false,
            action: 'take-medication',
            data: { medicationId: 1 }
        },
        {
            id: 2,
            type: 'alert',
            title: 'Low Stock Alert',
            message: 'Vitamin D3 is running low (4 pills left)',
            time: new Date(Date.now() - 3600000),
            read: false,
            action: 'refill',
            data: { medicationId: 2 }
        },
        {
            id: 3,
            type: 'order',
            title: 'Order Delivered',
            message: 'Your order #1234 has been delivered',
            time: new Date(Date.now() - 86400000),
            read: true,
            action: 'view-order',
            data: { orderId: 1234 }
        }
    ]);

    const [isOpen, setIsOpen] = useState(false);

    const addNotification = useCallback((notification) => {
        const newNotification = {
            id: Date.now(),
            time: new Date(),
            read: false,
            ...notification
        };
        setNotifications(prev => [newNotification, ...prev]);
    }, []);

    const markAsRead = useCallback((notificationId) => {
        setNotifications(prev =>
            prev.map(n =>
                n.id === notificationId ? { ...n, read: true } : n
            )
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
        );
    }, []);

    const removeNotification = useCallback((notificationId) => {
        setNotifications(prev =>
            prev.filter(n => n.id !== notificationId)
        );
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    const toggleNotifications = () => setIsOpen(prev => !prev);
    const openNotifications = () => setIsOpen(true);
    const closeNotifications = () => setIsOpen(false);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            isOpen,
            addNotification,
            markAsRead,
            markAllAsRead,
            removeNotification,
            clearAll,
            toggleNotifications,
            openNotifications,
            closeNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationContext;
