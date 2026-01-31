import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { 
    Bell, Moon, Sun, Globe, Lock, Smartphone, Mail, 
    Volume2, Clock, Shield, Eye, EyeOff, Check,
    ChevronRight, LogOut, Trash2, Loader2, Play, AlertCircle,
    X, AlertTriangle, Monitor
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { userService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { getCurrentTimeInDhaka } from '../../utils/timezone';

const SETTINGS_STORAGE_KEY = 'pilltrack-settings';

// Toast notification component
const Toast = ({ message, type, onClose }) => (
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className={cn(
            "fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3",
            type === 'success' ? "bg-green-500 text-white" :
            type === 'error' ? "bg-red-500 text-white" :
            "bg-slate-800 text-white"
        )}
    >
        {type === 'success' && <Check size={18} />}
        {type === 'error' && <X size={18} />}
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-70">
            <X size={16} />
        </button>
    </motion.div>
);

// Delete Account Modal
const DeleteAccountModal = ({ isOpen, onClose, onConfirm }) => {
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    if (!isOpen) return null;

    const handleDelete = async () => {
        if (confirmText !== 'DELETE') return;
        setIsDeleting(true);
        await onConfirm();
        setIsDeleting(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                        <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Delete Account</h3>
                </div>
                
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                    This action <strong>cannot be undone</strong>. All your data, medications, reminders, and order history will be permanently deleted.
                </p>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm:
                </p>
                
                <Input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="mb-4 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                />
                
                <div className="flex gap-3">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button 
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={confirmText !== 'DELETE' || isDeleting}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 size={16} className="animate-spin mr-2" />
                                Deleting...
                            </>
                        ) : (
                            'Delete Forever'
                        )}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

// Password Strength Indicator
const PasswordStrength = ({ password }) => {
    const getStrength = () => {
        if (!password) return { score: 0, label: '', color: '' };
        
        let score = 0;
        if (password.length >= 6) score++;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500' };
        if (score <= 4) return { score: 2, label: 'Medium', color: 'bg-yellow-500' };
        return { score: 3, label: 'Strong', color: 'bg-green-500' };
    };

    const strength = getStrength();
    if (!password) return null;

    return (
        <div className="mt-2">
            <div className="flex gap-1 mb-1">
                {[1, 2, 3].map((level) => (
                    <div
                        key={level}
                        className={cn(
                            "h-1 flex-1 rounded-full transition-colors",
                            level <= strength.score ? strength.color : "bg-slate-200 dark:bg-slate-600"
                        )}
                    />
                ))}
            </div>
            <p className={cn(
                "text-xs",
                strength.score === 1 ? "text-red-500" :
                strength.score === 2 ? "text-yellow-600" : "text-green-500"
            )}>
                {strength.label} password
            </p>
        </div>
    );
};

const SettingSection = ({ title, description, children }) => (
    <Card className="border-none shadow-md dark:bg-slate-800 dark:shadow-slate-900/50">
        <CardHeader>
            <CardTitle className="text-lg dark:text-white">{title}</CardTitle>
            {description && <CardDescription className="dark:text-slate-400">{description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">
            {children}
        </CardContent>
    </Card>
);

const ToggleSetting = ({ icon: Icon, label, description, checked, onChange, disabled = false }) => (
    <div className={cn(
        "flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-700 last:border-0",
        disabled && "opacity-50"
    )}>
        <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                <Icon size={18} />
            </div>
            <div>
                <p className="font-medium text-slate-800 dark:text-white">{label}</p>
                {description && <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>}
            </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={checked} 
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
            />
            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
    </div>
);

const Settings = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { theme, isDark, setLightTheme, setDarkTheme, setSystemTheme } = useTheme();
    const { 
        triggerTestReminder, 
        playTestSound, 
        soundEnabled, 
        toggleSound,
        requestNotificationPermission,
        ensureAudioInitialized,
        pendingReminders
    } = useNotifications();
    
    const [notificationStatus, setNotificationStatus] = useState('unknown');
    const [currentDhakaTime, setCurrentDhakaTime] = useState('');
    const [toast, setToast] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Load settings from localStorage
    const [settings, setSettings] = useState(() => {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse settings:', e);
            }
        }
        return {
            pushNotifications: true,
            emailNotifications: true,
            smsNotifications: false,
            reminderSound: true,
            twoFactorAuth: false,
            showAdherencePublic: false,
            language: 'en'
        };
    });

    const [reminderTimes, setReminderTimes] = useState(() => {
        const stored = localStorage.getItem('pilltrack-reminder-times');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse reminder times:', e);
            }
        }
        return {
            morning: '08:00',
            afternoon: '14:00',
            evening: '20:00'
        };
    });

    const [showPassword, setShowPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    useEffect(() => {
        if ('Notification' in window) {
            setNotificationStatus(Notification.permission);
        }
        
        const updateTime = () => {
            const { hours, minutes, seconds } = getCurrentTimeInDhaka();
            setCurrentDhakaTime(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Auto-save settings to localStorage when they change
    useEffect(() => {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        localStorage.setItem('pilltrack-reminder-times', JSON.stringify(reminderTimes));
    }, [reminderTimes]);

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        showToast(`${key.replace(/([A-Z])/g, ' $1').trim()} ${value ? 'enabled' : 'disabled'}`, 'success');
    };

    const handleSaveAllSettings = async () => {
        setIsSaving(true);
        // Simulate API call - in real app, this would save to backend
        await new Promise(resolve => setTimeout(resolve, 500));
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        localStorage.setItem('pilltrack-reminder-times', JSON.stringify(reminderTimes));
        setIsSaving(false);
        showToast('All settings saved successfully!', 'success');
    };

    const handlePasswordChange = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return;
        }

        setPasswordLoading(true);
        setPasswordError('');
        setPasswordSuccess('');

        try {
            const response = await userService.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });

            if (response.success) {
                setPasswordSuccess('Password updated successfully!');
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                showToast('Password updated successfully!', 'success');
                setTimeout(() => setPasswordSuccess(''), 3000);
            } else {
                setPasswordError(response.message || 'Failed to update password');
            }
        } catch (error) {
            setPasswordError(error.message || 'Failed to update password');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await userService.deleteAccount();
            showToast('Account deleted successfully. Goodbye!', 'success');
            setShowDeleteModal(false);
            // Clear all local storage data
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem(SETTINGS_STORAGE_KEY);
            localStorage.removeItem('pilltrack-reminder-times');
            // Logout and redirect
            logout();
            navigate('/');
        } catch (error) {
            // If backend is unavailable, offer to clear local data only
            const isNetworkError = error.message?.includes('timeout') || 
                                   error.message?.includes('Network Error') ||
                                   error.message?.includes('unexpected');
            
            if (isNetworkError) {
                // Clear local data and log out even if backend is down
                showToast('Backend unavailable. Logging out and clearing local data.', 'info');
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                localStorage.removeItem(SETTINGS_STORAGE_KEY);
                localStorage.removeItem('pilltrack-reminder-times');
                logout();
                navigate('/');
            } else {
                showToast(error.message || 'Failed to delete account. Please try again.', 'error');
            }
            setShowDeleteModal(false);
        }
    };

    const handleSignOut = () => {
        logout();
        navigate('/');
    };

    const themeOptions = [
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'system', label: 'System', icon: Monitor }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <Toast 
                        message={toast.message} 
                        type={toast.type} 
                        onClose={() => setToast(null)} 
                    />
                )}
            </AnimatePresence>

            {/* Delete Account Modal */}
            <DeleteAccountModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteAccount}
            />

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
                <p className="text-slate-500 dark:text-slate-400">Customize your PillTrack experience.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Test Notification System */}
                <SettingSection title="🔔 Test Notification System" description="Verify your alerts are working">
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-300">Current Dhaka Time:</span>
                                <span className="font-mono font-bold text-lg text-primary">{currentDhakaTime}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-300">Browser Permission:</span>
                                <span className={cn(
                                    "px-2 py-1 rounded text-xs font-medium",
                                    notificationStatus === 'granted' ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                                    notificationStatus === 'denied' ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" :
                                    "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                                )}>
                                    {notificationStatus === 'granted' ? '✅ Granted' :
                                     notificationStatus === 'denied' ? '❌ Denied' : '⚠️ Not Asked'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-300">Sound Enabled:</span>
                                <span className={cn(
                                    "px-2 py-1 rounded text-xs font-medium",
                                    soundEnabled ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                )}>
                                    {soundEnabled ? '🔊 On' : '🔇 Off'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-300">Pending Reminders:</span>
                                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                    {pendingReminders?.length || 0} doses
                                </span>
                            </div>
                        </div>
                        
                        {notificationStatus !== 'granted' && (
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-3">
                                <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                                <div>
                                    <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">Permission Required</p>
                                    <p className="text-xs text-amber-600 dark:text-amber-300 mb-2">Browser notifications need permission to work.</p>
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30"
                                        onClick={async () => {
                                            const granted = await requestNotificationPermission();
                                            setNotificationStatus(granted ? 'granted' : 'denied');
                                        }}
                                    >
                                        Request Permission
                                    </Button>
                                </div>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-3">
                            <Button 
                                onClick={() => {
                                    ensureAudioInitialized();
                                    playTestSound('melody');
                                }}
                                variant="outline"
                                className="gap-2 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                                <Volume2 size={16} />
                                Test Sound
                            </Button>
                            <Button 
                                onClick={() => {
                                    ensureAudioInitialized();
                                    triggerTestReminder();
                                }}
                                className="gap-2 bg-primary"
                            >
                                <Play size={16} />
                                Test Full Alert
                            </Button>
                        </div>
                        
                        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                            Click "Test Full Alert" to see the medication reminder popup
                        </p>
                    </div>
                </SettingSection>

                {/* Notifications */}
                <SettingSection title="Notifications" description="Control how you receive reminders and alerts">
                    <ToggleSetting 
                        icon={Bell} 
                        label="Push Notifications" 
                        description="Receive browser push notifications"
                        checked={settings.pushNotifications}
                        onChange={(v) => updateSetting('pushNotifications', v)}
                    />
                    <ToggleSetting 
                        icon={Mail} 
                        label="Email Notifications" 
                        description="Daily summary and alerts via email"
                        checked={settings.emailNotifications}
                        onChange={(v) => updateSetting('emailNotifications', v)}
                    />
                    <ToggleSetting 
                        icon={Smartphone} 
                        label="SMS Notifications" 
                        description="Critical reminders via text message"
                        checked={settings.smsNotifications}
                        onChange={(v) => updateSetting('smsNotifications', v)}
                    />
                    <ToggleSetting 
                        icon={Volume2} 
                        label="Reminder Sound" 
                        description="Play sound with notifications"
                        checked={settings.reminderSound}
                        onChange={(v) => updateSetting('reminderSound', v)}
                    />
                </SettingSection>

                {/* Reminder Schedule */}
                <SettingSection title="Default Reminder Times" description="Set your preferred medication schedule times">
                    <div className="space-y-4">
                        {[
                            { key: 'morning', label: 'Morning', icon: '🌅' },
                            { key: 'afternoon', label: 'Afternoon', icon: '☀️' },
                            { key: 'evening', label: 'Evening', icon: '🌙' }
                        ].map((time) => (
                            <div key={time.key} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{time.icon}</span>
                                    <span className="font-medium text-slate-800 dark:text-white">{time.label}</span>
                                </div>
                                <Input 
                                    type="time" 
                                    className="w-32 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    value={reminderTimes[time.key]}
                                    onChange={(e) => setReminderTimes(prev => ({ ...prev, [time.key]: e.target.value }))}
                                />
                            </div>
                        ))}
                    </div>
                </SettingSection>

                {/* Appearance */}
                <SettingSection title="Appearance" description="Customize how PillTrack looks">
                    <div className="py-3">
                        <Label className="flex items-center gap-2 mb-3 dark:text-white">
                            <Moon size={18} /> Theme
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                            {themeOptions.map((option) => {
                                const Icon = option.icon;
                                const isActive = 
                                    option.value === 'system' ? false :
                                    option.value === theme;
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            if (option.value === 'light') setLightTheme();
                                            else if (option.value === 'dark') setDarkTheme();
                                            else setSystemTheme();
                                            showToast(`Theme changed to ${option.label}`, 'success');
                                        }}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                                            isActive
                                                ? "border-primary bg-primary/5 dark:bg-primary/10"
                                                : "border-slate-200 dark:border-slate-600 hover:border-primary/50"
                                        )}
                                    >
                                        <Icon size={20} className={isActive ? "text-primary" : "text-slate-500 dark:text-slate-400"} />
                                        <span className={cn(
                                            "text-sm font-medium",
                                            isActive ? "text-primary" : "text-slate-600 dark:text-slate-300"
                                        )}>
                                            {option.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="py-3">
                        <Label className="flex items-center gap-2 mb-3 dark:text-white">
                            <Globe size={18} /> Language
                        </Label>
                        <select 
                            className="flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                            value={settings.language}
                            onChange={(e) => {
                                updateSetting('language', e.target.value);
                                showToast('Language preference saved. Full translation coming soon!', 'info');
                            }}
                        >
                            <option value="en">English (US)</option>
                            <option value="bn">বাংলা (Bengali)</option>
                            <option value="es">Español (Spanish)</option>
                            <option value="fr">Français (French)</option>
                        </select>
                    </div>
                </SettingSection>

                {/* Security */}
                <SettingSection title="Security" description="Keep your account safe">
                    <ToggleSetting 
                        icon={Shield} 
                        label="Two-Factor Authentication" 
                        description="Add an extra layer of security (coming soon)"
                        checked={settings.twoFactorAuth}
                        onChange={(v) => {
                            updateSetting('twoFactorAuth', v);
                            if (v) {
                                showToast('2FA setup will be available in the next update!', 'info');
                            }
                        }}
                    />
                    
                    <div className="py-3 border-b border-slate-50 dark:border-slate-700">
                        <Label className="flex items-center gap-2 mb-3 dark:text-white">
                            <Lock size={18} /> Change Password
                        </Label>
                        {passwordError && (
                            <div className="p-3 mb-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                                {passwordError}
                            </div>
                        )}
                        {passwordSuccess && (
                            <div className="p-3 mb-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
                                {passwordSuccess}
                            </div>
                        )}
                        <div className="space-y-3">
                            <div className="relative">
                                <Input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Current password"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                                />
                                <button 
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <div>
                                <Input 
                                    type="password" 
                                    placeholder="New password" 
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                                />
                                <PasswordStrength password={passwordForm.newPassword} />
                            </div>
                            <Input 
                                type="password" 
                                placeholder="Confirm new password" 
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                className="dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                            />
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handlePasswordChange}
                                disabled={passwordLoading}
                                className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                                {passwordLoading && <Loader2 size={14} className="animate-spin mr-2" />}
                                Update Password
                            </Button>
                        </div>
                    </div>

                    <ToggleSetting 
                        icon={Eye} 
                        label="Public Adherence Stats" 
                        description="Show adherence on public profile"
                        checked={settings.showAdherencePublic}
                        onChange={(v) => updateSetting('showAdherencePublic', v)}
                    />
                </SettingSection>

                {/* Account Actions */}
                <SettingSection title="Account" description="Manage your account">
                    <button 
                        className="flex items-center justify-between w-full py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg px-2 -mx-2 transition-colors"
                        onClick={handleSignOut}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                                <LogOut size={18} />
                            </div>
                            <div>
                                <p className="font-medium text-slate-800 dark:text-white">Sign Out</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Sign out of all devices</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-400" />
                    </button>

                    <button 
                        className="flex items-center justify-between w-full py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg px-2 -mx-2 transition-colors group"
                        onClick={() => setShowDeleteModal(true)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                                <Trash2 size={18} />
                            </div>
                            <div>
                                <p className="font-medium text-red-600 dark:text-red-400">Delete Account</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Permanently remove your data</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-400 group-hover:text-red-400" />
                    </button>
                </SettingSection>

                {/* Save Button */}
                <div className="lg:col-span-2 flex justify-end">
                    <Button 
                        size="lg" 
                        className="gap-2 shadow-lg shadow-primary/20"
                        onClick={handleSaveAllSettings}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Check size={18} />
                                Save All Settings
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
