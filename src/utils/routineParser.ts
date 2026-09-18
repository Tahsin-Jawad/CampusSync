import * as XLSX from 'xlsx';
import type { CourseSlot } from '../types';

const mapEwuDays = (dayCode: string): CourseSlot['day'][] => {
  const days: CourseSlot['day'][] = [];
  const code = dayCode.toUpperCase();

  if (code.includes('TR')) {
    days.push('Tuesday', 'Thursday');
  } else if (code.includes('MW')) {
    days.push('Monday', 'Wednesday');
  } else {
    for (const char of code) {
      if (char === 'M') days.push('Monday');
      if (char === 'T') days.push('Tuesday');
      if (char === 'W') days.push('Wednesday');
      if (char === 'R') days.push('Thursday');
      if (char === 'F') days.push('Friday');
      if (char === 'S') days.push('Sunday');
      if (char === 'A') days.push('Saturday');
    }
  }
  return days;
};

export const parseExcelRoutine = (arrayBuffer: ArrayBuffer): CourseSlot[] => {
  const slots: CourseSlot[] = [];
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });

  let lastCourseCode = '';

  rows.forEach((row, index) => {
    if (!row || row.length === 0) return;

    // Find course code and time strings in row
    let rowCourseCode = '';
    let rowTimeStr = '';

    row.forEach((cell) => {
      if (typeof cell === 'string') {
        const str = cell.trim();
        if (/^[A-Z]{2,4}\d{3,4}(\s*Lab)?$/i.test(str)) {
          rowCourseCode = str.toUpperCase();
        }
        if (/(\b[STMWRAF]{1,3}\b)?\s*\d{1,2}:\d{2}\s*(?:AM|PM)?\s*[-–to]\s*\d{1,2}:\d{2}\s*(?:AM|PM)?/i.test(str)) {
          rowTimeStr = str;
        }
      }
    });

    if (rowCourseCode) {
      lastCourseCode = rowCourseCode;
    }

    if (rowTimeStr) {
      const timeMatch = rowTimeStr.match(/(\b[STMWRAF]{1,3}\b)?\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*[-–to]\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
      if (timeMatch) {
        const dayCode = timeMatch[1] ? timeMatch[1].trim() : 'S';
        const startTime = timeMatch[2].trim();
        const endTime = timeMatch[3].trim();

        const days = mapEwuDays(dayCode);
        const currentCode = lastCourseCode || `COURSE-${index + 1}`;

        days.forEach((day) => {
          slots.push({
            id: `parsed-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            courseCode: currentCode,
            courseTitle: currentCode,
            day,
            startTime,
            endTime,
          });
        });
      }
    }
  });

  return slots;
};

export const parseRoutineText = (text: string): CourseSlot[] => {
  const slots: CourseSlot[] = [];
  if (!text || !text.trim()) return slots;

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  let lastCourseCode = '';

  lines.forEach((line, index) => {
    const courseMatch = line.match(/([A-Z]{2,4}\d{3,4}(?:\s*Lab)?)/i);
    if (courseMatch) {
      lastCourseCode = courseMatch[1].toUpperCase().trim();
    }

    const timeMatch = line.match(/(\b[STMWRAF]{1,3}\b)?\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*[-–to]\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
    if (timeMatch) {
      const dayCode = timeMatch[1] ? timeMatch[1].trim() : 'S';
      const startTime = timeMatch[2].trim();
      const endTime = timeMatch[3].trim();

      const days = mapEwuDays(dayCode);
      const currentCode = lastCourseCode || `COURSE-${index + 1}`;

      days.forEach((day) => {
        slots.push({
          id: `parsed-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          courseCode: currentCode,
          courseTitle: currentCode,
          day,
          startTime,
          endTime,
        });
      });
    }
  });

  return slots;
};