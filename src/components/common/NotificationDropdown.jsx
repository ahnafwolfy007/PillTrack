import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, X, Pill, Package, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationItem = ({ notification, onMarkRead, onRemove }) => {
    const icons = {
        reminder: Pill,
        alert: AlertTriangle,
        order: Package,
        default: Bell
    };
    
    const colors = {
        reminder: 'bg-blue-100 text-blue-600',
        alert: 'bg-amber-100 text-amber-600',
        order: 'bg-green-100 text-green-600',
        default: 'bg-slate-100 text-slate-600'
    };

    const Icon = icons[notification.type] || icons.default;
    const colorClass = colors[notification.type] || colors.default;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={cn(
                "flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer",
                notification.read ? "bg-white" : "bg-blue-50/50"
            )}
            onClick={() => onMarkRead(notification.id)}
        >
            <div className={cn("p-2 rounded-lg shrink-0", colorClass)}>
                <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <h4 className={cn(
                        "text-sm truncate",
                        notification.read ? "text-slate-700" : "text-slate-900 font-semibold"
                    )}>
                        {notification.title}
                    </h4>
                    {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />
                    )}
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                    {notification.message}
                </p>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Clock size={10} />
                    {formatDistanceToNow(new Date(notification.time), { addSuffix: true })}
                </p>
            </div>
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 shrink-0 text-slate-400 hover:text-red-500"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(notification.id);
                }}
            >
                <X size={12} />
            </Button>
        </motion.div>
    );
};

const NotificationDropdown = ({ isOpen, onClose }) => {
    const { 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        removeNotification, 
        clearAll 
    } = useNotifications();

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 z-40" 
                onClick={onClose}
            />

            {/* Dropdown */}
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
            >
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-slate-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <p className="text-xs text-slate-500">{unreadCount} unread</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-xs"
                                onClick={markAllAsRead}
                            >
                                <Check size={14} className="mr-1" /> Mark all read
                            </Button>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto p-2">
                    <AnimatePresence>
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onMarkRead={markAsRead}
                                    onRemove={removeNotification}
                                />
                            ))
                        ) : (
                            <div className="py-12 text-center">
                                <Bell size={40} className="mx-auto text-slate-200 mb-3" />
                                <p className="text-slate-500">No notifications yet</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="p-3 border-t border-slate-100 flex justify-between">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs text-slate-500"
                            onClick={clearAll}
                        >
                            <Trash2 size={14} className="mr-1" /> Clear all
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs text-primary">
                            View all notifications
                        </Button>
                    </div>
                )}
            </motion.div>
        </>
    );
};

export default NotificationDropdown;
