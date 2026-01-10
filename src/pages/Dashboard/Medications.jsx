import React, { useState } from 'react';
import { Search, Plus, MoreVertical, Calendar, Clock, AlertTriangle, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import AddMedicationModal from '../../components/medication/AddMedicationModal';

const MedicationItem = ({ name, dose, frequency, stock, nextDose, image, i, onEdit, onDelete }) => {
    const [showActions, setShowActions] = useState(false);
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
        >
            <Card className="mb-4 hover:shadow-md transition-all border-l-4 border-l-primary/0 hover:border-l-primary group">
                <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 font-bold text-lg shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                        {image ? <img src={image} className="w-full h-full object-cover rounded-full mix-blend-multiply" /> : name[0]}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg truncate">{name}</h3>
                                <p className="text-sm text-slate-500">{dose} • {frequency}</p>
                            </div>
                            <div className="relative">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-slate-400"
                                    onClick={() => setShowActions(!showActions)}
                                >
                                    <MoreVertical size={18} />
                                </Button>
                                <AnimatePresence>
                                    {showActions && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10 min-w-[120px]"
                                        >
                                            <button 
                                                className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                                onClick={() => { setShowActions(false); }}
                                            >
                                                <Eye size={14} /> View Details
                                            </button>
                                            <button 
                                                className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                                onClick={() => { setShowActions(false); onEdit && onEdit(); }}
                                            >
                                                <Edit size={14} /> Edit
                                            </button>
                                            <button 
                                                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                onClick={() => { setShowActions(false); onDelete && onDelete(); }}
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 mt-3 text-sm text-slate-600">
                            <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded text-xs font-medium">
                                <Clock size={14} /> Next: {nextDose}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${stock}%` }}></div>
                                </div>
                                <span className="text-xs">{stock}% Stock</span>
                            </div>
                            {stock < 20 && (
                                <span className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                                    <AlertTriangle size={12} /> Refill Soon
                                </span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

const Medications = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [medications, setMedications] = useState([
        { id: 1, name: "Amoxicillin", dose: "500mg", frequency: "3x daily", stock: 85, nextDose: "14:00 Today" },
        { id: 2, name: "Lisinopril", dose: "10mg", frequency: "1x daily", stock: 30, nextDose: "08:00 Tomorrow" },
        { id: 3, name: "Metformin", dose: "500mg", frequency: "2x daily with meals", stock: 15, nextDose: "19:00 Today" },
        { id: 4, name: "Vitamin D3", dose: "2000 IU", frequency: "1x daily", stock: 95, nextDose: "08:00 Tomorrow" }
    ]);
    
    const filteredMedications = medications.filter(med => 
        med.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const handleAddMedication = (newMed) => {
        setMedications(prev => [...prev, { 
            id: Date.now(), 
            ...newMed, 
            stock: 100, 
            nextDose: "08:00 Tomorrow" 
        }]);
    };
    
    const handleDeleteMedication = (id) => {
        setMedications(prev => prev.filter(med => med.id !== id));
    };
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">My Medications</h1>
                    <p className="text-slate-500">Manage your prescriptions and schedule.</p>
                </div>
                <Button 
                    className="gap-2 shadow-lg shadow-primary/20"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus size={18} /> Add New Medication
                </Button>
            </div>

            <Card className="border-none shadow-sm bg-slate-50/50">
                <div className="p-4 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input 
                            className="pl-10 bg-white border-slate-200" 
                            placeholder="Search medications..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="bg-white">Filter</Button>
                </div>
            </Card>

            <div className="space-y-2">
                {filteredMedications.length === 0 ? (
                    <Card className="p-8 text-center">
                        <p className="text-slate-500 mb-4">No medications found.</p>
                        <Button onClick={() => setIsModalOpen(true)}>
                            <Plus size={16} className="mr-2" /> Add Your First Medication
                        </Button>
                    </Card>
                ) : (
                    filteredMedications.map((med, i) => (
                        <MedicationItem 
                            key={med.id} 
                            {...med} 
                            i={i}
                            onDelete={() => handleDeleteMedication(med.id)}
                        />
                    ))
                )}
            </div>
            
            <AddMedicationModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddMedication}
            />
        </div>
    );
};

export default Medications;
