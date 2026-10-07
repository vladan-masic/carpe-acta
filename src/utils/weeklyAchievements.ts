import type { CalendarDay } from "./progress";
export type WeeklyAchievement = { week: string; target: number; timezone: string; achievedAt: string };
export const weeklyAchievementPrefix = "carpe-acta-week-achievement-v1:";
export function weekKey(now = new Date()) {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() + 6) % 7);
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
}
export function readGuestAchievements(): WeeklyAchievement[] {
  const records: WeeklyAchievement[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(weeklyAchievementPrefix)) continue;
    const value = JSON.parse(localStorage.getItem(key) ?? "null") as WeeklyAchievement | null;
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value.week) || key !== weeklyAchievementPrefix + value.week ||
      !Number.isInteger(value.target) || value.target < 1 || value.target > 7 || typeof value.timezone !== "string" ||
      !Number.isFinite(Date.parse(value.achievedAt))) throw new Error("Unreadable weekly achievements");
    records.push(value);
  }
  return records.sort((a, b) => b.week.localeCompare(a.week));
}
// A record freezes the goal at first achievement. Only this week's Undo can
// revoke it; changing the chosen goal never alters an existing achievement.
export function syncGuestAchievements(target: number, days: CalendarDay[], now = new Date()) {
  const records = readGuestAchievements(); // Validate before writing anything.
  const week = weekKey(now);
  const current = records.find(record => record.week === week);
  const timezone = current?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const format = new Intl.DateTimeFormat("en", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" });
  const end = new Date(`${week}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 7);
  const endKey = end.toISOString().slice(0, 10);
  const activeDates = new Set<string>();
  for (const record of days.flatMap(day => day.records)) {
    const date = new Date(record.completedAt);
    if (!Number.isFinite(date.getTime()) || date > now) continue;
    const parts = format.formatToParts(date);
    const part = (type: string) => parts.find(value => value.type === type)?.value;
    const key = `${part("year")}-${part("month")}-${part("day")}`;
    if (key >= week && key < endKey) activeDates.add(key);
  }
  const active = activeDates.size;
  if (current && active < current.target) localStorage.removeItem(weeklyAchievementPrefix + week);
  else if (!current && target >= 1 && target <= 7 && active >= target) {
    const achievement: WeeklyAchievement = { week, target, timezone, achievedAt: now.toISOString() };
    localStorage.setItem(weeklyAchievementPrefix + week, JSON.stringify(achievement));
  }
  return readGuestAchievements();
}
