import React, { useState, useEffect } from 'react';
import { Users, Clock, Calendar } from 'lucide-react';
import type { CourseSlot } from '../types';
import { findCommonFreeTime } from '../utils/routineMatcher';
import { getAllFriendsRoutines, type FriendWithRoutine } from '../services/userService';

interface FriendScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSlots: CourseSlot[];
  currentUserId: string;
}

const DAYS: CourseSlot['day'][] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const FriendScheduleModal: React.FC<FriendScheduleModalProps> = ({ isOpen, onClose, userSlots, currentUserId }) => {
  const [friends, setFriends] = useState<FriendWithRoutine[]>([]);
  const [selectedFriendId, setSelectedFriendId] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<CourseSlot['day']>('Sunday');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentUserId) {
      loadFriends();
    }
  }, [isOpen, currentUserId]);

  const loadFriends = async () => {
    setLoading(true);
    const data = await getAllFriendsRoutines(currentUserId);
    setFriends(data);
    if (data.length > 0) {
      setSelectedFriendId(data[0].profile.id);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const selectedFriend = friends.find((f) => f.profile.id === selectedFriendId);
  const commonFreeTimes = selectedFriend ? findCommonFreeTime(userSlots, selectedFriend.slots, selectedDay) : [];

  return (
    <div className="modal modal-open">
      <div className="modal-box bg-base-100 max-w-2xl border border-base-300">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Friend Routine & Free Time Matcher
          </h3>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">✕</button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <span className="loading loading-spinner loading-md text-primary"></span>
            <p className="text-xs opacity-60 mt-2">Loading friends' routines...</p>
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center py-8 opacity-70">
            <p className="text-sm">No other registered users found yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div>
                <label className="text-xs font-semibold opacity-70 mb-1 block">Select Friend</label>
                <select
                  className="select select-bordered w-full text-sm"
                  value={selectedFriendId}
                  onChange={(e) => setSelectedFriendId(e.target.value)}
                >
                  {friends.map((f) => (
                    <option key={f.profile.id} value={f.profile.id}>
                      {f.profile.fullName} ({f.profile.campusStatus === 'ON_CAMPUS' ? '🟢 On Campus' : '⚪ Off Campus'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold opacity-70 mb-1 block">Select Day</label>
                <select
                  className="select select-bordered w-full text-sm"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value as CourseSlot['day'])}
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-success/10 border border-success/20 p-4 rounded-xl">
                <h4 className="font-bold text-sm text-success flex items-center gap-1.5 mb-2">
                  <Clock className="w-4 h-4" /> Common Free Time on {selectedDay}
                </h4>
                {commonFreeTimes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {commonFreeTimes.map((free, idx) => (
                      <span key={idx} className="badge badge-success badge-outline text-xs py-2 px-3 font-medium">
                        {free.startTime} - {free.endTime}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs opacity-75">No overlapping free time found on this day.</p>
                )}
              </div>

              <div>
                <h4 className="font-bold text-sm mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" /> {selectedFriend?.profile.fullName}'s Classes ({selectedDay})
                </h4>
                <div className="space-y-2">
                  {selectedFriend && selectedFriend.slots.filter((s) => s.day === selectedDay).length > 0 ? (
                    selectedFriend.slots
                      .filter((s) => s.day === selectedDay)
                      .map((slot) => (
                        <div key={slot.id} className="bg-base-200 p-3 rounded-xl border border-base-300 flex justify-between items-center text-sm">
                          <span className="font-bold text-primary">{slot.courseCode}</span>
                          <span className="opacity-80 text-xs font-medium">{slot.startTime} - {slot.endTime}</span>
                        </div>
                      ))
                  ) : (
                    <p className="text-xs opacity-60 italic">No classes scheduled on {selectedDay}.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        <div className="modal-action">
          <button onClick={onClose} className="btn btn-primary btn-sm">Close</button>
        </div>
      </div>
    </div>
  );
};