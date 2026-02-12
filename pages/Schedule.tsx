import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { ScheduleItem } from '../types';
import { UpsertClassModal } from '../components/UpsertClassModal';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Plus, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

// macOS Calendar consistent colors
// macOS Calendar consistent colors
const EVENT_COLORS = [
    { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-100' },
    { bg: 'bg-purple-500/20', border: 'border-purple-500/50', text: 'text-purple-100' },
    { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-100' },
    { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-100' },
    { bg: 'bg-pink-500/20', border: 'border-pink-500/50', text: 'text-pink-100' },
    { bg: 'bg-indigo-500/20', border: 'border-indigo-500/50', text: 'text-indigo-100' },
    { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-100' },
    { bg: 'bg-teal-500/20', border: 'border-teal-500/50', text: 'text-teal-100' },
];

const getSubjectColor = (subject: string) => {
    let hash = 0;
    for (let i = 0; i < subject.length; i++) {
        hash = subject.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % EVENT_COLORS.length;
    return EVENT_COLORS[index];
};

export const Schedule: React.FC = () => {
    const { schedule, updateSchedule } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ScheduleItem | undefined>(undefined);
    const [modalInitialState, setModalInitialState] = useState<Partial<ScheduleItem>>({});
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update current time indicator
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const handleAddClick = (day?: string, hour?: number) => {
        setSelectedItem(undefined);
        if (day && hour) {
            const timeStr = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
            setModalInitialState({ day, startTime: timeStr });
        } else {
            setModalInitialState({});
        }
        setIsModalOpen(true);
    };

    const handleEditClick = (item: ScheduleItem, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleSave = async (item: ScheduleItem) => {
        let newSchedule;
        if (selectedItem) {
            newSchedule = schedule.map(s => s.id === item.id ? item : s);
        } else {
            newSchedule = [...schedule, item];
        }
        await updateSchedule(newSchedule);
        setIsModalOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this class?')) {
            const newSchedule = schedule.filter(s => s.id !== id);
            await updateSchedule(newSchedule);
            setIsModalOpen(false);
        }
    };

    const getPositionStyle = (startTime: string, endTime: string) => {
        const parse = (t: string) => {
            const [time, modifier] = t.split(' ');
            let [h, m] = time.split(':').map(Number);
            if (h === 12 && modifier === 'AM') h = 0;
            if (modifier === 'PM' && h !== 12) h += 12;
            return h + m / 60;
        };

        const start = parse(startTime);
        const end = parse(endTime);
        const duration = end - start;
        const startOffset = start - 8; // Start from 8 AM

        return {
            top: `${startOffset * 64}px`, // 64px per hour height
            height: `${Math.max(duration * 64, 32)}px`, // Minimum height for visibility
        };
    };

    const getCurrentTimePosition = () => {
        const now = new Date();
        const hour = now.getHours();
        const minutes = now.getMinutes();
        const totalHours = hour + minutes / 60;

        if (totalHours < 8 || totalHours > 21) return null; // Outside view

        return (totalHours - 8) * 64;
    };

    const currentDayName = DAYS[new Date().getDay() - 1] || 'Sunday';
    const timePosition = getCurrentTimePosition();

    return (
        <div className="h-full flex flex-col gap-4 overflow-hidden">
            {/* Toolbar Header */}
            <div className="flex items-center justify-between shrink-0 px-1 py-1">
                <div>
                    <h1 className="text-2xl font-bold text-text tracking-tight flex items-center gap-3">
                        Schedule
                    </h1>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => handleAddClick()}
                        className="bg-primary/90 hover:bg-primary shadow-lg shadow-primary/20 transition-all rounded-full px-5"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Class
                    </Button>
                </div>
            </div>

            <GlassCard className="flex-1 overflow-hidden flex flex-col relative bg-surface/50 backdrop-blur-xl border-border/50 shadow-2xl" noPadding>
                {/* Calendar Header */}
                <div className="grid grid-cols-[60px_1fr] border-b border-white/5 bg-white/5 dark:bg-black/5 backdrop-blur-md shrink-0 z-20">
                    <div className="p-3 border-r border-white/5 flex items-end justify-center pb-2">
                        <span className="text-[10px] font-bold text-zinc-500">GMT+5:30</span>
                    </div>
                    <div className="grid grid-cols-7 divide-x divide-white/5">
                        {DAYS.map(day => {
                            const isToday = day === currentDayName;
                            return (
                                <div key={day} className={`p-3 flex flex-col items-center justify-center ${isToday ? 'bg-primary/5' : ''}`}>
                                    <span className={`text-xs font-semibold uppercase tracking-widest ${isToday ? 'text-primary' : 'text-zinc-500'}`}>
                                        {day.substring(0, 3)}
                                    </span>
                                    {isToday && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shadow-sm shadow-primary/50" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Grid Body */}
                <div className="overflow-y-auto flex-1 custom-scrollbar relative bg-background/30 px-1 pt-3">
                    <div className="grid grid-cols-[60px_1fr] min-h-[832px] relative">
                        {/* Time Column */}
                        <div className="border-r border-white/5 sticky left-0 z-10 bg-surface/95 backdrop-blur-sm">
                            {HOURS.map(hour => (
                                <div key={hour} className="h-16 relative">
                                    <span className="absolute -top-2.5 right-3 text-xs text-zinc-400 font-medium font-mono">
                                        {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                                    </span>
                                    <div className="absolute top-0 right-0 w-2 h-[1px] bg-zinc-700" />
                                </div>
                            ))}
                        </div>

                        {/* Days Columns */}
                        <div className="grid grid-cols-7 divide-x divide-white/5 relative">
                            {/* Horizontal Grid Lines */}
                            <div className="absolute inset-0 z-0 pointer-events-none flex flex-col">
                                {HOURS.map(h => (
                                    <div key={h} className="h-16 border-t border-dashed border-white/5 w-full" />
                                ))}
                            </div>

                            {/* Current Time Indicator Line */}
                            {timePosition !== null && (
                                <div
                                    className="absolute w-full z-10 pointer-events-none flex items-center"
                                    style={{ top: `${timePosition}px` }}
                                >
                                    <div className="w-full h-[2px] bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                                    <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 absolute left-0" />
                                </div>
                            )}

                            {DAYS.map(day => (
                                <div key={day} className="relative h-full group">
                                    {/* Interaction Layers */}
                                    {HOURS.map(h => (
                                        <div
                                            key={h}
                                            className="h-16 w-full absolute z-[1] cursor-cell hover:bg-white/5 transition-colors"
                                            style={{ top: `${(h - 8) * 64}px` }}
                                            onClick={() => handleAddClick(day, h)}
                                        />
                                    ))}

                                    {/* Events */}
                                    <AnimatePresence>
                                        {schedule
                                            .filter(s => s.day === day)
                                            .map(item => {
                                                const styles = getSubjectColor(item.subject);
                                                return (
                                                    <motion.div
                                                        key={item.id}
                                                        layoutId={item.id}
                                                        initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                                                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                        onClick={(e) => handleEditClick(item, e)}
                                                        className={`absolute left-[2px] right-[2px] rounded-lg border-l-4 p-2 cursor-pointer
                                                            ${styles.bg} ${styles.border} ${styles.text}
                                                            hover:brightness-110 hover:scale-[1.02] active:scale-98 transition-all z-20 shadow-sm
                                                            group/item overflow-hidden flex flex-col justify-start`}
                                                        style={getPositionStyle(item.startTime, item.endTime)}
                                                    >
                                                        <div className="font-bold text-sm truncate leading-tight mb-1 text-white antialiased drop-shadow-sm">
                                                            {item.subject}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs font-medium mb-0.5 opacity-90">
                                                            <Clock className="w-3.5 h-3.5 shrink-0" />
                                                            <span className="truncate">{item.startTime} - {item.endTime}</span>
                                                        </div>
                                                        {item.room && (
                                                            <div className="flex items-center gap-1.5 text-xs opacity-80">
                                                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                                                <span className="truncate">{item.room}</span>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                );
                                            })}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </GlassCard>

            <UpsertClassModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                onDelete={handleDelete}
                existingItem={selectedItem}
                initialItem={modalInitialState}
            />
        </div>
    );
};
