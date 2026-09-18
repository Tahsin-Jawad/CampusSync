import type { CourseSlot } from '../types';

export interface FreeTimeSlot {
  day: CourseSlot['day'];
  startTime: string;
  endTime: string;
}

// Convert "09:00 AM" to minutes from midnight
function timeToMinutes(timeStr: string): number {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return 0;

  let [, hoursStr, minutesStr, modifier] = match;
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (modifier) {
    modifier = modifier.toUpperCase();
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
  }

  return hours * 60 + minutes;
}

// Convert minutes from midnight back to "09:00 AM"
function minutesToTime(totalMinutes: number): string {
  let hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const modifier = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12

  const strHours = hours < 10 ? `0${hours}` : `${hours}`;
  const strMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${strHours}:${strMinutes} ${modifier}`;
}

export function findCommonFreeTime(
  userSlots: CourseSlot[],
  friendSlots: CourseSlot[],
  day: CourseSlot['day']
): FreeTimeSlot[] {
  const campusStart = timeToMinutes('08:00 AM');
  const campusEnd = timeToMinutes('05:00 PM');

  const filterAndSortSlots = (slots: CourseSlot[]) => {
    return slots
      .filter((s) => s.day === day)
      .map((s) => ({
        start: timeToMinutes(s.startTime),
        end: timeToMinutes(s.endTime),
      }))
      .sort((a, b) => a.start - b.start);
  };

  const userBusy = filterAndSortSlots(userSlots);
  const friendBusy = filterAndSortSlots(friendSlots);

  const commonFreeSlots: FreeTimeSlot[] = [];

  // Check intervals in 30 min steps
  for (let time = campusStart; time < campusEnd; time += 30) {
    const slotEnd = time + 30;

    const isUserBusy = userBusy.some((b) => time < b.end && slotEnd > b.start);
    const isFriendBusy = friendBusy.some((b) => time < b.end && slotEnd > b.start);

    if (!isUserBusy && !isFriendBusy) {
      commonFreeSlots.push({
        day,
        startTime: minutesToTime(time),
        endTime: minutesToTime(slotEnd),
      });
    }
  }

  return commonFreeSlots;
}