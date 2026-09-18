import React from 'react';
import { Pencil, Trash2, Calendar } from 'lucide-react';
import type { CourseSlot } from '../types';

interface RoutineTableProps {
  slots: CourseSlot[];
  onEditSlot: (slot: CourseSlot) => void;
  onDeleteSlot: (slotId: string) => void;
}

const DAYS: CourseSlot['day'][] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const RoutineTable: React.FC<RoutineTableProps> = ({ slots, onEditSlot, onDeleteSlot }) => {
  // Confirmation before delete
  const handleDeleteClick = (slotId: string, courseCode: string) => {
    if (window.confirm(`Are you sure you want to delete "${courseCode}" from your routine?`)) {
      onDeleteSlot(slotId);
    }
  };

  const slotsByDay = DAYS.reduce((acc, day) => {
    acc[day] = slots.filter((s) => s.day === day);
    return acc;
  }, {} as Record<CourseSlot['day'], CourseSlot[]>);

  if (slots.length === 0) {
    return (
      <div className="bg-base-200 p-8 rounded-2xl border border-base-300 text-center space-y-3">
        <Calendar className="w-10 h-10 opacity-30 mx-auto text-primary" />
        <h3 className="font-bold text-base">No Routine Added Yet</h3>
        <p className="text-xs opacity-60 max-w-sm mx-auto">
          Upload your EWU Advising Slip (Excel format) using the uploader above or add courses manually to build your weekly schedule.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="font-black text-lg flex items-center gap-2">
        <Calendar className="w-5 h-5 text-primary" /> Your Class Schedule
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {DAYS.map((day) => {
          const daySlots = slotsByDay[day];
          if (daySlots.length === 0) return null;

          return (
            <div key={day} className="bg-base-200 p-4 rounded-2xl border border-base-300 space-y-3 shadow-sm">
              <div className="flex justify-between items-center border-b border-base-300 pb-2">
                <span className="font-bold text-sm text-primary">{day}</span>
                <span className="badge badge-sm badge-ghost font-medium text-[11px]">{daySlots.length} classes</span>
              </div>

              <div className="space-y-2.5">
                {daySlots.map((slot) => (
                  <div key={slot.id} className="bg-base-100 p-3 rounded-xl border border-base-300 shadow-xs flex justify-between items-start gap-2">
                    <div className="space-y-1 overflow-hidden">
                      <span className="font-bold text-sm block tracking-wide text-base-content truncate">{slot.courseCode}</span>
                      <span className="text-xs opacity-75 block truncate">{slot.courseTitle}</span>
                      <div className="flex items-center gap-1.5 text-[11px] opacity-60 font-mono">
                        <span>⏰ {slot.startTime} - {slot.endTime}</span>
                        {slot.room && <span>• 📍 {slot.room}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onEditSlot(slot)}
                        className="btn btn-ghost btn-xs btn-square text-info hover:bg-info/10"
                        title="Edit Course"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(slot.id, slot.courseCode)}
                        className="btn btn-ghost btn-xs btn-square text-error hover:bg-error/10"
                        title="Delete Course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};