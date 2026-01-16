import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, X, Clock, Check, Volume2, VolumeX, Bell, SkipForward, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNotifications } from '../../context/NotificationContext';
import { doseLogService } from '../../services/api';

const ReminderAlert = () => {
    const { 
        activeReminder, 
        dismissReminder, 
        snoozeReminder, 
        soundEnabled, 
        toggleSound 
    } = useNotifications();
    const [loading, setLoading] = useState(false);
    const [action, setAction] = useState(null);

    if (!activeReminder) return null;
    
    const handleTaken = async () => {
        setLoading(true);
        setAction('take');
        try {
            // If this is linked to a dose log, mark it as taken
            if (activeReminder.data?.doseLogId) {
                await doseLogService.markAsTaken(activeReminder.data.doseLogId);
            }
            dismissReminder();
        } catch (error) {
            console.error('Failed to mark as taken:', error);
            dismissReminder();
        } finally {
            setLoading(false);
        }
    };
    
    const handleSkip = async () => {
        setLoading(true);
        setAction('skip');
        try {
            if (activeReminder.data?.doseLogId) {
                await doseLogService.markAsSkipped(activeReminder.data.doseLogId, 'Skipped from reminder');
            }
            dismissReminder();
        } catch (error) {
            console.error('Failed to skip:', error);
            dismissReminder();
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
                >
                    {/* Header with animated gradient */}
                    <div className="bg-gradient-to-r from-primary via-blue-500 to-primary bg-[length:200%_100%] animate-gradient p-6 text-white text-center relative">
                        <button 
                            onClick={toggleSound}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                        </button>
                        
                        <motion.div
                            animate={{ 
                                scale: [1, 1.1, 1],
                                rotate: [0, -10, 10, 0]
                            }}
                            transition={{ 
                                duration: 1.5, 
                                repeat: Infinity,
                                repeatType: "reverse"
                            }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4"
                        >
                            <Pill size={40} className="text-white" />
                        </motion.div>
                        
                        <h2 className="text-2xl font-bold mb-1">Medication Reminder</h2>
                        <p className="text-blue-100 flex items-center justify-center gap-2">
                            <Clock size={14} />
                            {new Date(activeReminder.time).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            })}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-semibold text-slate-800 mb-2">
                                {activeReminder.data?.medicationName || 'Your Medication'}
                            </h3>
                            <p className="text-slate-500">{activeReminder.message}</p>
                        </div>

                        {/* Action buttons */}
                        <div className="space-y-3">
                            <Button 
                                className="w-full gap-2 text-lg py-6 shadow-lg shadow-primary/25 bg-green-500 hover:bg-green-600"
                                onClick={handleTaken}
                                disabled={loading}
                            >
                                {loading && action === 'take' ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <Check size={20} />
                                )}
                                I've Taken It
                            </Button>
                            
                            <Button 
                                variant="outline"
                                className="w-full gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
                                onClick={handleSkip}
                                disabled={loading}
                            >
                                {loading && action === 'skip' ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <SkipForward size={16} />
                                )}
                                Skip This Dose
                            </Button>
                            
                            <div className="grid grid-cols-3 gap-2">
                                <Button 
                                    variant="outline" 
                                    className="flex-1"
                                    onClick={() => snoozeReminder(5)}
                                    disabled={loading}
                                >
                                    5 min
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="flex-1"
                                    onClick={() => snoozeReminder(10)}
                                    disabled={loading}
                                >
                                    10 min
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="flex-1"
                                    onClick={() => snoozeReminder(15)}
                                    disabled={loading}
                                >
                                    15 min
                                </Button>
                            </div>
                            
                            <p className="text-xs text-center text-slate-400">
                                Tap snooze to be reminded later
                            </p>
                        </div>
                    </div>

                    {/* Dismiss button */}
                    <div className="px-6 pb-6">
                        <button 
                            onClick={dismissReminder}
                            className="w-full text-center text-sm text-slate-400 hover:text-slate-600 transition-colors"
                            disabled={loading}
                        >
                            Dismiss without action
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// Add gradient animation to tailwind
const style = document.createElement('style');
style.textContent = `
@keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}
.animate-gradient {
    animation: gradient 3s ease infinite;
}
`;
document.head.appendChild(style);

export default ReminderAlert;
