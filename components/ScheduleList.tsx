import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, MapPin, X, MinusCircle } from 'lucide-react';
import { ScheduleItem, AttendanceRecord, AttendanceStatus } from '../types';
import { Button } from './ui/Button';
import { GlassCard } from './ui/GlassCard';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

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

  const getWeekDates = () => {
    const dates: Date[] = [];
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - 3);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getStatusColor = (status?: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT: return 'border-l-emerald-500';
      case AttendanceStatus.ABSENT: return 'border-l-red-500';
      case AttendanceStatus.CANCELLED: return 'border-l-orange-400';
      default: return 'border-l-zinc-300 dark:border-l-zinc-600';
    }
  };

  const getStatusBadge = (status?: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-[10px] font-bold uppercase">Present</span>;
      case AttendanceStatus.ABSENT:
        return <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-500 text-[10px] font-bold uppercase">Absent</span>;
      case AttendanceStatus.CANCELLED:
        return <span className="px-2 py-0.5 rounded-full bg-orange-400/15 text-orange-400 text-[10px] font-bold uppercase">Cancelled</span>;
      default: return null;
    }
  };

  return (
    <GlassCard className="overflow-hidden bg-surface border-border h-full flex flex-col" noPadding>
      {/* Mobile: Horizontal Date Picker */}
      <div className="md:hidden border-b border-border shrink-0">
        <div className="flex items-center px-3 py-2.5 gap-1.5 overflow-x-auto scrollbar-hide">
          {weekDates.map((date) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === today.toDateString();
            const dayShort = days[date.getDay()].substring(0, 3);
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(new Date(date))}
                className={`flex flex-col items-center flex-1 min-w-[44px] py-2 rounded-xl transition-all ${isSelected
                  ? 'bg-primary text-background shadow-sm'
                  : isToday
                    ? 'bg-primary/10'
                    : 'active:bg-black/5 dark:active:bg-white/5'
                  }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wide ${isSelected ? 'text-background/80' : 'text-zinc-400'}`}>
                  {dayShort}
                </span>
                <span className={`text-base font-bold leading-tight ${isSelected ? 'text-background' : 'text-text'}`}>
                  {date.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop: Standard Date Navigation */}
      <div className="hidden md:flex items-center justify-between p-4 border-b border-border bg-zinc-50 dark:bg-white/20 shrink-0">
        <button onClick={() => changeDate(-1)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-text">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-0.5">Weekly Schedule</div>
          <motion.div
            key={selectedDate.toISOString()}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-bold text-text flex items-center gap-2"
          >
            <span>{currentDayName},</span>
            <span>{selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          </motion.div>
        </div>
        <button onClick={() => changeDate(1)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-text">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Class List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {todaysClasses.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 p-8">
            <div className="w-14 h-14 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-3">
              <Calendar className="h-6 w-6 opacity-30" />
            </div>
            <p className="font-semibold text-text text-sm">No classes today</p>
            <p className="text-xs opacity-50 mt-1">Enjoy your free time!</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            <AnimatePresence mode='popLayout'>
              {todaysClasses.map((item, index) => {
                const record = getRecordForClass(item.id);
                const status = record?.status;

                return (
                  <MobileClassCard
                    key={item.id}
                    item={item}
                    index={index}
                    status={status}
                    onStatusUpdate={handleStatusUpdate}
                    onDeleteRecord={onDeleteRecord}
                    selectedDate={selectedDate}
                    statusColor={getStatusColor(status)}
                    statusBadge={getStatusBadge(status)}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

interface ClassCardProps {
  item: ScheduleItem;
  index: number;
  status?: AttendanceStatus;
  onStatusUpdate: (item: ScheduleItem, status: AttendanceStatus) => void;
  onDeleteRecord?: (scheduleId: string, date: string) => void;
  selectedDate: Date;
  statusColor: string;
  statusBadge: React.ReactNode;
}

const MobileClassCard: React.FC<ClassCardProps> = ({
  item, index, status, onStatusUpdate, onDeleteRecord, selectedDate, statusColor, statusBadge
}) => {
  const [swipeX, setSwipeX] = useState(0);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 80;
    if (info.offset.x > threshold) {
      onStatusUpdate(item, AttendanceStatus.PRESENT);
    } else if (info.offset.x < -threshold) {
      onStatusUpdate(item, AttendanceStatus.ABSENT);
    }
    setSwipeX(0);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ type: "spring", stiffness: 200, damping: 25, delay: index * 0.03 }}
      className="relative overflow-hidden"
    >
      {/* Swipe background hints (mobile only) */}
      <div className="md:hidden absolute inset-0 flex items-center justify-between px-5 pointer-events-none">
        <div className={`flex items-center gap-2 text-emerald-500 font-semibold text-xs transition-opacity ${swipeX > 30 ? 'opacity-100' : 'opacity-0'}`}>
          <CheckCircle className="w-4 h-4" /> Present
        </div>
        <div className={`flex items-center gap-2 text-red-500 font-semibold text-xs transition-opacity ${swipeX < -30 ? 'opacity-100' : 'opacity-0'}`}>
          Absent <XCircle className="w-4 h-4" />
        </div>
      </div>

      {/* Card content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.25}
        onDrag={(_, info) => setSwipeX(info.offset.x)}
        onDragEnd={handleDragEnd}
        className={`relative bg-surface border-l-[3px] ${statusColor} px-4 py-3.5 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-4 active:bg-black/[0.02] dark:active:bg-white/[0.02] transition-colors touch-pan-y`}
      >
        {/* Info section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-[15px] md:text-lg font-semibold text-text truncate">{item.subject}</h4>
            {/* Mobile: Status badge inline */}
            <div className="md:hidden">{statusBadge}</div>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {item.startTime} – {item.endTime}
            </span>
            {item.room && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {item.room}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 w-full md:w-auto">
          <div className="grid grid-cols-3 gap-1.5 flex-1 md:flex md:flex-none md:gap-2">
            <button
              onClick={() => onStatusUpdate(item, AttendanceStatus.PRESENT)}
              className={`flex items-center justify-center gap-1.5 min-h-[40px] md:min-h-0 md:px-3 md:py-1.5 rounded-lg text-xs font-medium transition-all
                ${status === AttendanceStatus.PRESENT
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-black/[0.04] dark:bg-white/[0.06] text-zinc-500 active:bg-emerald-500/20'
                }`}
            >
              <CheckCircle className="h-4 w-4" />
              <span className="hidden md:inline">Present</span>
            </button>

            <button
              onClick={() => onStatusUpdate(item, AttendanceStatus.ABSENT)}
              className={`flex items-center justify-center gap-1.5 min-h-[40px] md:min-h-0 md:px-3 md:py-1.5 rounded-lg text-xs font-medium transition-all
                ${status === AttendanceStatus.ABSENT
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'bg-black/[0.04] dark:bg-white/[0.06] text-zinc-500 active:bg-red-500/20'
                }`}
            >
              <XCircle className="h-4 w-4" />
              <span className="hidden md:inline">Absent</span>
            </button>

            <button
              onClick={() => onStatusUpdate(item, AttendanceStatus.CANCELLED)}
              className={`flex items-center justify-center gap-1.5 min-h-[40px] md:min-h-0 md:px-3 md:py-1.5 rounded-lg text-xs font-medium transition-all
                ${status === AttendanceStatus.CANCELLED
                  ? 'bg-orange-400 text-white shadow-sm'
                  : 'bg-black/[0.04] dark:bg-white/[0.06] text-zinc-500 active:bg-orange-500/20'
                }`}
            >
              <MinusCircle className="h-4 w-4" />
              <span className="hidden md:inline">Cancel</span>
            </button>
          </div>

          {/* Reset */}
          {status && onDeleteRecord && (
            <button
              onClick={() => onDeleteRecord(item.id, selectedDate.toISOString().split('T')[0])}
              className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-zinc-400 active:text-red-500 active:bg-red-500/10 transition-colors md:ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};