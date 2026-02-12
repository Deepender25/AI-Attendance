import React, { useState, useEffect } from 'react';
import { ScheduleItem } from '../types';
import { Button } from './ui/Button';
import { X, Trash2, Save, Clock, MapPin, Users, Calendar } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

interface UpsertClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: ScheduleItem) => void;
    onDelete?: (id: string) => void;
    initialItem?: Partial<ScheduleItem>;
    existingItem?: ScheduleItem;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const UpsertClassModal: React.FC<UpsertClassModalProps> = ({
    isOpen,
    onClose,
    onSave,
    onDelete,
    initialItem,
    existingItem
}) => {
    const [subject, setSubject] = useState('');
    const [day, setDay] = useState('Monday');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [room, setRoom] = useState('');
    const [group, setGroup] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (existingItem) {
                setSubject(existingItem.subject);
                setDay(existingItem.day);
                setStartTime(parseTime(existingItem.startTime));
                setEndTime(parseTime(existingItem.endTime));
                setRoom(existingItem.room || '');
                setGroup(existingItem.group || '');
            } else {
                setSubject('');
                setDay(initialItem?.day || 'Monday');
                setStartTime(initialItem?.startTime ? parseTime(initialItem.startTime) : '09:00');
                setEndTime(calculateEndTime(initialItem?.startTime ? parseTime(initialItem.startTime) : '09:00'));
                setRoom('');
                setGroup('');
            }
        }
    }, [isOpen, existingItem, initialItem]);

    // Format time from "9:00 AM" to "09:00" for input
    const parseTime = (timeStr: string) => {
        if (!timeStr) return '09:00';
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') hours = '00';
        if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12);
        return `${hours.padStart(2, '0')}:${minutes}`;
    };

    // Format time from "09:00" to "9:00 AM" for display/storage
    const formatTime = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':');
        let h = parseInt(hours, 10);
        const modifier = h >= 12 ? 'PM' : 'AM';
        if (h === 0) h = 12;
        if (h > 12) h -= 12;
        return `${h}:${minutes} ${modifier}`;
    };

    const calculateEndTime = (start: string) => {
        const [h, m] = start.split(':').map(Number);
        const endH = h + 1;
        return `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const handleSave = () => {
        if (!subject || !startTime || !endTime) return;

        const newItem: ScheduleItem = {
            id: existingItem?.id || Math.random().toString(36).substr(2, 9),
            subject,
            day,
            startTime: formatTime(startTime),
            endTime: formatTime(endTime),
            room,
            group
        };
        onSave(newItem);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-lg"
                >
                    <GlassCard className="bg-surface/90 border-white/10 shadow-2xl ring-1 ring-white/5 overflow-hidden" noPadding>
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">
                                    {existingItem ? 'Edit Class' : 'Add Class'}
                                </h2>
                                <p className="text-sm text-zinc-400 mt-0.5">Enter the details for this schedule block</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Subject Input */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-zinc-500 mb-2 ml-1 tracking-wider">Subject Title</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g. Mathematics"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-white placeholder-zinc-600 transition-all font-medium text-lg"
                                    autoFocus
                                />
                            </div>

                            {/* Time & Day Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold uppercase text-zinc-500 mb-2 ml-1 flex items-center gap-1.5 tracking-wider">
                                        <Calendar className="w-3.5 h-3.5" /> Day of Week
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {DAYS.map(d => (
                                            <button
                                                key={d}
                                                onClick={() => setDay(d)}
                                                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${day === d
                                                    ? 'bg-primary text-black shadow-lg shadow-primary/25 scale-[1.02]'
                                                    : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
                                                    }`}
                                            >
                                                {d.substring(0, 3)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-zinc-500 mb-2 ml-1 flex items-center gap-1.5 tracking-wider">
                                        <Clock className="w-3.5 h-3.5" /> Start Time
                                    </label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-zinc-500 mb-2 ml-1 flex items-center gap-1.5 tracking-wider">
                                        <Clock className="w-3.5 h-3.5" /> End Time
                                    </label>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white transition-all font-medium"
                                    />
                                </div>
                            </div>

                            {/* Location & Group Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-zinc-500 mb-2 ml-1 flex items-center gap-1.5 tracking-wider">
                                        <MapPin className="w-3.5 h-3.5" /> Room / Lab
                                    </label>
                                    <input
                                        type="text"
                                        value={room}
                                        onChange={(e) => setRoom(e.target.value)}
                                        placeholder="e.g. 101"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-zinc-600 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-zinc-500 mb-2 ml-1 flex items-center gap-1.5 tracking-wider">
                                        <Users className="w-3.5 h-3.5" /> Group / Batch
                                    </label>
                                    <input
                                        type="text"
                                        value={group}
                                        onChange={(e) => setGroup(e.target.value)}
                                        placeholder="e.g. G1"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-zinc-600 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 bg-black/10 flex gap-3">
                            {existingItem && onDelete && (
                                <Button
                                    variant="danger"
                                    onClick={() => onDelete(existingItem.id)}
                                    className="px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            )}
                            <div className="flex-1 flex gap-3 justify-end">
                                <Button
                                    variant="secondary"
                                    onClick={onClose}
                                    className="hover:bg-white/10 text-zinc-300"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    className="px-8 bg-primary hover:bg-primary/90 text-black shadow-lg shadow-primary/20"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
