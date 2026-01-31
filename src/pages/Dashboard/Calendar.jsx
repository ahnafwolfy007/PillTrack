import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Pill, Clock, Check, X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, SkipForward, MapPin } from 'lucide-react';
import { cn } from '../../utils/cn';
import { doseLogService, medicationService } from '../../services/api';
import { 
    getTodayKeyInDhaka, 
    formatTime12hInDhaka, 
    getCurrentTimeInDhaka,
    TIMEZONE 
} from '../../utils/timezone';

const Calendar = () => {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [currentView, setCurrentView] = useState('dayGridMonth');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adherenceStats, setAdherenceStats] = useState({ percentage: 0, taken: 0, skipped: 0, missed: 0, total: 0 });

    useEffect(() => {
        fetchCalendarData();
    }, []);

    const fetchCalendarData = async () => {
        setLoading(true);
        try {
            // Get date range for past 30 days and next 30 days (using Dhaka timezone)
            const today = getTodayKeyInDhaka();
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            
            // Fetch medications and dose logs
            const [medsResponse, logsResponse] = await Promise.all([
                medicationService.getAll().catch(() => ({ success: false, data: [] })),
                doseLogService.getRange(startDate, endDate).catch(() => ({ success: false, data: [] }))
            ]);

            const calendarEvents = [];
            let takenCount = 0;
            let skippedCount = 0;
            let missedCount = 0;
            let totalCount = 0;

            // Add dose log events
            const logs = logsResponse.success ? (Array.isArray(logsResponse.data) ? logsResponse.data : []) : [];
            logs.forEach(log => {
                const statusColor = log.status === 'TAKEN' ? '#10B981' : 
                                   log.status === 'MISSED' ? '#EF4444' : 
                                   log.status === 'SKIPPED' ? '#F59E0B' : '#94A3B8';
                
                if (log.status === 'TAKEN') takenCount++;
                if (log.status === 'SKIPPED') skippedCount++;
                if (log.status === 'MISSED') missedCount++;
                totalCount++;
                
                calendarEvents.push({
                    id: `log-${log.id}`,
                    title: log.medicationName || 'Medication',
                    start: log.scheduledTime || log.takenTime,
                    backgroundColor: statusColor,
                    borderColor: statusColor,
                    extendedProps: {
                        status: log.status?.toLowerCase() || 'scheduled',
                        dose: log.dosage || '',
                        type: log.medicationType || 'Medication',
                        logId: log.id
                    }
                });
            });

            // Add upcoming scheduled doses from medications with reminders
            const meds = medsResponse.success ? (Array.isArray(medsResponse.data) ? medsResponse.data : []) : [];
            const { hours: currentHour, minutes: currentMin } = getCurrentTimeInDhaka();
            const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
            
            meds.filter(m => m.status === 'ACTIVE' && m.isActive).forEach(med => {
                // Use reminderTimes from medication
                const reminderTimes = med.reminderTimes || [];
                if (reminderTimes.length === 0) return;
                
                for (let i = 0; i < 30; i++) {
                    const date = new Date();
                    date.setDate(date.getDate() + i);
                    const dateStr = date.toLocaleDateString('en-CA', { timeZone: TIMEZONE });
                    
                    reminderTimes.forEach((time, idx) => {
                        // Skip past times for today
                        if (dateStr === today && time <= currentTimeStr) return;
                        
                        // Check if this dose already has a log
                        const hasLog = logs.some(log => {
                            const logDate = log.scheduledTime?.substring(0, 10);
                            const logTime = log.scheduledTime?.substring(11, 16);
                            return logDate === dateStr && logTime === time && log.medicationId === med.id;
                        });
                        
                        if (!hasLog) {
                            calendarEvents.push({
                                id: `sched-${med.id}-${dateStr}-${idx}`,
                                title: med.name,
                                start: `${dateStr}T${time}:00`,
                                backgroundColor: '#3B82F6',
                                borderColor: '#3B82F6',
                                extendedProps: {
                                    status: 'upcoming',
                                    dose: med.strength,
                                    type: med.type || 'Medication',
                                    medicationId: med.id
                                }
                            });
                        }
                    });
                }
            });

            // Calculate adherence
            const adherencePercentage = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100;
            setAdherenceStats({
                percentage: adherencePercentage,
                taken: takenCount,
                skipped: skippedCount,
                missed: missedCount,
                total: totalCount
            });

            setEvents(calendarEvents);
        } catch (error) {
            console.error('Failed to fetch calendar data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkTaken = async (event) => {
        try {
            if (event.logId) {
                await doseLogService.markAsTaken(event.logId);
            } else if (event.medicationId) {
                // For upcoming/scheduled doses that don't have a log yet
                // Format time as ISO string for the backend
                const scheduledTime = event.time instanceof Date 
                    ? event.time.toISOString() 
                    : event.time;
                await doseLogService.log({
                    medicationId: event.medicationId,
                    scheduledTime: scheduledTime,
                    status: 'TAKEN',
                    notes: 'Taken by user'
                });
            }
            fetchCalendarData();
            setSelectedEvent(null);
        } catch (error) {
            console.error('Failed to mark dose as taken:', error);
        }
    };

    const handleMarkSkipped = async (event) => {
        try {
            if (event.logId) {
                await doseLogService.markAsSkipped(event.logId, 'Skipped by user');
            } else if (event.medicationId) {
                // For upcoming/scheduled doses that don't have a log yet
                const scheduledTime = event.time instanceof Date 
                    ? event.time.toISOString() 
                    : event.time;
                await doseLogService.log({
                    medicationId: event.medicationId,
                    scheduledTime: scheduledTime,
                    status: 'SKIPPED',
                    notes: 'Skipped by user'
                });
            }
            fetchCalendarData();
            setSelectedEvent(null);
        } catch (error) {
            console.error('Failed to mark dose as skipped:', error);
        }
    };

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

                                    {(selectedEvent.status === 'upcoming' || selectedEvent.status === 'scheduled') && (
                                        <div className="flex gap-2 pt-2">
                                            <Button size="sm" className="flex-1 gap-1" onClick={() => handleMarkTaken(selectedEvent)}>
                                                <Check size={14} /> Take
                                            </Button>
                                            <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => handleMarkSkipped(selectedEvent)}>
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
                        <CardContent className="p-6">
                            <div className="text-center mb-4">
                                <div className="text-4xl font-bold text-green-600 mb-1">{adherenceStats.percentage}%</div>
                                <div className="text-sm text-green-700 font-medium">Monthly Adherence</div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2 text-green-600">
                                        <Check size={14} /> Taken
                                    </span>
                                    <span className="font-bold">{adherenceStats.taken}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2 text-amber-600">
                                        <SkipForward size={14} /> Skipped
                                    </span>
                                    <span className="font-bold">{adherenceStats.skipped}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2 text-red-600">
                                        <X size={14} /> Missed
                                    </span>
                                    <span className="font-bold">{adherenceStats.missed}</span>
                                </div>
                                <div className="border-t pt-2 mt-2 flex justify-between items-center">
                                    <span className="text-slate-600">Total Doses</span>
                                    <span className="font-bold">{adherenceStats.total}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Timezone Info */}
                    <Card className="border-none shadow-sm bg-blue-50">
                        <CardContent className="p-4 flex items-center gap-2 text-sm text-blue-700">
                            <MapPin size={16} />
                            <span>Timezone: Dhaka, Bangladesh (UTC+6)</span>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Calendar;
