import React, { useState, useMemo } from 'react';
import { UploadSchedule } from './components/UploadSchedule';
import { ScheduleList } from './components/ScheduleList';
import { AttendanceStats } from './components/AttendanceStats';
import { ScheduleItem, AttendanceRecord, AttendanceStatus, OverallStats } from './types';
import { useAuth } from './context/AuthContext';
import { Save, RefreshCw, Trash2 } from 'lucide-react';
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
        const updatedRecords = records.filter(r =>
            !(r.scheduleItemId === newRecord.scheduleItemId && r.date === newRecord.date)
        );
        const newRecordsList = [...updatedRecords, newRecord];

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
        <div className="h-full flex flex-col gap-4 md:gap-6 p-0 md:p-0 overflow-hidden">
            {/* Header Content */}
            <div className="flex items-center justify-between gap-4 shrink-0 px-1">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text tracking-tight">
                        Overview
                    </h1>
                    <p className="text-zinc-500 mt-0.5 text-sm md:text-base">
                        Hey, {user?.name.split(' ')[0]} 👋
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {isSaving && (
                        <span className="text-xs md:text-sm text-text flex items-center gap-1.5 bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-full">
                            <Save size={12} className="animate-pulse" /> Saving
                        </span>
                    )}
                    {hasSchedule && (
                        <button
                            onClick={handleReset}
                            className="p-2 text-red-500 hover:bg-red-500/10 active:bg-red-500/20 rounded-lg transition-colors"
                            title="Reset Data"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </div>

            {!hasSchedule ? (
                <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                    <div className="flex-1 flex flex-col items-center justify-center p-4">
                        <UploadSchedule onScheduleGenerated={handleScheduleGenerated} />
                    </div>
                </div>
            ) : (
                /* Mobile: single vertical scroll column. Desktop: 3-col grid */
                <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-3 gap-4 md:gap-6 overflow-y-auto lg:overflow-hidden pb-2 md:pb-0">
                    {/* Stats Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1 lg:h-full lg:overflow-y-auto pr-0 lg:pr-2 custom-scrollbar flex flex-col gap-4 shrink-0"
                    >
                        <AttendanceStats stats={stats} />
                    </motion.div>

                    {/* Weekly Schedule */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2 lg:h-full flex flex-col overflow-hidden min-h-[300px]"
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
