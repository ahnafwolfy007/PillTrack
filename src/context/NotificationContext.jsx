import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { notificationService } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext({});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Fetch notifications from backend
    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) {
            setNotifications([]);
            return;
        }

        setLoading(true);
        try {
            const response = await notificationService.getAll(0, 20);
            if (response.success && response.data) {
                const notifs = Array.isArray(response.data) 
                    ? response.data 
                    : response.data.content || [];
                
                setNotifications(notifs.map(n => ({
                    id: n.id,
                    type: n.type?.toLowerCase() || 'info',
                    title: n.title || 'Notification',
                    message: n.message,
                    time: new Date(n.createdAt),
                    read: n.read || false,
                    action: n.actionUrl,
                    data: n.data
                })));
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Fetch notifications when auth state changes
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications, user]);

    // Poll for new notifications every 60 seconds
    useEffect(() => {
        if (!isAuthenticated) return;
        
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [isAuthenticated, fetchNotifications]);

    const addNotification = useCallback((notification) => {
        const newNotification = {
            id: Date.now(),
            time: new Date(),
            read: false,
            ...notification
        };
        setNotifications(prev => [newNotification, ...prev]);
    }, []);

    const markAsRead = useCallback(async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId ? { ...n, read: true } : n
                )
            );
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true }))
            );
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    }, []);

    const removeNotification = useCallback(async (notificationId) => {
        try {
            await notificationService.delete(notificationId);
            setNotifications(prev =>
                prev.filter(n => n.id !== notificationId)
            );
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    }, []);

    const clearAll = useCallback(async () => {
        // For now, just clear locally since bulk delete might not exist
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
            loading,
            addNotification,
            markAsRead,
            markAllAsRead,
            removeNotification,
            clearAll,
            toggleNotifications,
            openNotifications,
            closeNotifications,
            fetchNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationContext;
