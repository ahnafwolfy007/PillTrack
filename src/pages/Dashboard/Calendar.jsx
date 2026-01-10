import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Pill, Clock, Check, X, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

const Calendar = () => {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [currentView, setCurrentView] = useState('dayGridMonth');

    // Mock medication events
    const events = [
        {
            id: '1',
            title: 'Amoxicillin 500mg',
            start: '2026-01-10T08:00:00',
            end: '2026-01-10T08:30:00',
            backgroundColor: '#3B82F6',
            borderColor: '#3B82F6',
            extendedProps: { status: 'taken', dose: '500mg', type: 'Antibiotic' }
        },
        {
            id: '2',
            title: 'Amoxicillin 500mg',
            start: '2026-01-10T14:00:00',
            end: '2026-01-10T14:30:00',
            backgroundColor: '#F59E0B',
            borderColor: '#F59E0B',
            extendedProps: { status: 'upcoming', dose: '500mg', type: 'Antibiotic' }
        },
        {
            id: '3',
            title: 'Amoxicillin 500mg',
            start: '2026-01-10T20:00:00',
            end: '2026-01-10T20:30:00',
            backgroundColor: '#94A3B8',
            borderColor: '#94A3B8',
            extendedProps: { status: 'scheduled', dose: '500mg', type: 'Antibiotic' }
        },
        {
            id: '4',
            title: 'Vitamin D3 2000IU',
            start: '2026-01-10T08:00:00',
            backgroundColor: '#10B981',
            borderColor: '#10B981',
            extendedProps: { status: 'taken', dose: '2000 IU', type: 'Supplement' }
        },
        {
            id: '5',
            title: 'Metformin 500mg',
            start: '2026-01-10T07:30:00',
            backgroundColor: '#3B82F6',
            borderColor: '#3B82F6',
            extendedProps: { status: 'taken', dose: '500mg', type: 'Diabetes' }
        },
        {
            id: '6',
            title: 'Metformin 500mg',
            start: '2026-01-10T19:30:00',
            backgroundColor: '#94A3B8',
            borderColor: '#94A3B8',
            extendedProps: { status: 'scheduled', dose: '500mg', type: 'Diabetes' }
        },
        // Add events for other days
        ...Array.from({ length: 30 }, (_, i) => ([
            {
                id: `vitamin-${i}`,
                title: 'Vitamin D3',
                start: `2026-01-${String(i + 1).padStart(2, '0')}T08:00:00`,
                backgroundColor: i < 10 ? '#10B981' : '#94A3B8',
                borderColor: i < 10 ? '#10B981' : '#94A3B8',
                extendedProps: { status: i < 10 ? 'taken' : 'scheduled', dose: '2000 IU', type: 'Supplement' }
            }
        ])).flat()
    ];

    const handleEventClick = (clickInfo) => {
        setSelectedEvent({
            title: clickInfo.event.title,
            time: clickInfo.event.start,
            ...clickInfo.event.extendedProps
        });
    };

    const handleDateClick = (arg) => {
        // Could open add medication modal for this date
        console.log('Date clicked:', arg.date);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'taken': return 'text-green-600 bg-green-50';
            case 'missed': return 'text-red-600 bg-red-50';
            case 'skipped': return 'text-amber-600 bg-amber-50';
            case 'upcoming': return 'text-blue-600 bg-blue-50';
            default: return 'text-slate-600 bg-slate-50';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Medication Schedule</h1>
                    <p className="text-slate-500">View and manage your medication calendar.</p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant={currentView === 'dayGridMonth' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentView('dayGridMonth')}
                    >
                        Month
                    </Button>
                    <Button 
                        variant={currentView === 'timeGridWeek' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentView('timeGridWeek')}
                    >
                        Week
                    </Button>
                    <Button 
                        variant={currentView === 'timeGridDay' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentView('timeGridDay')}
                    >
                        Day
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-3">
                    <Card className="border-none shadow-md overflow-hidden">
                        <CardContent className="p-4">
                            <style>{`
                                .fc {
                                    --fc-border-color: #e2e8f0;
                                    --fc-button-bg-color: #3B82F6;
                                    --fc-button-border-color: #3B82F6;
                                    --fc-button-hover-bg-color: #2563EB;
                                    --fc-button-hover-border-color: #2563EB;
                                    --fc-today-bg-color: #EFF6FF;
                                }
                                .fc-toolbar-title {
                                    font-size: 1.25rem !important;
                                    font-weight: 600;
                                }
                                .fc-button {
                                    border-radius: 0.5rem !important;
                                    padding: 0.5rem 1rem !important;
                                    font-weight: 500 !important;
                                }
                                .fc-event {
                                    border-radius: 0.375rem !important;
                                    padding: 2px 6px !important;
                                    font-size: 0.75rem !important;
                                    cursor: pointer;
                                }
                                .fc-daygrid-day-number {
                                    padding: 8px !important;
                                    font-weight: 500;
                                }
                                .fc-col-header-cell-cushion {
                                    padding: 12px !important;
                                    font-weight: 600;
                                    color: #64748b;
                                }
                            `}</style>
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView={currentView}
                                key={currentView}
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: ''
                                }}
                                events={events}
                                eventClick={handleEventClick}
                                dateClick={handleDateClick}
                                height="auto"
                                aspectRatio={1.5}
                                eventDisplay="block"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Legend */}
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle className="text-base">Status Legend</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                { status: 'Taken', color: 'bg-green-500' },
                                { status: 'Upcoming', color: 'bg-blue-500' },
                                { status: 'Missed', color: 'bg-red-500' },
                                { status: 'Skipped', color: 'bg-amber-500' },
                                { status: 'Scheduled', color: 'bg-slate-400' }
                            ].map((item) => (
                                <div key={item.status} className="flex items-center gap-3">
                                    <div className={cn("w-3 h-3 rounded-full", item.color)} />
                                    <span className="text-sm text-slate-600">{item.status}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Selected Event Details */}
                    {selectedEvent && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="border-none shadow-md">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Pill size={18} className="text-primary" />
                                        {selectedEvent.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Clock size={14} />
                                        {new Date(selectedEvent.time).toLocaleTimeString([], { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md font-medium">
                                            {selectedEvent.dose}
                                        </span>
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                                            {selectedEvent.type}
                                        </span>
                                        <span className={cn("px-2 py-1 text-xs rounded-md font-medium capitalize", getStatusColor(selectedEvent.status))}>
                                            {selectedEvent.status}
                                        </span>
                                    </div>

                                    {selectedEvent.status === 'upcoming' && (
                                        <div className="flex gap-2 pt-2">
                                            <Button size="sm" className="flex-1 gap-1">
                                                <Check size={14} /> Take
                                            </Button>
                                            <Button size="sm" variant="outline" className="flex-1 gap-1">
                                                <X size={14} /> Skip
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Adherence Stats */}
                    <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
                        <CardContent className="p-6 text-center">
                            <div className="text-4xl font-bold text-green-600 mb-1">92%</div>
                            <div className="text-sm text-green-700 font-medium">This Month's Adherence</div>
                            <div className="mt-4 text-xs text-green-600">
                                23 of 25 doses taken on time
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Calendar;
