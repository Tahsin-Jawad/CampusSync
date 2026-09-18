import React from 'react';
import { Pencil, Trash2, Clock } from 'lucide-react';
import type { CourseSlot } from '../types';

interface RoutineTableProps {
  slots: CourseSlot[];
  onEditSlot: (slot: CourseSlot) => void;
  onDeleteSlot: (id: string) => void;
}

const DAYS: CourseSlot['day'][] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const RoutineTable: React.FC<RoutineTableProps> = ({ slots, onEditSlot, onDeleteSlot }) => {
  if (!slots || slots.length === 0) {
    return (
      <div className="text-center py-12 bg-base-200/50 rounded-2xl border border-dashed border-base-300">
        <p className="text-base font-medium opacity-70">No classes found in your schedule yet.</p>
        <p className="text-xs opacity-50 mt-1">Add slots manually above to build your schedule.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Your Class Schedule</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DAYS.map((day) => {
          const daySlots = slots.filter((s) => s.day === day);
          if (daySlots.length === 0) return null;

          return (
            <div key={day} className="card bg-base-200 border border-base-300 shadow-sm overflow-hidden">
              <div className="bg-primary/10 px-4 py-2 border-b border-base-300 flex justify-between items-center">
                <span className="font-bold text-primary">{day}</span>
                <span className="badge badge-sm badge-neutral">{daySlots.length} classes</span>
              </div>
              <div className="p-3 space-y-2">
                {daySlots.map((slot) => (
                  <div key={slot.id} className="bg-base-100 p-3 rounded-xl border border-base-300 flex justify-between items-center">
                    <div className="space-y-1">
                      <span className="font-bold text-base text-primary block">{slot.courseCode}</span>
                      <p className="text-xs font-medium opacity-75 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-secondary" /> {slot.startTime} - {slot.endTime}
                      </p>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => onEditSlot(slot)}
                        className="btn btn-ghost btn-xs btn-square text-info hover:bg-info/10"
                        title="Edit slot"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteSlot(slot.id)}
                        className="btn btn-ghost btn-xs btn-square text-error hover:bg-error/10"
                        title="Delete slot"
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