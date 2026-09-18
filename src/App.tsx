import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Users, UserCheck } from 'lucide-react';
import { auth, db } from './services/firebase';
import { saveUserRoutine, getUserRoutine } from './services/routineService';
import { updateUserStatus } from './services/userService';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { RoutineUploader } from './components/RoutineUploader';
import { RoutineTable } from './components/RoutineTable';
import { AddCourseModal } from './components/AddCourseModal';
import { FriendScheduleModal } from './components/FriendScheduleModal';
import { GroupManagerModal } from './components/GroupManagerModal';
import type { UserProfile, CourseSlot } from './types';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [routineSlots, setRoutineSlots] = useState<CourseSlot[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<CourseSlot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as UserProfile);
        } else {
          setUser({
            id: currentUser.uid,
            fullName: currentUser.displayName || 'User',
            email: currentUser.email || '',
            isPublic: true,
            campusStatus: 'ON_CAMPUS'
          });
        }

        const savedSlots = await getUserRoutine(currentUser.uid);
        setRoutineSlots(savedSlots);
      } else {
        setUser(null);
        setRoutineSlots([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleToggleStatus = async () => {
    if (!user) return;
    const newStatus = user.campusStatus === 'ON_CAMPUS' ? 'OFF_CAMPUS' : 'ON_CAMPUS';
    setUser({ ...user, campusStatus: newStatus });
    await updateUserStatus(user.id, newStatus);
  };

  const handleRoutineParsed = async (slots: CourseSlot[]) => {
    setRoutineSlots(slots);
    if (user) {
      await saveUserRoutine(user.id, slots);
    }
  };

  const handleSaveSlot = async (slot: CourseSlot) => {
    let updated: CourseSlot[];
    const exists = routineSlots.some((s) => s.id === slot.id);

    if (exists) {
      updated = routineSlots.map((s) => (s.id === slot.id ? slot : s));
    } else {
      updated = [...routineSlots, slot];
    }

    setRoutineSlots(updated);
    setEditingSlot(null);
    if (user) {
      await saveUserRoutine(user.id, updated);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    const updated = routineSlots.filter((s) => s.id !== id);
    setRoutineSlots(updated);
    if (user) {
      await saveUserRoutine(user.id, updated);
    }
  };

  const handleOpenEdit = (slot: CourseSlot) => {
    setEditingSlot(slot);
    setIsAddModalOpen(true);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-base-100 text-base-content">
      <div className="navbar bg-base-200 border-b border-base-300 px-4 sm:px-8">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl font-bold tracking-wide">CampusSync</a>
        </div>
        <div className="flex-none gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <button onClick={() => setIsGroupModalOpen(true)} className="btn btn-primary btn-sm gap-1.5 rounded-lg">
                <Users className="w-4 h-4" />
                <span>Friend Circles</span>
              </button>
              <button onClick={() => setIsFriendModalOpen(true)} className="btn btn-outline btn-sm gap-1.5 rounded-lg">
                <UserCheck className="w-4 h-4 text-primary" />
                <span>Routine Matcher</span>
              </button>
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder">
                  <div className="bg-neutral text-neutral-content rounded-full w-10">
                    <span className="text-xs font-bold">{user.fullName.charAt(0)}</span>
                  </div>
                </label>
                <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                  <li className="menu-title px-4 py-2">
                    <p className="font-bold text-sm text-base-content">{user.fullName}</p>
                    <p className="text-xs opacity-60">{user.email}</p>
                  </li>
                  <div className="divider my-0"></div>
                  <li><button onClick={handleLogout} className="text-error">Logout</button></li>
                </ul>
              </div>
            </div>
          ) : (
            <button className="btn btn-primary btn-sm rounded-lg" onClick={() => setIsAuthModalOpen(true)}>
              Login / Register
            </button>
          )}
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {user ? (
          <>
            <div className="bg-primary/10 border border-primary/20 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  Welcome, {user.fullName}! 👋
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm opacity-80">Status:</span>
                  <button 
                    onClick={handleToggleStatus} 
                    className={`badge ${user.campusStatus === 'ON_CAMPUS' ? 'badge-success' : 'badge-ghost'} gap-1 cursor-pointer hover:scale-105 transition-transform`}
                  >
                    {user.campusStatus === 'ON_CAMPUS' ? '🟢 On Campus' : '⚪ Off Campus'}
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsGroupModalOpen(true)} className="btn btn-primary btn-sm rounded-lg gap-2">
                  <Users className="w-4 h-4" /> Live Friend Status
                </button>
              </div>
            </div>

            <RoutineUploader 
              onRoutineParsed={handleRoutineParsed} 
              onOpenManualForm={() => {
                setEditingSlot(null);
                setIsAddModalOpen(true);
              }}
            />
            <RoutineTable 
              slots={routineSlots} 
              onEditSlot={handleOpenEdit} 
              onDeleteSlot={handleDeleteSlot} 
            />
          </>
        ) : (
          <div className="text-center py-20 space-y-4">
            <h1 className="text-4xl font-extrabold">Welcome to CampusSync</h1>
            <p className="text-lg opacity-70">Connect with your campus routines, groups, and schedules seamlessly.</p>
            <button className="btn btn-primary rounded-xl px-8" onClick={() => setIsAuthModalOpen(true)}>
              Get Started
            </button>
          </div>
        )}
      </main>

      <Footer />

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <AddCourseModal 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingSlot(null);
        }} 
        onSaveSlot={handleSaveSlot} 
        initialData={editingSlot}
      />
      <FriendScheduleModal 
        isOpen={isFriendModalOpen} 
        onClose={() => setIsFriendModalOpen(false)} 
        userSlots={routineSlots} 
        currentUserId={user.id}
      />
      {user && (
        <GroupManagerModal
          isOpen={isGroupModalOpen}
          onClose={() => setIsGroupModalOpen(false)}
          currentUser={user}
          userSlots={routineSlots}
        />
      )}
    </div>
  );
}