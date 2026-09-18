import React, { useState, useEffect } from 'react';
import { auth, db } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getUserRoutine, saveUserRoutine } from './services/routineService';
import { getAllFriendsRoutines, updateUserStatus } from './services/userService';
import { getUserGroups } from './services/groupService';
import { RoutineUploader } from './components/RoutineUploader';
import { RoutineTable } from './components/RoutineTable';
import { AddCourseModal } from './components/AddCourseModal';
import { AuthModal } from './components/AuthModal';
import { GroupManagerModal } from './components/GroupManagerModal';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import type { UserProfile, CourseSlot, Group } from './types';
import { Phone, Clock } from 'lucide-react';

const DAYS: CourseSlot['day'][] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [routineSlots, setRoutineSlots] = useState<CourseSlot[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [friendsData, setFriendsData] = useState<{ profile: UserProfile; slots: CourseSlot[] }[]>([]);
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<CourseSlot | null>(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const profile = userSnap.data() as UserProfile;
          setUser(profile);
          setPhoneInput(profile.phone || '');
        } else {
          const newProfile: UserProfile = {
            id: firebaseUser.uid,
            fullName: firebaseUser.displayName || 'EWU Student',
            email: firebaseUser.email || '',
            campusStatus: 'ON_CAMPUS',
            isPublic: true,
          };
          await setDoc(userDocRef, newProfile);
          setUser(newProfile);
        }

        const slots = await getUserRoutine(firebaseUser.uid);
        setRoutineSlots(slots);

        const groups = await getUserGroups(firebaseUser.uid);
        setUserGroups(groups);

        const friends = await getAllFriendsRoutines(firebaseUser.uid);
        setFriendsData(friends);
      } else {
        setUser(null);
        setRoutineSlots([]);
        setUserGroups([]);
        setFriendsData([]);
        setIsAuthOpen(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleRoutineParsed = async (newSlots: CourseSlot[]) => {
    // Fixed: Overwrite previous slots completely instead of appending/duplicating
    setRoutineSlots(newSlots);
    if (user) {
      await saveUserRoutine(user.id, newSlots);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    const updated = routineSlots.filter((s) => s.id !== slotId);
    setRoutineSlots(updated);
    if (user) {
      await saveUserRoutine(user.id, updated);
    }
  };

  const handleSaveSlot = async (slot: CourseSlot) => {
    let updated: CourseSlot[];
    if (editingSlot) {
      updated = routineSlots.map((s) => (s.id === slot.id ? slot : s));
    } else {
      updated = [...routineSlots, slot];
    }
    setRoutineSlots(updated);
    if (user) {
      await saveUserRoutine(user.id, updated);
    }
  };

  const handleStatusToggle = async () => {
    if (!user) return;
    const newStatus: 'ON_CAMPUS' | 'OFF_CAMPUS' = user.campusStatus === 'ON_CAMPUS' ? 'OFF_CAMPUS' : 'ON_CAMPUS';
    const updated: UserProfile = { ...user, campusStatus: newStatus };
    setUser(updated);
    await updateUserStatus(user.id, newStatus);
  };

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdatingPhone(true);
    const userDocRef = doc(db, 'users', user.id);
    await updateDoc(userDocRef, { phone: phoneInput });
    setUser({ ...user, phone: phoneInput });
    setIsUpdatingPhone(false);
    alert('Phone number saved successfully!');
  };

  // Current time calculation for free status check
  const now = new Date();
  const dayName = DAYS[now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Group members ID collection
  const userGroupMemberIds = new Set<string>();
  userGroups.forEach((g) => g.members.forEach((m) => userGroupMemberIds.add(m)));

  const freeGroupFriends = friendsData.filter((f) => {
    if (user && f.profile.id === user.id) return false;
    const isInMyGroup = userGroupMemberIds.size === 0 || userGroupMemberIds.has(f.profile.id);
    if (!isInMyGroup) return false;

    const todaySlots = f.slots.filter((s) => s.day === dayName);
    const parseToMins = (tStr: string) => {
      const m = tStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!m) return 0;
      let h = parseInt(m[1]); const min = parseInt(m[2]);
      if (m[3].toUpperCase() === 'PM' && h < 12) h += 12;
      if (m[3].toUpperCase() === 'AM' && h === 12) h = 0;
      return h * 60 + min;
    };

    let inClass = false;
    todaySlots.forEach((s) => {
      const start = parseToMins(s.startTime);
      const end = parseToMins(s.endTime);
      if (currentMinutes >= start && currentMinutes <= end) inClass = true;
    });

    return !inClass;
  });

  return (
    <div className="min-h-screen bg-base-100 flex flex-col justify-between text-base-content">
      <Navbar 
        user={user} 
        onOpenAuth={() => setIsAuthOpen(true)} 
        onOpenGroups={() => setIsGroupModalOpen(true)} 
      />

      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6 flex-grow">
        {user && (
          <div className="bg-gradient-to-r from-primary/25 via-secondary/15 to-base-200 p-6 rounded-3xl border border-primary/20 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black">Welcome, {user.fullName}! 👋</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs opacity-75">Status:</span>
                <button 
                  onClick={handleStatusToggle}
                  className={`badge gap-1 cursor-pointer font-semibold py-2 px-3 ${user.campusStatus === 'ON_CAMPUS' ? 'badge-success text-white' : 'badge-ghost'}`}
                >
                  {user.campusStatus === 'ON_CAMPUS' ? '🟢 On Campus' : '⚪ Off Campus'}
                </button>
              </div>
            </div>

            {/* Quick Phone Number Form */}
            <form onSubmit={handleSavePhone} className="flex items-center gap-2 bg-base-100/70 backdrop-blur p-2 rounded-2xl border border-base-300">
              <input
                type="text"
                placeholder="Add Phone (e.g. 017XXXXXXXX)"
                className="input input-bordered input-xs w-40 text-xs"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
              />
              <button type="submit" disabled={isUpdatingPhone} className="btn btn-primary btn-xs">
                {isUpdatingPhone ? 'Saving...' : 'Save Phone'}
              </button>
            </form>
          </div>
        )}

        {/* Main Grid Layout: Left Side Routine, Right Side Live Free Friends Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Columns: Uploader & Routine Table */}
          <div className="lg:col-span-2 space-y-6">
            <RoutineUploader
              onRoutineParsed={handleRoutineParsed}
              onOpenManualForm={() => {
                setEditingSlot(null);
                setIsAddModalOpen(true);
              }}
            />
            <RoutineTable
              slots={routineSlots}
              onEditSlot={(slot) => {
                setEditingSlot(slot);
                setIsAddModalOpen(true);
              }}
              onDeleteSlot={handleDeleteSlot}
            />
          </div>

          {/* Right 1 Column: Permanent Live Free Friends Sidebar */}
          <div className="space-y-4">
            <div className="bg-base-200 p-5 rounded-2xl border border-base-300 shadow-sm sticky top-6">
              <h3 className="font-bold text-sm flex items-center gap-2 mb-4 text-success">
                <span className="w-2.5 h-2.5 rounded-full bg-success animate-ping"></span>
                Free in Your Groups Right Now
              </h3>

              {freeGroupFriends.length > 0 ? (
                <div className="space-y-3">
                  {freeGroupFriends.map((f) => (
                    <div key={f.profile.id} className="bg-base-100 p-3 rounded-xl border border-base-300 flex justify-between items-center text-xs shadow-sm">
                      <div>
                        <span className="font-bold text-sm block">{f.profile.fullName}</span>
                        <span className="text-[11px] opacity-60">
                          {f.profile.campusStatus === 'ON_CAMPUS' ? '🟢 On Campus' : '⚪ Off Campus'}
                        </span>
                      </div>
                      
                      {f.profile.phone ? (
                        <a
                          href={`tel:${f.profile.phone}`}
                          className="btn btn-success btn-xs gap-1 text-white shadow"
                          title="Call Friend"
                        >
                          <Phone className="w-3 h-3" /> Call
                        </a>
                      ) : (
                        <span className="text-[10px] opacity-40 italic">No phone</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 space-y-2">
                  <Clock className="w-8 h-8 opacity-30 mx-auto" />
                  <p className="text-xs opacity-60 italic">
                    No group members are currently free right now, or you haven't joined any group yet.
                  </p>
                  <button 
                    onClick={() => setIsGroupModalOpen(true)}
                    className="btn btn-primary btn-xs mt-2"
                  >
                    Manage Groups
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <Footer />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      {user && (
        <>
          <GroupManagerModal
            isOpen={isGroupModalOpen}
            onClose={() => setIsGroupModalOpen(false)}
            currentUser={user}
            userSlots={routineSlots}
          />
          <AddCourseModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSaveSlot={handleSaveSlot}
            initialData={editingSlot}
          />
        </>
      )}
    </div>
  );
}