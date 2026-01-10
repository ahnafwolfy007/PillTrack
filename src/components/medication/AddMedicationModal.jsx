import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check, Pill, Clock, Bell, Package, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Card, CardContent } from '../ui/Card';
import { cn } from '../../utils/cn';
import { medicationService } from '../../services/api';

const STEPS = ['basics', 'schedule', 'reminders', 'inventory'];

// Map frontend type names to backend enum values
const typeMapping = {
    tablet: 'TABLET',
    capsule: 'CAPSULE',
    liquid: 'LIQUID',
    injection: 'INJECTION',
    cream: 'CREAM',
    drops: 'DROPS',
    inhaler: 'INHALER',
    patch: 'PATCH',
    powder: 'POWDER',
    other: 'OTHER'
};

const AddMedicationModal = ({ isOpen, onClose, onAdd }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        type: 'tablet',
        dosage: '',
        unit: 'mg',
        frequency: 'daily',
        times: ['08:00'],
        withFood: false,
        reminderEnabled: true,
        reminderMinutes: 15,
        currentStock: '',
        lowStockAlert: 10
    });

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addTime = () => {
        setFormData(prev => ({ ...prev, times: [...prev.times, '12:00'] }));
    };

    const removeTime = (index) => {
        setFormData(prev => ({
            ...prev,
            times: prev.times.filter((_, i) => i !== index)
        }));
    };

    const updateTime = (index, value) => {
        setFormData(prev => ({
            ...prev,
            times: prev.times.map((t, i) => i === index ? value : t)
        }));
    };

    const handleNext = async () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Submit to backend
            setIsSubmitting(true);
            setError('');
            try {
                // Build request matching backend MedicationRequest DTO
                const request = {
                    name: formData.name,
                    type: typeMapping[formData.type] || 'OTHER',
                    strength: `${formData.dosage}${formData.unit}`,
                    frequency: formData.frequency,
                    instructions: formData.withFood ? 'Take with food' : 'Take as directed',
                    currentQuantity: parseInt(formData.currentStock) || 0,
                    refillThreshold: parseInt(formData.lowStockAlert) || 10,
                    reminderTimes: formData.times,
                    startDate: new Date().toISOString().split('T')[0]
                };

                await medicationService.create(request);
                onAdd?.(formData);
                onClose();
                setCurrentStep(0);
                setFormData({
                    name: '',
                    type: 'tablet',
                    dosage: '',
                    unit: 'mg',
                    frequency: 'daily',
                    times: ['08:00'],
                    withFood: false,
                    reminderEnabled: true,
                    reminderMinutes: 15,
                    currentStock: '',
                    lowStockAlert: 10
                });
            } catch (err) {
                setError(err.message || 'Failed to add medication');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-900">Add New Medication</h2>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X size={20} />
                        </Button>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-between">
                        {STEPS.map((step, i) => {
                            const icons = { basics: Pill, schedule: Clock, reminders: Bell, inventory: Package };
                            const Icon = icons[step];
                            const isComplete = i < currentStep;
                            const isCurrent = i === currentStep;

                            return (
                                <React.Fragment key={step}>
                                    <div className="flex flex-col items-center">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                                            isComplete ? "bg-green-500 text-white" :
                                            isCurrent ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                                        )}>
                                            {isComplete ? <Check size={18} /> : <Icon size={18} />}
                                        </div>
                                        <span className={cn(
                                            "text-xs mt-2 capitalize",
                                            isCurrent ? "text-primary font-medium" : "text-slate-400"
                                        )}>
                                            {step}
                                        </span>
                                    </div>
                                    {i < STEPS.length - 1 && (
                                        <div className={cn(
                                            "flex-1 h-0.5 mx-2",
                                            i < currentStep ? "bg-green-500" : "bg-slate-200"
                                        )} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[50vh]">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Basic Info */}
                        {currentStep === 0 && (
                            <motion.div
                                key="basics"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label>Medication Name</Label>
                                    <Input
                                        placeholder="e.g., Amoxicillin"
                                        value={formData.name}
                                        onChange={(e) => updateField('name', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {['tablet', 'capsule', 'liquid', 'injection'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => updateField('type', type)}
                                                className={cn(
                                                    "p-3 rounded-xl border text-center transition-all capitalize",
                                                    formData.type === type
                                                        ? "bg-primary/10 border-primary text-primary"
                                                        : "border-slate-200 hover:border-slate-300"
                                                )}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Dosage</Label>
                                        <Input
                                            type="number"
                                            placeholder="500"
                                            value={formData.dosage}
                                            onChange={(e) => updateField('dosage', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Unit</Label>
                                        <select
                                            className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                            value={formData.unit}
                                            onChange={(e) => updateField('unit', e.target.value)}
                                        >
                                            <option value="mg">mg</option>
                                            <option value="g">g</option>
                                            <option value="ml">ml</option>
                                            <option value="IU">IU</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Schedule */}
                        {currentStep === 1 && (
                            <motion.div
                                key="schedule"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label>Frequency</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { value: 'daily', label: 'Daily' },
                                            { value: 'weekly', label: 'Weekly' },
                                            { value: 'asNeeded', label: 'As Needed' }
                                        ].map((freq) => (
                                            <button
                                                key={freq.value}
                                                onClick={() => updateField('frequency', freq.value)}
                                                className={cn(
                                                    "p-3 rounded-xl border text-center transition-all",
                                                    formData.frequency === freq.value
                                                        ? "bg-primary/10 border-primary text-primary"
                                                        : "border-slate-200 hover:border-slate-300"
                                                )}
                                            >
                                                {freq.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Times</Label>
                                        <Button variant="ghost" size="sm" onClick={addTime}>
                                            + Add Time
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {formData.times.map((time, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <Input
                                                    type="time"
                                                    value={time}
                                                    onChange={(e) => updateTime(i, e.target.value)}
                                                    className="flex-1"
                                                />
                                                {formData.times.length > 1 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-slate-400 hover:text-red-500"
                                                        onClick={() => removeTime(i)}
                                                    >
                                                        <X size={16} />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="withFood"
                                        checked={formData.withFood}
                                        onChange={(e) => updateField('withFood', e.target.checked)}
                                        className="accent-primary w-4 h-4"
                                    />
                                    <label htmlFor="withFood" className="text-sm text-slate-700 cursor-pointer">
                                        Take with food
                                    </label>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Reminders */}
                        {currentStep === 2 && (
                            <motion.div
                                key="reminders"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                    <div>
                                        <p className="font-medium text-slate-800">Enable Reminders</p>
                                        <p className="text-sm text-slate-500">Get notified when it's time to take your medication</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.reminderEnabled}
                                            onChange={(e) => updateField('reminderEnabled', e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>

                                {formData.reminderEnabled && (
                                    <div className="space-y-2">
                                        <Label>Remind me before</Label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[5, 10, 15, 30].map((mins) => (
                                                <button
                                                    key={mins}
                                                    onClick={() => updateField('reminderMinutes', mins)}
                                                    className={cn(
                                                        "p-3 rounded-xl border text-center transition-all",
                                                        formData.reminderMinutes === mins
                                                            ? "bg-primary/10 border-primary text-primary"
                                                            : "border-slate-200 hover:border-slate-300"
                                                    )}
                                                >
                                                    {mins} min
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                <Bell size={20} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">Notification Preview</p>
                                                <p className="text-sm text-slate-500">
                                                    "Time to take {formData.name || 'your medication'} - {formData.dosage}{formData.unit}"
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Step 4: Inventory */}
                        {currentStep === 3 && (
                            <motion.div
                                key="inventory"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label>Current Stock (number of doses)</Label>
                                    <Input
                                        type="number"
                                        placeholder="e.g., 30"
                                        value={formData.currentStock}
                                        onChange={(e) => updateField('currentStock', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Low Stock Alert Threshold</Label>
                                    <Input
                                        type="number"
                                        placeholder="10"
                                        value={formData.lowStockAlert}
                                        onChange={(e) => updateField('lowStockAlert', parseInt(e.target.value))}
                                    />
                                    <p className="text-xs text-slate-500">
                                        You'll be notified when stock falls below this number
                                    </p>
                                </div>

                                {/* Summary */}
                                <Card className="bg-gradient-to-br from-primary/5 to-blue-50 border-none">
                                    <CardContent className="p-4">
                                        <h4 className="font-semibold text-slate-800 mb-3">Summary</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Medication</span>
                                                <span className="font-medium">{formData.name || '-'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Dosage</span>
                                                <span className="font-medium">{formData.dosage}{formData.unit} ({formData.type})</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Frequency</span>
                                                <span className="font-medium capitalize">{formData.frequency}, {formData.times.length}x</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Reminders</span>
                                                <span className="font-medium">{formData.reminderEnabled ? 'Enabled' : 'Disabled'}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            disabled={currentStep === 0 || isSubmitting}
                            className="gap-2"
                        >
                            <ChevronLeft size={16} /> Back
                        </Button>
                        <Button onClick={handleNext} className="gap-2" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" /> Saving...
                                </>
                            ) : currentStep === STEPS.length - 1 ? (
                                'Add Medication'
                            ) : (
                                <>Continue <ChevronRight size={16} /></>
                            )}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AddMedicationModal;
