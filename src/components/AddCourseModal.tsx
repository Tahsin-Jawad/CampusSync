import React, { useState, useEffect } from 'react';
import type { CourseSlot } from '../types';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSlot: (slot: CourseSlot) => void;
  initialData?: CourseSlot | null;
}

const DAYS: CourseSlot['day'][] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const AddCourseModal: React.FC<AddCourseModalProps> = ({ isOpen, onClose, onSaveSlot, initialData }) => {
  const [courseCode, setCourseCode] = useState('');
  const [day, setDay] = useState<CourseSlot['day']>('Sunday');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('10:20 AM');

  useEffect(() => {
    if (initialData) {
      setCourseCode(initialData.courseCode);
      setDay(initialData.day);
      setStartTime(initialData.startTime);
      setEndTime(initialData.endTime);
    } else {
      setCourseCode('');
      setDay('Sunday');
      setStartTime('09:00 AM');
      setEndTime('10:20 AM');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode) return;

    onSaveSlot({
      id: initialData ? initialData.id : `slot-${Date.now()}`,
      courseCode,
      courseTitle: courseCode,
      day,
      startTime,
      endTime,
    });

    onClose();
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box bg-base-100 max-w-md border border-base-300">
        <h3 className="font-bold text-lg mb-4">{initialData ? 'Edit Class Slot' : 'Add Course Slot Manually'}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold opacity-70 mb-1 block">Course Code</label>
            <input
              type="text"
              placeholder="e.g. CSE345"
              className="input input-bordered w-full text-sm"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold opacity-70 mb-1 block">Day</label>
            <select
              className="select select-bordered w-full text-sm"
              value={day}
              onChange={(e) => setDay(e.target.value as CourseSlot['day'])}
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold opacity-70 mb-1 block">Start Time</label>
              <input
                type="text"
                placeholder="e.g. 03:10 PM"
                className="input input-bordered w-full text-sm"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold opacity-70 mb-1 block">End Time</label>
              <input
                type="text"
                placeholder="e.g. 04:40 PM"
                className="input input-bordered w-full text-sm"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {initialData ? 'Update Slot' : 'Add Slot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};