import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { 
    Bell, Moon, Globe, Lock, Smartphone, Mail, 
    Volume2, Clock, Shield, Eye, EyeOff, Check,
    ChevronRight, LogOut, Trash2
} from 'lucide-react';
import { cn } from '../../utils/cn';

const SettingSection = ({ title, description, children }) => (
    <Card className="border-none shadow-md">
        <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">
            {children}
        </CardContent>
    </Card>
);

const ToggleSetting = ({ icon: Icon, label, description, checked, onChange }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                <Icon size={18} />
            </div>
            <div>
                <p className="font-medium text-slate-800">{label}</p>
                {description && <p className="text-sm text-slate-500">{description}</p>}
            </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={checked} 
                onChange={(e) => onChange(e.target.checked)} 
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
    </div>
);

const Settings = () => {
    const [settings, setSettings] = useState({
        pushNotifications: true,
        emailNotifications: true,
        smsNotifications: false,
        reminderSound: true,
        darkMode: false,
        twoFactorAuth: false,
        showAdherencePublic: false
    });

    const [reminderTimes, setReminderTimes] = useState({
        morning: '08:00',
        afternoon: '14:00',
        evening: '20:00'
    });

    const [showPassword, setShowPassword] = useState(false);

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
                <p className="text-slate-500">Customize your PillTrack experience.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                    <span className="font-medium text-slate-800">{time.label}</span>
                                </div>
                                <Input 
                                    type="time" 
                                    className="w-32"
                                    value={reminderTimes[time.key]}
                                    onChange={(e) => setReminderTimes(prev => ({ ...prev, [time.key]: e.target.value }))}
                                />
                            </div>
                        ))}
                    </div>
                </SettingSection>

                {/* Appearance */}
                <SettingSection title="Appearance" description="Customize how PillTrack looks">
                    <ToggleSetting 
                        icon={Moon} 
                        label="Dark Mode" 
                        description="Use dark theme (coming soon)"
                        checked={settings.darkMode}
                        onChange={(v) => updateSetting('darkMode', v)}
                    />
                    
                    <div className="py-3">
                        <Label className="flex items-center gap-2 mb-3">
                            <Globe size={18} /> Language
                        </Label>
                        <select className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                            <option>English (US)</option>
                            <option>Spanish</option>
                            <option>French</option>
                            <option>German</option>
                            <option>Bengali</option>
                        </select>
                    </div>
                </SettingSection>

                {/* Security */}
                <SettingSection title="Security" description="Keep your account safe">
                    <ToggleSetting 
                        icon={Shield} 
                        label="Two-Factor Authentication" 
                        description="Add an extra layer of security"
                        checked={settings.twoFactorAuth}
                        onChange={(v) => updateSetting('twoFactorAuth', v)}
                    />
                    
                    <div className="py-3 border-b border-slate-50">
                        <Label className="flex items-center gap-2 mb-3">
                            <Lock size={18} /> Change Password
                        </Label>
                        <div className="space-y-3">
                            <div className="relative">
                                <Input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Current password"
                                />
                                <button 
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <Input type="password" placeholder="New password" />
                            <Input type="password" placeholder="Confirm new password" />
                            <Button variant="outline" size="sm">Update Password</Button>
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
                    <button className="flex items-center justify-between w-full py-3 text-left hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                                <LogOut size={18} />
                            </div>
                            <div>
                                <p className="font-medium text-slate-800">Sign Out</p>
                                <p className="text-sm text-slate-500">Sign out of all devices</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-400" />
                    </button>

                    <button className="flex items-center justify-between w-full py-3 text-left hover:bg-red-50 rounded-lg px-2 -mx-2 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                <Trash2 size={18} />
                            </div>
                            <div>
                                <p className="font-medium text-red-600">Delete Account</p>
                                <p className="text-sm text-slate-500">Permanently remove your data</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-400 group-hover:text-red-400" />
                    </button>
                </SettingSection>

                {/* Save Button */}
                <div className="lg:col-span-2 flex justify-end">
                    <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
                        <Check size={18} /> Save All Settings
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
