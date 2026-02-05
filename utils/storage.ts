import { ScheduleItem, AttendanceRecord } from '../types';

const SCHEDULE_KEY = 'attendai_schedule';
const RECORDS_KEY = 'attendai_records';

export const saveSchedule = (schedule: ScheduleItem[]): void => {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule));
};

export const getSchedule = (): ScheduleItem[] => {
  const data = localStorage.getItem(SCHEDULE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveRecords = (records: AttendanceRecord[]): void => {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
};

export const getRecords = (): AttendanceRecord[] => {
  const data = localStorage.getItem(RECORDS_KEY);
  return data ? JSON.parse(data) : [];
};

export const clearAllData = (): void => {
  localStorage.removeItem(SCHEDULE_KEY);
  localStorage.removeItem(RECORDS_KEY);
};