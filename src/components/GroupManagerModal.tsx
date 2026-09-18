import React, { useState, useEffect } from 'react';
import { Users, Plus, Clock, UserCheck, Copy, Check, UserX, Trash2 } from 'lucide-react';
import type { UserProfile, CourseSlot, Group, FriendLiveStatus } from '../types';
import { createGroup, getUserGroups, joinGroup, calculateLiveStatus, removeGroupMember } from '../services/groupService';
import { getAllFriendsRoutines } from '../services/userService';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface GroupManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  userSlots: CourseSlot[];
}

const DAYS: CourseSlot['day'][] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const GroupManagerModal: React.FC<GroupManagerModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('ALL');
  const [newGroupName, setNewGroupName] = useState('');
  const [joinGroupId, setJoinGroupId] = useState('');
  const [friendsData, setFriendsData] = useState<{ profile: UserProfile; slots: CourseSlot[] }[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const now = new Date();
  const dayName = DAYS[now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  useEffect(() => {
    if (isOpen && currentUser) {
      loadData();
    }
  }, [isOpen, currentUser]);

  const loadData = async () => {
    setLoading(true);
    const userGrps = await getUserGroups(currentUser.id);
    setGroups(userGrps);
    const friends = await getAllFriendsRoutines(currentUser.id);
    setFriendsData(friends);
    setLoading(false);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    const created = await createGroup(newGroupName, currentUser.id);
    setGroups([...groups, created]);
    setSelectedGroupId(created.id);
    setNewGroupName('');
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinGroupId.trim()) return;
    await joinGroup(joinGroupId.trim(), currentUser.id);
    await loadData();
    setSelectedGroupId(joinGroupId.trim());
    setJoinGroupId('');
  };

  const handleRemoveMember = async (memberId: string) => {
    if (selectedGroupId === 'ALL' || !currentGroup) return;
    const confirmMsg = memberId === currentUser.id 
      ? 'Are you sure you want to leave this group?' 
      : 'Are you sure you want to remove this member?';
    
    if (window.confirm(confirmMsg)) {
      await removeGroupMember(selectedGroupId, memberId);
      await loadData();
    }
  };

  // Super Admin delete any user from the platform
  const handleDeleteUserCompletely = async (userId: string, userName: string) => {
    if (window.confirm(`[ADMIN] Are you sure you want to completely delete user "${userName}" from CampusSync?`)) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        await loadData();
        alert('User deleted successfully.');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user.');
      }
    }
  };

  if (!isOpen) return null;

  const currentGroup = groups.find((g) => g.id === selectedGroupId);

  const ADMIN_EMAIL = 'jawadtahsinal@gmail.com';
  const isAdmin = currentUser.email === ADMIN_EMAIL;
  const isCreator = currentGroup?.createdById === currentUser.id;
  const canManageMembers = isAdmin || isCreator;

  const filteredFriends = friendsData.filter((f) => {
    if (selectedGroupId === 'ALL') return true;
    if (currentGroup) {
      return currentGroup.members.includes(f.profile.id);
    }
    return true;
  });

  const liveStatuses: FriendLiveStatus[] = filteredFriends.map((f) =>
    calculateLiveStatus(f.profile, f.slots, dayName, currentMinutes)
  );

  const campusFreeFriends = liveStatuses.filter(
    (s) => s.user.campusStatus === 'ON_CAMPUS' && s.isCurrentlyFree
  );

  return (
    <div className="modal modal-open">
      <div className="modal-box bg-base-100 max-w-3xl border border-base-300">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Friend Circles & Availability
          </h3>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">✕</button>
        </div>

        {/* Available On Campus Right Now */}
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl mb-6">
          <h4 className="font-bold text-sm text-primary flex items-center gap-1.5 mb-2">
            <UserCheck className="w-4 h-4" /> Available On Campus Right Now ({campusFreeFriends.length})
          </h4>
          {campusFreeFriends.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {campusFreeFriends.map((st) => (
                <span key={st.user.id} className="badge badge-success gap-1 text-xs py-2 px-3 font-medium">
                  🟢 {st.user.fullName} (Free)
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs opacity-70">No friends are currently free on campus right now.</p>
          )}
        </div>

        {/* Group Selector & Manager */}
        <div className="bg-base-200 p-4 rounded-xl border border-base-300 mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="w-full sm:w-1/2">
              <label className="text-xs font-semibold opacity-70 mb-1 block">Select Circle / Group</label>
              <select
                className="select select-bordered w-full text-sm"
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
              >
                <option value="ALL">🌐 All Registered Friends</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    👥 {g.name} ({g.members.length} members)
                  </option>
                ))}
              </select>
            </div>

            {currentGroup && (
              <div className="text-xs space-y-1">
                <span className="opacity-70">Group Code:</span>
                <div className="flex items-center gap-1 font-mono font-bold bg-base-100 px-2 py-1 rounded border border-base-300">
                  <span>{currentGroup.id}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentGroup.id);
                      setCopiedId(true);
                      setTimeout(() => setCopiedId(false), 2000);
                    }}
                    className="btn btn-ghost btn-xs btn-square"
                  >
                    {copiedId ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-base-300">
            <form onSubmit={handleCreateGroup} className="flex gap-2">
              <input
                type="text"
                placeholder="New Group Name"
                className="input input-bordered input-sm w-full text-xs"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm gap-1">
                <Plus className="w-3.5 h-3.5" /> Create
              </button>
            </form>

            <form onSubmit={handleJoinGroup} className="flex gap-2">
              <input
                type="text"
                placeholder="Paste Group ID to Join"
                className="input input-bordered input-sm w-full text-xs"
                value={joinGroupId}
                onChange={(e) => setJoinGroupId(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary btn-sm">
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Member Status List */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-secondary" /> {selectedGroupId === 'ALL' ? 'All Registered Users' : 'Group Members'} ({liveStatuses.length})
          </h4>

          {loading ? (
            <div className="text-center py-6">
              <span className="loading loading-spinner text-primary"></span>
            </div>
          ) : liveStatuses.length === 0 ? (
            <p className="text-xs opacity-60 italic text-center py-4">No members found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
              {liveStatuses.map((st) => (
                <div key={st.user.id} className="bg-base-200 p-3 rounded-xl border border-base-300 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-sm block">{st.user.fullName}</span>
                    <span className="opacity-60 block">{st.user.email}</span>
                    {st.user.phone && (
                      <span className="font-mono text-[11px] text-primary block mt-0.5">📞 {st.user.phone}</span>
                    )}
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={`badge badge-xs ${st.user.campusStatus === 'ON_CAMPUS' ? 'badge-success' : 'badge-ghost'}`}>
                        {st.user.campusStatus === 'ON_CAMPUS' ? 'On Campus' : 'Off Campus'}
                      </span>
                      {st.isCurrentlyFree ? (
                        <span className="badge badge-xs badge-info">Free Now</span>
                      ) : (
                        <span className="badge badge-xs badge-error">In Class: {st.currentClass?.courseCode}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {/* 1. Remove from Group Button (When a specific group is selected) */}
                    {selectedGroupId !== 'ALL' && (canManageMembers || st.user.id === currentUser.id) && (
                      <button
                        onClick={() => handleRemoveMember(st.user.id)}
                        className="btn btn-ghost btn-xs text-error hover:bg-error/10 gap-1"
                        title={st.user.id === currentUser.id ? "Leave Group" : "Remove Member"}
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* 2. Admin Complete Delete Button (When ALL registered is selected & Admin is logged in) */}
                    {selectedGroupId === 'ALL' && isAdmin && st.user.id !== currentUser.id && (
                      <button
                        onClick={() => handleDeleteUserCompletely(st.user.id, st.user.fullName)}
                        className="btn btn-ghost btn-xs text-error hover:bg-error/10 gap-1"
                        title="Delete User Completely (Admin)"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-action">
          <button onClick={onClose} className="btn btn-primary btn-sm">Close</button>
        </div>
      </div>
    </div>
  );
};