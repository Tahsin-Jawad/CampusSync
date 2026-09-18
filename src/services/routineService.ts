import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { CourseSlot } from '../types';

export const saveUserRoutine = async (userId: string, slots: CourseSlot[]) => {
  const routineRef = doc(db, 'routines', userId);
  await setDoc(routineRef, {
    userId,
    updatedAt: new Date().toISOString(),
    slots,
  });
};

export const getUserRoutine = async (userId: string): Promise<CourseSlot[]> => {
  const routineRef = doc(db, 'routines', userId);
  const routineSnap = await getDoc(routineRef);
  if (routineSnap.exists()) {
    return routineSnap.data().slots as CourseSlot[];
  }
  return [];
};