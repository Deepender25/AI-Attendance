import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, MapPin } from 'lucide-react';
import { ScheduleItem, AttendanceRecord, AttendanceStatus } from '../types';
import { Button } from './ui/Button';

interface ScheduleListProps {
  schedule: ScheduleItem[];
  records: AttendanceRecord[];
  onUpdateRecord: (record: AttendanceRecord) => void;
}

export const ScheduleList: React.FC<ScheduleListProps> = ({ schedule, records, onUpdateRecord }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Format selected date to match schedule days
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayName = days[selectedDate.getDay()];
  
  // Filter classes for the selected day
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Date Navigation */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-gray-50">
        <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-200 rounded-full transition-colors active:bg-gray-300">
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
        </button>
        <div className="text-center">
          <div className="text-xs sm:text-sm text-gray-500 uppercase font-semibold">{currentDayName}</div>
          <div className="text-base sm:text-lg font-bold text-gray-900">
            {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            <span className="hidden sm:inline">, {selectedDate.getFullYear()}</span>
          </div>
        </div>
        <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-200 rounded-full transition-colors active:bg-gray-300">
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
        </button>
      </div>

      {/* Class List */}
      <div className="divide-y divide-gray-100">
        {todaysClasses.length === 0 ? (
          <div className="py-16 px-6 text-center text-gray-400 flex flex-col items-center">
            <Calendar className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm sm:text-base">No classes scheduled for this day.</p>
          </div>
        ) : (
          todaysClasses.map((item) => {
            const record = getRecordForClass(item.id);
            const status = record?.status;

            return (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 mb-1 gap-y-1">
                    <div className="flex items-center mr-4">
                      <Clock className="h-3.5 w-3.5 mr-1.5" />
                      {item.startTime} - {item.endTime}
                    </div>
                    {item.room && (
                      <div className="flex items-center bg-gray-100 px-2 py-0.5 rounded text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {item.room}
                      </div>
                    )}
                  </div>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 truncate pr-2">{item.subject}</h4>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="grid grid-cols-2 gap-2 flex-1 sm:flex-none">
                    <Button 
                      variant={status === AttendanceStatus.PRESENT ? 'primary' : 'secondary'}
                      onClick={() => handleStatusUpdate(item, AttendanceStatus.PRESENT)}
                      className={`justify-center ${status === AttendanceStatus.PRESENT ? "bg-green-600 hover:bg-green-700" : ""}`}
                      title="Mark Present"
                    >
                      <CheckCircle className={`h-4 w-4 sm:h-5 sm:w-5 ${status === AttendanceStatus.PRESENT ? 'text-white' : 'text-green-600'}`} />
                      <span className="ml-2">Present</span>
                    </Button>
                    
                    <Button 
                      variant={status === AttendanceStatus.ABSENT ? 'danger' : 'secondary'}
                      onClick={() => handleStatusUpdate(item, AttendanceStatus.ABSENT)}
                      className={`justify-center ${status === AttendanceStatus.ABSENT ? "" : "text-red-600"}`}
                      title="Mark Absent"
                    >
                      <XCircle className={`h-4 w-4 sm:h-5 sm:w-5 ${status === AttendanceStatus.ABSENT ? 'text-white' : 'text-red-600'}`} />
                      <span className="ml-2">Absent</span>
                    </Button>
                  </div>

                  <Button
                     variant='ghost'
                     onClick={() => handleStatusUpdate(item, AttendanceStatus.CANCELLED)}
                     className={`text-xs px-2 min-w-[2.5rem] ${status === AttendanceStatus.CANCELLED ? 'bg-gray-200' : ''}`}
                     title="Mark Cancelled"
                  >
                     <span className="hidden sm:inline">Cancelled</span>
                     <span className="sm:hidden">❌</span>
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};