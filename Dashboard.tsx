import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { UploadSchedule } from './components/UploadSchedule';
import { ScheduleList } from './components/ScheduleList';
import { AttendanceStats } from './components/AttendanceStats';
import { ScheduleItem, AttendanceRecord, AttendanceStatus, OverallStats } from './types';
import { useAuth } from './context/AuthContext';
import { Save, RefreshCw, Trash2 } from 'lucide-react';
import { GlassCard } from './components/ui/GlassCard';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Load data from Backend
    useEffect(() => {
        if (!user) return;

        fetch(`http://localhost:3001/api/data/${user.id}`)
            .then(res => res.json())
            .then(data => {
                setSchedule(data.schedule || []);
                setRecords(data.records || []);
            })
            .catch(err => console.error("Failed to load data", err))
            .finally(() => setIsLoading(false));
    }, [user]);

    // Save data to Backend
    const saveData = useCallback(async (newSchedule: ScheduleItem[], newRecords: AttendanceRecord[]) => {
        if (!user) return;
        setIsSaving(true);
        try {
            await fetch(`http://localhost:3001/api/data/${user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ schedule: newSchedule, records: newRecords }),
            });
        } catch (err) {
            console.error("Failed to save data", err);
        } finally {
            setIsSaving(false);
        }
    }, [user]);

    const handleScheduleGenerated = (newSchedule: ScheduleItem[]) => {
        setSchedule(newSchedule);
        saveData(newSchedule, records);
    };

    const handleRecordUpdate = (newRecord: AttendanceRecord) => {
        // Optimistic update
        const updatedRecords = records.filter(r =>
            !(r.scheduleItemId === newRecord.scheduleItemId && r.date === newRecord.date)
        );
        const newRecordsList = [...updatedRecords, newRecord];

        setRecords(newRecordsList);
        saveData(schedule, newRecordsList);
    };

    const handleRecordDelete = (scheduleId: string, date: string) => {
        const updatedRecords = records.filter(r =>
            !(r.scheduleItemId === scheduleId && r.date === date)
        );
        setRecords(updatedRecords);
        saveData(schedule, updatedRecords);
    };

    const handleReset = () => {
        if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
            setSchedule([]);
            setRecords([]);
            saveData([], []);
        }
    };

    // Calculate stats
    const stats: OverallStats = useMemo(() => {
        const activeClasses = records.filter(r => r.status !== AttendanceStatus.CANCELLED);
        const totalClasses = activeClasses.length;
        const cancelledClasses = records.filter(r => r.status === AttendanceStatus.CANCELLED).length;

        const attendedClasses = activeClasses.filter(r =>
            r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE
        ).length;

        const percentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

        return {
            totalClasses,
            attendedClasses,
            missedClasses: totalClasses - attendedClasses,
            cancelledClasses,
            percentage
        };
    }, [records]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
                <RefreshCw className="w-8 h-8 animate-spin mb-4" />
                <p className="font-medium animate-pulse text-zinc-400">Syncing your data...</p>
            </div>
        );
    }

    const hasSchedule = schedule.length > 0;

    return (
        <div className="h-full flex flex-col gap-6 p-2 md:p-0 overflow-hidden">
            {/* Header Content */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-text tracking-tight">
                        Overview
                    </h1>
                    <p className="text-zinc-500 mt-1">
                        Here's what's happening today, {user?.name.split(' ')[0]}.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {isSaving && (
                        <span className="text-sm text-text flex items-center gap-2 bg-black/5 dark:bg-white/10 px-3 py-1 rounded-full">
                            <Save size={14} className="animate-pulse" /> Saving...
                        </span>
                    )}
                    {hasSchedule && (
                        <button
                            onClick={handleReset}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Reset Data"
                        >
                            <Trash2 size={20} />
                        </button>
                    )}
                </div>
            </div>

            {!hasSchedule ? (
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
                        <UploadSchedule onScheduleGenerated={handleScheduleGenerated} />
                    </div>
                </div>
            ) : (
                <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6 pb-4 md:pb-0 overflow-y-auto lg:overflow-hidden">
                    {/* Stats Section - Takes 1 column on large screens */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1 h-auto lg:h-full lg:overflow-y-auto pr-0 lg:pr-2 custom-scrollbar flex flex-col gap-4"
                    >
                        <AttendanceStats stats={stats} />
                    </motion.div>

                    {/* Weekly Schedule - Takes 2 columns on large screens */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2 h-auto lg:h-full flex flex-col overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-4 shrink-0">
                            <h2 className="text-xl font-bold text-text">Weekly Schedule</h2>
                        </div>
                        <div className="flex-1 lg:overflow-y-auto lg:pr-2 custom-scrollbar">
                            <ScheduleList
                                schedule={schedule}
                                records={records}
                                onUpdateRecord={handleRecordUpdate}
                                onDeleteRecord={handleRecordDelete}
                            />
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

function CalendarIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    )
}
