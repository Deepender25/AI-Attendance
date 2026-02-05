import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { UploadSchedule } from './components/UploadSchedule';
import { ScheduleList } from './components/ScheduleList';
import { AttendanceStats } from './components/AttendanceStats';
import { ScheduleItem, AttendanceRecord, AttendanceStatus, OverallStats } from './types';
import * as storage from './utils/storage';

const App: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadedSchedule = storage.getSchedule();
    const loadedRecords = storage.getRecords();
    setSchedule(loadedSchedule);
    setRecords(loadedRecords);
    setIsLoading(false);
  }, []);

  const handleScheduleGenerated = (newSchedule: ScheduleItem[]) => {
    setSchedule(newSchedule);
    storage.saveSchedule(newSchedule);
  };

  const handleRecordUpdate = (newRecord: AttendanceRecord) => {
    setRecords(prev => {
      // Remove existing record for this specific class on this date if exists
      const filtered = prev.filter(r => 
        !(r.scheduleItemId === newRecord.scheduleItemId && r.date === newRecord.date)
      );
      const updated = [...filtered, newRecord];
      storage.saveRecords(updated);
      return updated;
    });
  };

  const handleReset = () => {
    storage.clearAllData();
    setSchedule([]);
    setRecords([]);
  };

  // Calculate stats
  const stats: OverallStats = useMemo(() => {
    const totalClasses = records.filter(r => r.status !== AttendanceStatus.CANCELLED).length;
    const attendedClasses = records.filter(r => 
      r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE
    ).length;
    
    // Simple percentage. 
    // Note: This calculates percentage based on *recorded* classes.
    // Ideally, you might want to calculate based on *past potential* classes, but that requires complex date logic.
    // For this MVP, we calculate based on user input.
    
    const percentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 100;

    return {
      totalClasses,
      attendedClasses,
      missedClasses: totalClasses - attendedClasses,
      percentage
    };
  }, [records]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50 text-indigo-600">Loading AttendAI...</div>;
  }

  const hasSchedule = schedule.length > 0;

  return (
    <Layout onReset={handleReset} hasSchedule={hasSchedule}>
      {!hasSchedule ? (
        <UploadSchedule onScheduleGenerated={handleScheduleGenerated} />
      ) : (
        <div className="animate-fade-in">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-500">Track your progress and stay on top of your classes.</p>
          </div>
          
          <AttendanceStats stats={stats} />
          
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Weekly Sheet</h3>
          </div>
          
          <ScheduleList 
            schedule={schedule}
            records={records}
            onUpdateRecord={handleRecordUpdate}
          />
        </div>
      )}
    </Layout>
  );
};

export default App;