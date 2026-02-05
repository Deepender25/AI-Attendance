export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
  CANCELLED = 'CANCELLED'
}

export interface ScheduleItem {
  id: string;
  day: string; // "Monday", "Tuesday", etc.
  startTime: string;
  endTime: string;
  subject: string;
  room?: string;
}

export interface AttendanceRecord {
  id: string;
  scheduleItemId: string;
  date: string; // ISO Date string YYYY-MM-DD
  status: AttendanceStatus;
  timestamp: number;
}

export interface DailyStats {
  total: number;
  present: number;
  absent: number;
  late: number;
}

export interface OverallStats {
  percentage: number;
  totalClasses: number;
  attendedClasses: number; // Present + Late (maybe weighted)
  missedClasses: number;
}