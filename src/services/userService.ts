import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, CourseSlot } from '../types';

export interface FriendWithRoutine {
  profile: UserProfile;
  slots: CourseSlot[];
}

export const getAllFriendsRoutines = async (currentUserId: string): Promise<FriendWithRoutine[]> => {
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    const friends: FriendWithRoutine[] = [];

    for (const userDoc of usersSnap.docs) {
      if (userDoc.id === currentUserId) continue;

      const userData = userDoc.data() as UserProfile;
      const routineSnap = await getDocs(collection(db, 'routines'));
      const userRoutineDoc = routineSnap.docs.find((d) => d.id === userDoc.id);

      const slots: CourseSlot[] = userRoutineDoc ? (userRoutineDoc.data().slots as CourseSlot[]) : [];

      friends.push({
        profile: userData,
        slots,
      });
    }

    return friends;
  } catch (error) {
    console.error('Error fetching friends routines:', error);
    return [];
  }
};

export const updateUserStatus = async (userId: string, status: 'ON_CAMPUS' | 'OFF_CAMPUS') => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { campusStatus: status });
};