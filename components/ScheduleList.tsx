import React, { useState, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, MapPin, X, MinusCircle } from 'lucide-react';
import { ScheduleItem, AttendanceRecord, AttendanceStatus } from '../types';
import { Button } from './ui/Button';
import { GlassCard } from './ui/GlassCard';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';

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

  // Generate a week of dates for the horizontal picker
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

  return (
    <GlassCard className="overflow-hidden bg-surface border-border h-full flex flex-col" noPadding>
      {/* Mobile: Horizontal Date Picker */}
      <div className="md:hidden border-b border-border shrink-0">
        <div className="flex items-center gap-1 px-2 py-3 overflow-x-auto scrollbar-hide">
          {weekDates.map((date) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === today.toDateString();
            const dayShort = days[date.getDay()].substring(0, 3);
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(new Date(date))}
                className={`flex flex-col items-center min-w-[48px] py-2 px-2 rounded-xl transition-all ${isSelected
                  ? 'bg-primary text-background shadow-md'
                  : isToday
                    ? 'bg-primary/10 text-primary'
                    : 'text-zinc-500 active:bg-black/5 dark:active:bg-white/5'
                  }`}
              >
                <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-background/70' : ''}`}>
                  {dayShort}
                </span>
                <span className={`text-lg font-bold mt-0.5 ${isSelected ? 'text-background' : 'text-text'}`}>
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
      <div className="divide-y divide-border flex-1 overflow-y-auto custom-scrollbar">
        {todaysClasses.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 p-6">
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
                <SwipeableClassCard
                  key={item.id}
                  item={item}
                  index={index}
                  status={status}
                  onStatusUpdate={handleStatusUpdate}
                  onDeleteRecord={onDeleteRecord}
                  selectedDate={selectedDate}
                  statusColor={getStatusColor(status)}
                />
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </GlassCard>
  );
};

// Swipeable card for mobile, regular card for desktop
interface SwipeableCardProps {
  item: ScheduleItem;
  index: number;
  status?: AttendanceStatus;
  onStatusUpdate: (item: ScheduleItem, status: AttendanceStatus) => void;
  onDeleteRecord?: (scheduleId: string, date: string) => void;
  selectedDate: Date;
  statusColor: string;
}

const SwipeableClassCard: React.FC<SwipeableCardProps> = ({
  item, index, status, onStatusUpdate, onDeleteRecord, selectedDate, statusColor
}) => {
  const x = useMotionValue(0);
  const [swiping, setSwiping] = useState(false);

  // Color indicators during swipe
  const bgRight = useTransform(x, [0, 100], ['rgba(16,185,129,0)', 'rgba(16,185,129,0.15)']);
  const bgLeft = useTransform(x, [-100, 0], ['rgba(239,68,68,0.15)', 'rgba(239,68,68,0)']);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 80;
    if (info.offset.x > threshold) {
      onStatusUpdate(item, AttendanceStatus.PRESENT);
    } else if (info.offset.x < -threshold) {
      onStatusUpdate(item, AttendanceStatus.ABSENT);
    }
    setSwiping(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ type: "spring", stiffness: 120, damping: 20, delay: index * 0.05 }}
      className="relative overflow-hidden"
    >
      {/* Swipe background indicators (mobile only) */}
      <motion.div
        className="md:hidden absolute inset-0 flex items-center justify-between px-6 pointer-events-none"
        style={{ background: swiping ? undefined : 'transparent' }}
      >
        <motion.div style={{ opacity: useTransform(x, [-100, -40], [1, 0]) }} className="flex items-center gap-2 text-red-500 font-semibold text-sm">
          <XCircle className="w-5 h-5" /> Absent
        </motion.div>
        <motion.div style={{ opacity: useTransform(x, [40, 100], [0, 1]) }} className="flex items-center gap-2 text-emerald-500 font-semibold text-sm">
          Present <CheckCircle className="w-5 h-5" />
        </motion.div>
      </motion.div>

      {/* Card content */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragStart={() => setSwiping(true)}
        onDragEnd={handleDragEnd}
        className={`relative bg-surface border-l-4 ${statusColor} p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 group hover:bg-black/5 dark:hover:bg-white/5 transition-colors touch-pan-y`}
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
          <h4 className="text-base md:text-lg font-semibold text-text truncate pr-2">{item.subject}</h4>

          {/* Mobile: Swipe hint */}
          {!status && (
            <p className="md:hidden text-[10px] text-zinc-400 mt-1 font-medium">← Swipe to mark →</p>
          )}
        </div>

        {/* Status Buttons */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto z-10">
          <div className="grid grid-cols-3 md:flex gap-2 flex-1 md:flex-none">
            <Button
              size="sm"
              variant={status === AttendanceStatus.PRESENT ? 'primary' : 'secondary'}
              onClick={() => onStatusUpdate(item, AttendanceStatus.PRESENT)}
              className="justify-center flex-1 md:flex-none min-h-[44px] md:min-h-0 min-w-[32px]"
              title="Present"
            >
              <CheckCircle className={`h-4 w-4 md:mr-2 ${status === AttendanceStatus.PRESENT ? 'text-background' : 'text-zinc-500'}`} />
              <span className="hidden md:inline">Present</span>
            </Button>

            <Button
              size="sm"
              variant={status === AttendanceStatus.ABSENT ? 'danger' : 'secondary'}
              onClick={() => onStatusUpdate(item, AttendanceStatus.ABSENT)}
              className="justify-center flex-1 md:flex-none min-h-[44px] md:min-h-0 min-w-[32px]"
              title="Absent"
            >
              <XCircle className={`h-4 w-4 md:mr-2 ${status === AttendanceStatus.ABSENT ? 'text-red-500' : 'text-zinc-500'}`} />
              <span className="hidden md:inline">Absent</span>
            </Button>

            <Button
              size="sm"
              variant={status === AttendanceStatus.CANCELLED ? 'outline' : 'secondary'}
              onClick={() => onStatusUpdate(item, AttendanceStatus.CANCELLED)}
              className={`justify-center flex-1 md:flex-none min-h-[44px] md:min-h-0 min-w-[32px] ${status === AttendanceStatus.CANCELLED ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}
              title="Cancelled"
            >
              <MinusCircle className={`h-4 w-4 md:mr-2 ${status === AttendanceStatus.CANCELLED ? 'text-orange-500' : 'text-zinc-500'}`} />
              <span className="hidden md:inline">Cancelled</span>
            </Button>
          </div>

          {/* Reset Button */}
          {status && onDeleteRecord && (
            <div className="flex justify-end mt-1 md:mt-0 md:ml-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDeleteRecord(item.id, selectedDate.toISOString().split('T')[0])}
                className="px-2 min-h-[44px] md:min-h-0 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                title="Reset / Clear Status"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};