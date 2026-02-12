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
  group?: string; // e.g., "A", "Batch 1"
  weekPattern?: string; // e.g., "odd", "even", "week 1-5"
}

export interface AmbiguityQuestion {
  id: string;
  text: string; // "I see both Group A and Group B..."
  options: string[]; // ["Group A", "Group B"]
  key: keyof ScheduleItem; // The field this question resolves (e.g., 'group')
}

export interface ParsedScheduleResponse {
  schedule: ScheduleItem[];
  questions: AmbiguityQuestion[];
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
  cancelledClasses: number;
}