import type { CourseSlot } from '../types';

export const parseRoutineText = (text: string): CourseSlot[] => {
  const slots: CourseSlot[] = [];
  if (!text || !text.trim()) return slots;

  const lines = text.split('\n');
  const dayRegex = /(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/i;
  const timeRegex = /(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*[-–to]\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i;

  let currentDay: CourseSlot['day'] = 'Sunday';

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const dayMatch = trimmed.match(dayRegex);
    if (dayMatch) {
      const matchedDay = dayMatch[1];
      currentDay = (matchedDay.charAt(0).toUpperCase() + matchedDay.slice(1).toLowerCase()) as CourseSlot['day'];
    }

    const timeMatch = trimmed.match(timeRegex);
    if (timeMatch) {
      const startTime = timeMatch[1].trim();
      const endTime = timeMatch[2].trim();

      // Extract course code (first word before day/time if possible)
      const words = trimmed.split(/\s+/);
      const courseCode = words.find(w => /^[A-Z]{2,4}\d{3,4}/i.test(w)) || `COURSE-${index + 1}`;

      slots.push({
        id: `parsed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        courseCode: courseCode.toUpperCase(),
        courseTitle: courseCode.toUpperCase(),
        day: currentDay,
        startTime,
        endTime,
      });
    }
  });

  return slots;
};