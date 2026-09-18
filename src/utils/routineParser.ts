import type { CourseSlot } from '../types';

const MAP_DAY_CODES: Record<string, CourseSlot['day']> = {
  S: 'Sunday',
  M: 'Monday',
  T: 'Tuesday',
  W: 'Wednesday',
  R: 'Thursday',
  F: 'Friday',
  A: 'Saturday',
};

export function parseTimeAndDays(timeDayStr: string): { days: CourseSlot['day'][]; startTime: string; endTime: string } | null {
  if (!timeDayStr || typeof timeDayStr !== 'string') return null;

  const clean = timeDayStr.trim();
  const match = clean.match(/^([A-Za-z]+)\s+([\d:]+\s*(?:AM|PM|am|pm)?)\s*-\s*([\d:]+\s*(?:AM|PM|am|pm)?)$/i);

  if (!match) return null;

  const [, dayCode, start, end] = match;
  const days: CourseSlot['day'][] = [];

  for (const char of dayCode.toUpperCase()) {
    if (MAP_DAY_CODES[char]) {
      days.push(MAP_DAY_CODES[char]);
    }
  }

  return {
    days,
    startTime: start.toUpperCase(),
    endTime: end.toUpperCase(),
  };
}