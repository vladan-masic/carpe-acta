import { summarizeHelpfulTips, type HelpfulTip } from "./helpfulTips";
import type { TipCompletion } from "./completions";

export const recentCompletionLimit = 10;
export type CalendarDay = { future?: boolean; date: string; count: number; records: TipCompletion[] };
export type ProgressData = {
  calendar: CalendarDay[];
  days: { date: string; count: number }[];
  recent: TipCompletion[];
  helpful: HelpfulTip[];
};

// Calendar arithmetic uses the device's local timezone, including DST changes.
export function progressDays(now = new Date()) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6 + index);
    return { date: date.toISOString(), count: 0 };
  });
}
// Eleven complete Monday–Sunday weeks plus the current week through today.
export function calendarDays(now = new Date()): CalendarDay[] {
  const weekday = (now.getDay() + 6) % 7;
  return Array.from({ length: 78 + weekday }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - weekday - 77 + index);
    return { date: date.toISOString(), count: 0, records: [] };
  });
}

export function activityLevel(count: number) {
  return count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count < 5 ? 3 : 4;
}

export function summarizeProgress(records: TipCompletion[], now = new Date()): ProgressData {
  const days = progressDays(now);
  const unique = [...new Map(records.map((record) => [record.id, record])).values()]
    .filter((record) => Number.isFinite(Date.parse(record.completedAt)) && Date.parse(record.completedAt) <= now.getTime());
  unique.sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt) || a.id.localeCompare(b.id));
  const calendar = calendarDays(now);
  const byDate = new Map(calendar.map(day => [day.date, day]));
  for (const record of unique) {
    const date = new Date(record.completedAt);
    const midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
    const day = days.find((entry) => entry.date === midnight);
    if (day) day.count += 1;
    const calendarDay = byDate.get(midnight);
    if (calendarDay) { calendarDay.count += 1; calendarDay.records.push(record); }
  }
  const recent = unique.slice(0, recentCompletionLimit);
  return { days, calendar, recent, helpful: summarizeHelpfulTips(unique, now) };
}

export function yearStart(year: number) {
  const date = new Date(0);
  date.setFullYear(year, 0, 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function summarizeYear(records: TipCompletion[], year: number, now = new Date()): CalendarDay[] {
  const days: CalendarDay[] = [];
  for (let date = yearStart(year); date.getFullYear() === year; date.setDate(date.getDate() + 1)) {
    days.push({ date: date.toISOString(), count: 0, records: [], future: date.getTime() > now.getTime() });
  }
  const byDate = new Map(days.map(day => [day.date, day]));
  const unique = [...new Map(records.map(record => [record.id, record])).values()]
    .filter(record => Number.isFinite(Date.parse(record.completedAt)) && Date.parse(record.completedAt) <= now.getTime())
    .sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt) || a.id.localeCompare(b.id));
  for (const record of unique) {
    const date = new Date(record.completedAt);
    const day = byDate.get(new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString());
    if (day) { day.records.push(record); day.count++; }
  }
  return days;
}

export function weeklyActivity(days: ProgressData["days"], now = new Date()) {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() + 6) % 7);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index);
    const future = date.getTime() > now.getTime();
    return { date, future, active: !future && days.some(day => day.date === date.toISOString() && day.count > 0) };
  });
}
