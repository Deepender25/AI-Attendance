import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, MapPin, X, MinusCircle } from 'lucide-react';
import { ScheduleItem, AttendanceRecord, AttendanceStatus } from '../types';
import { Button } from './ui/Button';
import { GlassCard } from './ui/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

interface ScheduleListProps {
  schedule: ScheduleItem[];
  records: AttendanceRecord[];
  onUpdateRecord: (record: AttendanceRecord) => void;
  onDeleteRecord?: (scheduleId: string, date: string) => void;
}

export const ScheduleList: React.FC<ScheduleListProps> = ({ schedule, records, onUpdateRecord, onDeleteRecord }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayName = days[selectedDate.getDay()];

  const todaysClasses = schedule
    .filter(item => item.day.toLowerCase() === currentDayName.toLowerCase())
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const getRecordForClass = (scheduleId: string) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return records.find(r => r.scheduleItemId === scheduleId && r.date === dateStr);
  };

  const handleStatusUpdate = (scheduleItem: ScheduleItem, status: AttendanceStatus) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const existing = getRecordForClass(scheduleItem.id);

    const newRecord: AttendanceRecord = {
      id: existing ? existing.id : crypto.randomUUID(),
      scheduleItemId: scheduleItem.id,
      date: dateStr,
      status: status,
      timestamp: Date.now(),
    };
    onUpdateRecord(newRecord);
  };

  const changeDate = (daysToAdd: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + daysToAdd);
    setSelectedDate(newDate);
  };

  // Bold Black Minimalist Logic
  return (
    <GlassCard className="overflow-hidden bg-surface border-border" noPadding>
      {/* Date Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-zinc-50 dark:bg-black/20">
        <button onClick={() => changeDate(-1)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-text">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-0.5">{currentDayName}</div>
          <motion.div
            key={selectedDate.toISOString()}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-bold text-text"
          >
            {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            <span className="opacity-50 font-normal ml-1 hidden sm:inline">{selectedDate.getFullYear()}</span>
          </motion.div>
        </div>
        <button onClick={() => changeDate(1)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-text">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Class List */}
      <div className="divide-y divide-border">
        {todaysClasses.length === 0 ? (
          <div className="py-20 px-6 text-center text-zinc-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 opacity-30" />
            </div>
            <p className="font-medium">No classes scheduled</p>
            <p className="text-sm opacity-50">Enjoy your free time!</p>
          </div>
        ) : (
          <AnimatePresence mode='popLayout'>
            {todaysClasses.map((item, index) => {
              const record = getRecordForClass(item.id);
              const status = record?.status;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    mass: 1,
                    delay: index * 0.05
                  }}
                  key={item.id}
                  className="p-5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group relative overflow-hidden"
                >
                  <div className="flex-1 min-w-0 z-10">
                    <div className="flex flex-wrap items-center text-xs font-medium text-zinc-500 mb-1.5 gap-y-1">
                      <div className="flex items-center mr-4 px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-zinc-400">
                        <Clock className="h-3 w-3 mr-1.5" />
                        {item.startTime} - {item.endTime}
                      </div>
                      {item.room && (
                        <div className="flex items-center px-2 py-0.5">
                          <MapPin className="h-3 w-3 mr-1" />
                          {item.room}
                        </div>
                      )}
                    </div>
                    <h4 className="text-lg font-semibold text-text truncate pr-2">{item.subject}</h4>
                  </div>

                  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto z-10 mt-3 md:mt-0">
                    <div className="grid grid-cols-3 md:flex gap-2 flex-1 md:flex-none">
                      <Button
                        size="sm"
                        variant={status === AttendanceStatus.PRESENT ? 'primary' : 'secondary'}
                        onClick={() => handleStatusUpdate(item, AttendanceStatus.PRESENT)}
                        className={`justify-center flex-1 md:flex-none min-w-[32px]`}
                        title="Present"
                      >
                        <CheckCircle className={`h-4 w-4 md:mr-2 ${status === AttendanceStatus.PRESENT ? 'text-background' : 'text-zinc-500'}`} />
                        <span className="hidden md:inline">Present</span>
                      </Button>

                      <Button
                        size="sm"
                        variant={status === AttendanceStatus.ABSENT ? 'danger' : 'secondary'}
                        onClick={() => handleStatusUpdate(item, AttendanceStatus.ABSENT)}
                        className={`justify-center flex-1 md:flex-none min-w-[32px]`}
                        title="Absent"
                      >
                        <XCircle className={`h-4 w-4 md:mr-2 ${status === AttendanceStatus.ABSENT ? 'text-red-500' : 'text-zinc-500'}`} />
                        <span className="hidden md:inline">Absent</span>
                      </Button>

                      <Button
                        size="sm"
                        variant={status === AttendanceStatus.CANCELLED ? 'outline' : 'secondary'}
                        onClick={() => handleStatusUpdate(item, AttendanceStatus.CANCELLED)}
                        className={`justify-center flex-1 md:flex-none min-w-[32px] ${status === AttendanceStatus.CANCELLED ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}
                        title="Cancelled"
                      >
                        <MinusCircle className={`h-4 w-4 md:mr-2 ${status === AttendanceStatus.CANCELLED ? 'text-orange-500' : 'text-zinc-500'}`} />
                        <span className="hidden md:inline">Cancelled</span>
                      </Button>

                    </div>

                    {/* Reset Button - Moved outside the grid for visibility */}
                    {status && onDeleteRecord && (
                      <div className="flex justify-end mt-2 md:mt-0 md:ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteRecord(item.id, selectedDate.toISOString().split('T')[0])}
                          className="px-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Reset / Clear Status"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {/* Legacy button removed */}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </GlassCard >
  );
};