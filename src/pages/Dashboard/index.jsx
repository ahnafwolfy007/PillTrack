import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Pill, Clock, AlertCircle, CheckCircle, TrendingUp, Calendar as CalendarIcon, MoreVertical, Plus, ShoppingCart } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { cn } from '../../utils/cn';
import { Link, useNavigate } from 'react-router-dom';
import AddMedicationModal from '../../components/medication/AddMedicationModal';

const Dashboard = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const adherenceData = [
        { name: 'Taken', value: 85, color: '#10B981' }, // emerald-500
        { name: 'Missed', value: 5, color: '#EF4444' }, // red-500
        { name: 'Skipped', value: 10, color: '#F59E0B' }, // amber-500
    ];

    const timeline = [
        { time: '08:00', name: 'Vitamin D', dose: '1000 IU', status: 'taken' },
        { time: '13:00', name: 'Amoxicillin', dose: '500mg', status: 'upcoming' },
        { time: '20:00', name: 'Amoxicillin', dose: '500mg', status: 'future' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Good Afternoon, Alex</h1>
                    <p className="text-slate-500">Here's your daily health overview.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2" onClick={() => navigate('/dashboard/calendar')}>
                        <CalendarIcon className="w-4 h-4" /> Today
                    </Button>
                    <Button className="gap-2 shadow-lg shadow-primary/25" onClick={() => setIsModalOpen(true)}>
                        <Plus className="w-4 h-4" /> Add Medication
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Adherence Score', value: '92%', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
                    { label: 'Active Meds', value: '4', icon: Pill, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Next Refill', value: '3 Days', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Alerts', value: '1', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="hover:shadow-md transition-shadow border-none bg-white">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                                </div>
                                <div className={cn("p-3 rounded-xl", stat.bg, stat.color)}>
                                    <stat.icon size={24} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Hero Card - Next Medication */}
                <div className="lg:col-span-2 space-y-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="bg-gradient-to-br from-primary to-blue-700 text-white border-none shadow-2xl relative overflow-hidden min-h-[280px] flex flex-col justify-center">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 p-10 opacity-10">
                                <Pill size={200} className="rotate-12" />
                            </div>
                            <div className="absolute bottom-0 left-0 p-8 opacity-10">
                                <Clock size={150} className="-rotate-12" />
                            </div>

                            <CardContent className="relative z-10 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-8">
                                <div className="space-y-6 text-center sm:text-left">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-sm font-medium border border-white/20">
                                        <Clock size={14} /> Upcoming in 45 mins
                                    </div>
                                    <div>
                                        <h2 className="text-4xl font-bold mb-2">Amoxicillin</h2>
                                        <p className="text-blue-100 text-lg">500mg • Take with food</p>
                                    </div>
                                    <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                                        <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl border-0">
                                            Take Now
                                        </Button>
                                        <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 hover:text-white">
                                            Snooze 10m
                                        </Button>
                                    </div>
                                </div>

                                {/* 3D-like Visual Placeholder */}
                                <div className="w-40 h-40 bg-white/10 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl relative">
                                    <div className="absolute inset-2 border-2 border-dashed border-white/30 rounded-full animate-spin-slow" style={{ animationDuration: '20s' }}></div>
                                    <Pill size={64} className="text-white drop-shadow-lg" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Today's Schedule */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Today's Schedule</CardTitle>
                            <Link to="/dashboard/calendar">
                                <Button variant="ghost" size="sm" className="text-slate-400">View Calendar</Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                {timeline.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + (i * 0.1) }}
                                        className="relative flex items-start gap-4"
                                    >
                                        <div className={cn(
                                            "relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm shrink-0",
                                            item.status === 'taken' ? "bg-green-100 text-green-600" :
                                                item.status === 'upcoming' ? "bg-blue-100 text-blue-600 animate-pulse" : "bg-slate-100 text-slate-400"
                                        )}>
                                            {item.status === 'taken' ? <CheckCircle size={18} /> :
                                                item.status === 'upcoming' ? <Clock size={18} /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
                                        </div>
                                        <div className="flex-1 pt-1 pb-4 border-b border-slate-50 last:border-0">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold text-slate-900">{item.name}</h4>
                                                    <p className="text-sm text-slate-500">{item.dose} • {item.status === 'taken' ? 'Taken at 8:05' : ' Scheduled for ' + item.time}</p>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                                    <MoreVertical size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {/* Adherence Chart */}
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle>Adherence</CardTitle>
                            <CardDescription>Weekly overview</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[250px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={adherenceData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {adherenceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold text-slate-800">92%</span>
                                <span className="text-xs text-slate-500 font-medium">Excellent</span>
                            </div>
                        </CardContent>
                        <div className="px-6 pb-6 flex justify-center gap-4 text-xs text-slate-500">
                            {adherenceData.map((d, i) => (
                                <div key={i} className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                                    {d.name}
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Low Stock Alert */}
                    <Card className="border-l-4 border-amber-500 bg-amber-50/50 border-y-0 border-r-0 shadow-sm">
                        <CardContent className="p-4 flex gap-4">
                            <div className="p-2 bg-amber-100 rounded-lg h-fit text-amber-600">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900">Low Stock Alert</h4>
                                <p className="text-sm text-slate-600 mt-1">Vitamin D is running low (4 pills left). Refill soon.</p>
                                <Button size="sm" variant="outline" className="mt-3 border-amber-200 text-amber-700 hover:bg-amber-100 bg-white" onClick={() => navigate('/marketplace')}>
                                    <ShoppingCart size={14} className="mr-2" /> Order Refill
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            
            <AddMedicationModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default Dashboard;
