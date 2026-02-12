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
    const { user, schedule, records, updateSchedule, updateRecords, isDataLoading } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    const handleScheduleGenerated = async (newSchedule: ScheduleItem[]) => {
        setIsSaving(true);
        await updateSchedule(newSchedule);
        setIsSaving(false);
    };

    const handleRecordUpdate = async (newRecord: AttendanceRecord) => {
        // Optimistic update logic is now conceptually handled by assuming updateRecords persists
        // For smoother UX we might want to keep local optimistic logic or trust the Context update

        const updatedRecords = records.filter(r =>
            !(r.scheduleItemId === newRecord.scheduleItemId && r.date === newRecord.date)
        );
        const newRecordsList = [...updatedRecords, newRecord];

        // We don't need dedicated saving loading state here if context handles it, but let's keep isSaving for UI feedback
        // if context update is awaited.
        setIsSaving(true);
        await updateRecords(newRecordsList);
        setIsSaving(false);
    };

    const handleRecordDelete = async (scheduleId: string, date: string) => {
        const updatedRecords = records.filter(r =>
            !(r.scheduleItemId === scheduleId && r.date === date)
        );
        setIsSaving(true);
        await updateRecords(updatedRecords);
        setIsSaving(false);
    };

    const handleReset = async () => {
        if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
            setIsSaving(true);
            await updateSchedule([]);
            await updateRecords([]);
            setIsSaving(false);
        }
    };

    // Calculate stats
    const stats: OverallStats = useMemo(() => {
        // ... stats logic remains same ...
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

    if (isDataLoading && schedule.length === 0) {
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
                        <div className="flex-1 lg:overflow-y-auto lg:pr-2 custom-scrollbar h-full">
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
