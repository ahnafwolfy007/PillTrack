import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { notificationService, medicationService, doseLogService } from '../services/api';
import { useAuth } from './AuthContext';
import { useNotificationSound, SOUND_TYPES } from '../hooks/useNotificationSound';
import { getCurrentTimeInDhaka, getTodayKeyInDhaka } from '../utils/timezone';

const NotificationContext = createContext({});

export const useNotifications = () => useContext(NotificationContext);

// Reminder interval in milliseconds (5 minutes for repeat reminders)
const REPEAT_REMINDER_INTERVAL = 5 * 60 * 1000;
// Check interval in milliseconds (15 seconds for responsive reminders)
const CHECK_INTERVAL = 15 * 1000;

export const NotificationProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [activeReminder, setActiveReminder] = useState(null);
    const [pendingReminders, setPendingReminders] = useState([]); // Track pending doses needing reminders
    const [audioInitialized, setAudioInitialized] = useState(false);
    const { playSound, stopSound, initAudio } = useNotificationSound();
    const reminderIntervalRef = useRef(null);
    const lastReminderTimeRef = useRef({}); // Track when each reminder was last shown
    
    // Initialize audio on first user interaction
    const ensureAudioInitialized = useCallback(() => {
        if (!audioInitialized) {
            initAudio();
            setAudioInitialized(true);
            console.log('[PillTrack] Audio system initialized');
        }
    }, [audioInitialized, initAudio]);
    
    // Setup click listener to initialize audio
    useEffect(() => {
        const handleInteraction = () => {
            ensureAudioInitialized();
        };
        
        document.addEventListener('click', handleInteraction, { once: true });
        document.addEventListener('touchstart', handleInteraction, { once: true });
        
        return () => {
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('touchstart', handleInteraction);
        };
    }, [ensureAudioInitialized]);

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

    // Show browser notification
    const showBrowserNotification = useCallback((title, message) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body: message,
                icon: '/pill-icon.png',
                badge: '/pill-icon.png',
                vibrate: [200, 100, 200],
                requireInteraction: true, // Keep visible until user interacts
                tag: 'pilltrack-reminder' // Replace previous reminder
            });
            
            // Auto-close after 30 seconds
            setTimeout(() => notification.close(), 30000);
        }
    }, []);

    // Trigger a reminder for a specific dose
    const triggerReminder = useCallback((med, reminderTime, isRepeat = false, doseId = null) => {
        const message = `Time to take ${med.name} - ${med.strength}`;
        const repeatNote = isRepeat ? ' (Reminder)' : '';
        
        const newNotification = {
            id: Date.now(),
            type: 'reminder',
            title: `Medication Reminder${repeatNote}`,
            message,
            time: new Date(),
            read: false,
            data: { 
                medicationId: med.id, 
                medicationName: med.name, 
                doseTime: reminderTime,
                strength: med.strength,
                instructions: med.instructions,
                doseId: doseId
            }
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        setActiveReminder(newNotification);
        
        // Play sound
        ensureAudioInitialized();
        if (soundEnabled) {
            console.log('[PillTrack] Playing reminder sound');
            playSound(SOUND_TYPES.MELODY);
        }
        
        // Show browser notification
        showBrowserNotification(newNotification.title, newNotification.message);
        
        console.log(`[PillTrack] Reminder triggered for: ${med.name} at ${reminderTime}${isRepeat ? ' (repeat)' : ''}`);
    }, [ensureAudioInitialized, soundEnabled, playSound, showBrowserNotification]);

    // Check for medication reminders - runs every 15 seconds
    const checkMedicationReminders = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            const { hours, minutes, totalMinutes: currentTotalMinutes } = getCurrentTimeInDhaka();
            const todayKey = getTodayKeyInDhaka();
            const now = Date.now();
            
            console.log(`[PillTrack] Checking reminders at ${hours}:${minutes.toString().padStart(2, '0')} (Dhaka time)`);
            
            // Fetch medications and today's doses
            const [medsResponse, todayDoses] = await Promise.all([
                medicationService.getAll(),
                doseLogService.getToday().catch(() => [])
            ]);
            
            const medications = medsResponse.success ? medsResponse.data : (Array.isArray(medsResponse) ? medsResponse : []);
            const doses = Array.isArray(todayDoses) ? todayDoses : [];
            
            const currentDate = new Date();
            const newPendingReminders = [];
            
            for (const med of medications) {
                if (med.status !== 'ACTIVE' && med.isActive !== true) continue;
                
                // Check if medication is within date range
                if (med.startDate && new Date(med.startDate) > currentDate) continue;
                if (med.endDate && new Date(med.endDate) < currentDate) continue;
                
                const reminderTimes = med.reminderTimes || [];
                const minutesBefore = med.reminderMinutesBefore ?? 5; // Default 5 minutes before
                
                for (const reminderTime of reminderTimes) {
                    const [doseHour, doseMinute] = reminderTime.split(':').map(Number);
                    const doseTotalMinutes = doseHour * 60 + doseMinute;
                    const triggerTotalMinutes = doseTotalMinutes - minutesBefore;
                    
                    // Check if this dose has already been taken/skipped/missed
                    const existingDose = doses.find(d => {
                        const logTime = d.scheduledTime?.includes('T') 
                            ? d.scheduledTime.substring(11, 16) 
                            : d.scheduledTime?.substring(0, 5);
                        return d.medicationId === med.id && logTime === reminderTime;
                    });
                    
                    const isDoseCompleted = existingDose && 
                        ['TAKEN', 'SKIPPED', 'MISSED'].includes(existingDose.status);
                    
                    if (isDoseCompleted) {
                        // Clear this from pending reminders
                        const reminderKey = `${todayKey}-${med.id}-${reminderTime}`;
                        delete lastReminderTimeRef.current[reminderKey];
                        continue;
                    }
                    
                    // Check if we should trigger a reminder
                    // Trigger if current time >= trigger time (dose time - minutesBefore)
                    if (currentTotalMinutes >= triggerTotalMinutes) {
                        const reminderKey = `${todayKey}-${med.id}-${reminderTime}`;
                        const lastReminded = lastReminderTimeRef.current[reminderKey] || 0;
                        const timeSinceLastReminder = now - lastReminded;
                        
                        // Check if this is first reminder or 5 minutes have passed
                        const shouldRemind = lastReminded === 0 || timeSinceLastReminder >= REPEAT_REMINDER_INTERVAL;
                        
                        if (shouldRemind) {
                            // Trigger reminder
                            triggerReminder(med, reminderTime, lastReminded > 0, existingDose?.id);
                            lastReminderTimeRef.current[reminderKey] = now;
                        }
                        
                        // Track as pending reminder
                        newPendingReminders.push({
                            medicationId: med.id,
                            medicationName: med.name,
                            strength: med.strength,
                            doseTime: reminderTime,
                            doseId: existingDose?.id,
                            isVirtual: !existingDose
                        });
                    }
                }
            }
            
            setPendingReminders(newPendingReminders);
            
        } catch (error) {
            console.error('Failed to check medication reminders:', error);
        }
    }, [isAuthenticated, triggerReminder]);

    // Request notification permission
    const requestNotificationPermission = useCallback(async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return Notification.permission === 'granted';
    }, []);

    // Fetch notifications when auth state changes
    useEffect(() => {
        fetchNotifications();
        if (isAuthenticated) {
            requestNotificationPermission();
            initAudio();
        }
    }, [fetchNotifications, user, isAuthenticated, requestNotificationPermission, initAudio]);

    // Poll for reminders every 15 seconds
    useEffect(() => {
        if (!isAuthenticated) {
            if (reminderIntervalRef.current) {
                clearInterval(reminderIntervalRef.current);
            }
            // Clear reminder tracking on logout
            lastReminderTimeRef.current = {};
            setPendingReminders([]);
            return;
        }
        
        // Check reminders immediately
        checkMedicationReminders();
        
        // Then check every 15 seconds
        reminderIntervalRef.current = setInterval(() => {
            checkMedicationReminders();
        }, CHECK_INTERVAL);
        
        // Fetch backend notifications less frequently (every minute)
        const notificationInterval = setInterval(() => {
            fetchNotifications();
        }, 60000);
        
        return () => {
            if (reminderIntervalRef.current) {
                clearInterval(reminderIntervalRef.current);
            }
            clearInterval(notificationInterval);
        };
    }, [isAuthenticated, fetchNotifications, checkMedicationReminders]);

    // Clear old reminders on date change
    useEffect(() => {
        const checkDateChange = () => {
            const todayKey = getTodayKeyInDhaka();
            const keys = Object.keys(lastReminderTimeRef.current);
            keys.forEach(key => {
                if (!key.startsWith(todayKey)) {
                    delete lastReminderTimeRef.current[key];
                }
            });
        };
        
        const interval = setInterval(checkDateChange, 60 * 60 * 1000);
        checkDateChange();
        
        return () => clearInterval(interval);
    }, []);

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
        setNotifications([]);
    }, []);

    const dismissReminder = useCallback(() => {
        setActiveReminder(null);
        stopSound();
    }, [stopSound]);

    // Mark dose as taken and stop reminders for it
    const markDoseTakenFromReminder = useCallback(async (medicationId, doseTime, doseId) => {
        try {
            if (doseId && !String(doseId).startsWith('virtual')) {
                await doseLogService.markAsTaken(doseId);
            }
            
            // Clear this reminder from tracking
            const todayKey = getTodayKeyInDhaka();
            const reminderKey = `${todayKey}-${medicationId}-${doseTime}`;
            delete lastReminderTimeRef.current[reminderKey];
            
            // Remove from pending reminders
            setPendingReminders(prev => 
                prev.filter(r => !(r.medicationId === medicationId && r.doseTime === doseTime))
            );
            
            dismissReminder();
            
            console.log(`[PillTrack] Dose marked as taken: ${medicationId} at ${doseTime}`);
        } catch (error) {
            console.error('Failed to mark dose as taken:', error);
        }
    }, [dismissReminder]);

    // Mark dose as skipped and stop reminders
    const markDoseSkippedFromReminder = useCallback(async (medicationId, doseTime, doseId, reason) => {
        try {
            if (doseId && !String(doseId).startsWith('virtual')) {
                await doseLogService.markAsSkipped(doseId, reason || 'Skipped by user');
            }
            
            // Clear this reminder from tracking
            const todayKey = getTodayKeyInDhaka();
            const reminderKey = `${todayKey}-${medicationId}-${doseTime}`;
            delete lastReminderTimeRef.current[reminderKey];
            
            // Remove from pending reminders
            setPendingReminders(prev => 
                prev.filter(r => !(r.medicationId === medicationId && r.doseTime === doseTime))
            );
            
            dismissReminder();
            
            console.log(`[PillTrack] Dose marked as skipped: ${medicationId} at ${doseTime}`);
        } catch (error) {
            console.error('Failed to mark dose as skipped:', error);
        }
    }, [dismissReminder]);

    // Snooze reminder for specified minutes
    const snoozeReminder = useCallback((minutes = 5) => {
        if (activeReminder?.data) {
            const { medicationId, doseTime } = activeReminder.data;
            const todayKey = getTodayKeyInDhaka();
            const reminderKey = `${todayKey}-${medicationId}-${doseTime}`;
            
            // Set next reminder time
            const snoozeUntil = Date.now() + (minutes * 60 * 1000) - REPEAT_REMINDER_INTERVAL;
            lastReminderTimeRef.current[reminderKey] = snoozeUntil;
            
            console.log(`[PillTrack] Reminder snoozed for ${minutes} minutes`);
        }
        dismissReminder();
    }, [activeReminder, dismissReminder]);

    const toggleSound = useCallback(() => {
        setSoundEnabled(prev => !prev);
    }, []);

    const playTestSound = useCallback((type = SOUND_TYPES.MELODY) => {
        ensureAudioInitialized();
        playSound(type);
    }, [playSound, ensureAudioInitialized]);
    
    // Trigger a test reminder (for debugging)
    const triggerTestReminder = useCallback(() => {
        ensureAudioInitialized();
        
        const testNotification = {
            id: Date.now(),
            type: 'reminder',
            title: 'Test Medication Reminder',
            message: 'This is a test reminder to verify notifications work!',
            time: new Date(),
            read: false,
            data: { medicationId: 'test', medicationName: 'Test Medication', doseTime: '12:00' }
        };
        
        setNotifications(prev => [testNotification, ...prev]);
        setActiveReminder(testNotification);
        
        if (soundEnabled) {
            playSound(SOUND_TYPES.MELODY);
        }
        
        showBrowserNotification(testNotification.title, testNotification.message);
        console.log('[PillTrack] Test reminder triggered');
    }, [ensureAudioInitialized, soundEnabled, playSound, showBrowserNotification]);

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
            soundEnabled,
            activeReminder,
            pendingReminders,
            addNotification,
            markAsRead,
            markAllAsRead,
            removeNotification,
            clearAll,
            toggleNotifications,
            openNotifications,
            closeNotifications,
            fetchNotifications,
            toggleSound,
            playTestSound,
            dismissReminder,
            snoozeReminder,
            markDoseTakenFromReminder,
            markDoseSkippedFromReminder,
            requestNotificationPermission,
            triggerTestReminder,
            ensureAudioInitialized,
            checkMedicationReminders
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationContext;
